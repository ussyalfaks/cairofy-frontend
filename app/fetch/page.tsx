"use client";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useContract, useReadContract, useSendTransaction, useAccount } from "@starknet-react/core";
import { CAIROFY_ABI, CAIROFY_CONTRACT_ADDRESS } from "@/constants/contrat";
import { shortString } from "starknet";
import Navbar from "@/components/layouts/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Pause } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Volume2 } from "lucide-react";
import { VolumeX } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { SlidersHorizontal } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Song = {
  id: number;
  name: string;
  ipfsHash: string;
  previewIpfsHash: string;
  price: bigint;
  owner: string;
  forSale: boolean;
};

// Fallback image in case IPFS fails
const FALLBACK_IMAGE = '/images/music-placeholder.jpg';

// Available IPFS Gateways
const IPFS_GATEWAYS = [
  // 'https://coral-chemical-peacock-81.mypinata.cloud/ipfs/',
  'https://amber-voluntary-possum-989.mypinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
];

// Helper function to get IPFS gateway URL from hash
const getIPFSUrl = async (ipfsHash: string, isAudio = false): Promise<string> => {
  if (!ipfsHash || ipfsHash === 'Invalid data') {
    return isAudio ? '' : FALLBACK_IMAGE;
  }

  // Clean the hash (remove ipfs:// prefix if present)
  const cleanHash = ipfsHash.startsWith('ipfs://') ? ipfsHash.slice(7) : ipfsHash;
  
  try {
    // First try our API which might have additional optimizations
    try {
      const response = await fetch(`/api/ipfs?cid=${encodeURIComponent(cleanHash)}&mimeType=${isAudio ? 'audio/mpeg' : 'image/*'}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.gateways && data.gateways.length > 0) {
          // Return the first gateway URL - ensure it has https:// prefix
          console.log(`Using API gateway for ${cleanHash}`);
          const url = data.gateways[0];
          
          // Make sure URL starts with http:// or https://
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
          } else if (url.includes('/ipfs/')) {
            // Fix URLs that are missing the protocol
            return `https://${url}`;
          } else {
            return `https://${IPFS_GATEWAYS[0]}${cleanHash}`;
          }
        }
      }
    } catch (error) {
      console.warn("IPFS API error, trying direct gateways");
    }
    
    // If API fails, use our list of gateways directly
    const gatewayUrl = `${IPFS_GATEWAYS[0]}${cleanHash}`;
    // Ensure the URL has https:// prefix
    return gatewayUrl.startsWith('http') ? gatewayUrl : `https://${gatewayUrl}`;
  } catch (error) {
    console.error("All IPFS gateway attempts failed:", error);
    return isAudio ? '' : FALLBACK_IMAGE;
  }
};

// Add a memoization cache to avoid repeated API calls for the same hash
const ipfsUrlCache: Record<string, string> = {};

// Cached version of getIPFSUrl
const getCachedIPFSUrl = async (ipfsHash: string, isAudio = false): Promise<string> => {
  if (!ipfsHash) return isAudio ? '' : FALLBACK_IMAGE;
  
  // Check cache first with audio type consideration
  const cacheKey = `${ipfsHash}-${isAudio ? 'audio' : 'image'}`;
  if (ipfsUrlCache[cacheKey]) {
    return ipfsUrlCache[cacheKey];
  }
  
  // Get the URL
  const url = await getIPFSUrl(ipfsHash, isAudio);
  
  // Cache it
  ipfsUrlCache[cacheKey] = url;
  
  return url;
};

// Function to handle ByteArray-specific decoding for strings
const extractByteArrayText = (byteArray: unknown): string => {
  // If it's not a ByteArray-like object, return empty
  if (!byteArray || typeof byteArray !== 'object') {
    return '';
  }
  
  try {
    // The ByteArray structure in Cairo has specific properties:
    // 1. 'data' - An array of bytes31 chunks
    // 2. 'pending_word' - Any remaining data in a felt252
    // 3. 'pending_word_len' - Length of the pending word
    
    let result = '';
    const byteArrayObj = byteArray as Record<string, unknown>;
    
    // Process the data array (main content)
    if (byteArrayObj.data && Array.isArray(byteArrayObj.data)) {
      for (const chunk of byteArrayObj.data) {
        if (chunk) {
          try {
            // For felt252 values, we need to decode them
            result += shortString.decodeShortString(chunk.toString());
          } catch {
            // If decoding fails, try using the raw string
            const rawChunk = chunk.toString();
            if (rawChunk && typeof rawChunk === 'string' && rawChunk.length > 0) {
              result += rawChunk;
            }
          }
        }
      }
    }
    
    // Process any pending word
    if (byteArrayObj.pending_word && byteArrayObj.pending_word_len) {
      try {
        // Only if it has actual content (pending_word_len > 0)
        if (Number(byteArrayObj.pending_word_len) > 0) {
          result += shortString.decodeShortString(byteArrayObj.pending_word.toString());
        }
      } catch (_) {
        // If decoding fails, try using the raw string
        const pendingWord = byteArrayObj.pending_word.toString();
        if (pendingWord && pendingWord.length > 0) {
          result += pendingWord;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error extracting ByteArray text:", error);
    return '';
  }
};

// Simple ByteArray decoder - fallback for various use cases
const decodeByteArray = (byteArray: unknown): string => {
  // First try our specialized extractor
  const extracted = extractByteArrayText(byteArray);
  if (extracted && extracted.length > 0) {
    return extracted;
  }
  
  // Fallback: try simple toString approach
  try {
    if (byteArray && typeof byteArray === 'object' && 'toString' in byteArray && typeof byteArray.toString === 'function') {
      const str = byteArray.toString();
      // Try to decode if it looks like a felt
      try {
        return shortString.decodeShortString(str);
      } catch {
        return str; // Return as-is if decoding fails
      }
    }
  } catch (error) {
    console.error("Error in basic decodeByteArray:", error);
  }
  
  return '';
};

// Update the decodeSongName function to better handle ByteArray
const decodeSongName = (nameData: unknown, songId: number): string => {
  console.log(`Decoding name for Song ID ${songId}:`, nameData);
  
  // First attempt to use our specialized ByteArray extractor
  const extractedName = extractByteArrayText(nameData);
  if (extractedName && extractedName.length > 0) {
    console.log(`Successfully extracted name text for Song ID ${songId}:`, extractedName);
    return extractedName;
  }
  
  // Handle direct string case from contract
  if (typeof nameData === 'string') {
    return nameData;
  }
  
  // Handle number case
  if (typeof nameData === 'number') {
    return `Song ${nameData}`;
  }
  
  // Try to access data directly if present in this format
  if (nameData && typeof nameData === 'object' && nameData !== null) {
    const nameDataObj = nameData as Record<string, unknown>;
    if ('data' in nameDataObj && nameDataObj.data) {
      try {
        // Check if it's an array of bytes31
        if (Array.isArray(nameDataObj.data)) {
          let text = '';
          for (const chunk of nameDataObj.data) {
            if (chunk) {
              // Try decoding as shortString first
              try {
                text += shortString.decodeShortString(chunk.toString());
              } catch {
                // Just append the raw chunk if decoding fails
                text += chunk.toString();
              }
            }
          }
          if (text) return text;
        }
      } catch (error) {
        console.error(`Error processing data array for song ${songId}:`, error);
      }
    }
  }
  
  // If nameData is an object with a name property, use that
  if (nameData && typeof nameData === 'object' && nameData !== null && 'name' in nameData) {
    const nameDataObj = nameData as Record<string, unknown>;
    return String(nameDataObj.name);
  }
  
  // Last resort: use a generic name with the ID
  return `Song ${songId}`;
};

// Create a SongCard component that handles async IPFS URLs
const SongCard = ({ 
  song, 
  isCurrentlyPlaying, 
  isCurrentSong, 
  loadingAudio,
  onPlay,
  onBuy,
  isOwned,
  currentTime,
  duration,
  isMuted,
  onToggleMute,
  formatTime,
  formatPrice,
  isPlayingFullVersion,
  hasUserSubscription
}: { 
  song: Song;
  isCurrentlyPlaying: boolean;
  isCurrentSong: boolean;
  loadingAudio: boolean;
  onPlay: (song: Song, playFullVersion?: boolean) => void;
  onBuy: (songId: number) => void;
  isOwned: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  onToggleMute: () => void;
  formatTime: (time: number) => string;
  formatPrice: (price: bigint) => string;
  isPlayingFullVersion: boolean;
  hasUserSubscription: boolean;
}) => {
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [fallbackGatewayIndex, setFallbackGatewayIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Load the cover image URL asynchronously
  useEffect(() => {
    let isMounted = true;
    
    const loadCoverUrl = async () => {
      try {
        const url = await getCachedIPFSUrl(song.ipfsHash, false);
        if (isMounted) {
          // Ensure URL always has proper protocol
          if (url && !url.startsWith('http') && url !== FALLBACK_IMAGE) {
            setCoverUrl(`https://${url}`);
          } else {
            setCoverUrl(url);
          }
        }
      } catch (error) {
        console.error("Error loading cover URL:", error);
        if (isMounted) {
          setCoverUrl(FALLBACK_IMAGE);
        }
      }
    };
    
    loadCoverUrl();
    
    return () => {
      isMounted = false;
    };
  }, [song.ipfsHash]);

  // Handle image loading error by trying next gateway
  const handleImageError = () => {
    console.warn(`Failed to load image for song ${song.id} from ${coverUrl}`);
    
    // If we already tried all gateways, use fallback image
    if (fallbackGatewayIndex >= IPFS_GATEWAYS.length - 1) {
      setCoverUrl(FALLBACK_IMAGE);
      return;
    }
    
    // Try next gateway
    const nextIndex = fallbackGatewayIndex + 1;
    setFallbackGatewayIndex(nextIndex);
    
    // Clean the hash from the current URL to get just the hash part
    if (song.ipfsHash) {
      const cleanHash = song.ipfsHash.startsWith('ipfs://') 
        ? song.ipfsHash.slice(7) 
        : song.ipfsHash;
        
      // Use next gateway
      const newUrl = `${IPFS_GATEWAYS[nextIndex]}${cleanHash}`;
      console.log(`Trying next gateway for song ${song.id}:`, newUrl);
      setCoverUrl(newUrl);
    } else {
      setCoverUrl(FALLBACK_IMAGE);
    }
  };
  
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
      <div className="relative aspect-square">
        <Image 
          src={coverUrl || FALLBACK_IMAGE}
          alt={song.name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
          priority={song.id < 6} // Prioritize loading first 6 images
          onError={handleImageError}
          onLoad={() => setImageLoaded(true)}
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Always play preview version first
            onPlay(song, false);
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
        >
          {loadingAudio && isCurrentSong ? (
            <div className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : isCurrentlyPlaying ? (
            <Pause className="h-16 w-16 text-white" />
          ) : (
            <Play className="h-16 w-16 text-white" />
          )}
        </button>
        
        {isCurrentSong && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white text-xs">
              <span>{formatTime(currentTime)}</span>
              <button onClick={onToggleMute} className="p-1">
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-white/80" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white/80" />
                )}
              </button>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-white/20 h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            
            {/* Playing version badge */}
            <div className="mt-2 flex justify-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isPlayingFullVersion
                  ? 'bg-green-500/30 text-green-300'
                  : 'bg-blue-500/30 text-blue-300'
              }`}>
                {isPlayingFullVersion ? 'Full Version' : 'Preview'}
              </span>
            </div>
            
            {/* Preview countdown for non-owned songs */}
            {!isPlayingFullVersion && !isOwned && !hasUserSubscription && (
              <div className="mt-2 flex justify-center">
                <div className="px-2 py-1 bg-yellow-500/30 text-yellow-300 rounded-full text-xs font-medium flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse mr-1"></div>
                  Preview ends in {Math.max(0, 20 - Math.floor(currentTime))}s
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Ownership badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isOwned
              ? 'bg-green-500/30 text-green-300'
              : 'bg-gray-500/30 text-gray-300'
          }`}>
            {isOwned ? 'Owned' : 'Not Owned'}
          </span>
        </div>
        
        {/* Loading indicator while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <Link href={`/songDetails?id=${song.id}`}>
          <h2 className="text-xl font-bold text-white hover:text-primary transition-colors mb-1 truncate">
            {song.name}
          </h2>
        </Link>
        
        <p className="text-white/60 mb-4 truncate">
          Track #{song.id}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            song.forSale 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {song.forSale ? 'For Sale' : 'Not For Sale'}
          </span>
          <span className="text-primary font-semibold">
            {formatPrice(song.price)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay(song, false);
              }}
              className="text-primary/80 hover:text-primary flex items-center text-xs"
            >
              Play Preview <Play className="ml-1 h-3 w-3" />
            </button>
            
            {song.ipfsHash && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay(song, true);
                }}
                className={`${isOwned ? "text-green-500/80 hover:text-green-500" : "text-blue-400/80 hover:text-blue-400"} flex items-center text-xs ml-3`}
              >
                {isOwned || hasUserSubscription ? 
                  "Play Full" : 
                  "Play Full (20s Preview)"}
                <Play className="ml-1 h-3 w-3" />
              </button>
            )}
          </div>
          
          {song.forSale && !isOwned && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBuy(song.id);
              }}
              className="bg-primary text-white px-3 py-1 rounded-full transition-colors hover:bg-primary/90 text-sm"
            >
              Buy Now
            </button>
          )}
          
          {isOwned && (
            <span className="text-green-500 text-xs flex items-center">
              <CheckCircle className="mr-1 h-3 w-3" /> You own this
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Subscribe Modal Component
const SubscribeModal = ({ 
  isOpen, 
  onClose, 
  song, 
  onBuy, 
  onSubscribe,
  isLoading
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  song: Song | null;
  onBuy: (songId: number) => void;
  onSubscribe: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen || !song) return null;
  
  // Prevent closing when clicking buttons
  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (song) {
      onBuy(song.id);
    }
    // Do not close modal here - this will be handled by the transaction logic
  };
  
  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubscribe();
    // Do not close modal here - this will be handled by the transaction logic
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Continue Listening</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            You&apos;ve reached the preview limit for <span className="text-primary font-semibold">{song.name}</span>.
          </p>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 text-center">
            Choose an option below to continue listening:
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleBuy}
              disabled={isLoading}
              className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : null}
              Buy this song for {(Number(song.price) / 10**18).toFixed(2)} STARK
            </button>
            
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : null}
              Subscribe for unlimited access
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-xs text-center">
          Subscription gives you access to all songs on the platform.
        </p>
      </div>
    </div>
  );
};

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [failedAudioUrls, setFailedAudioUrls] = useState<Record<string, boolean>>({});
  const [isPlayingFullVersion, setIsPlayingFullVersion] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [currentModalSong, setCurrentModalSong] = useState<Song | null>(null);
  const [hasUserSubscription, setHasUserSubscription] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] = useState<'buy' | 'subscribe' | null>(null);

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popular');
  const [songGenres, setSongGenres] = useState<Record<string, string>>({});
  const [streamCounts, setStreamCounts] = useState<Record<string, number>>({});
  const [artistNames, setArtistNames] = useState<Record<string, string>>({});

  // List of genres for random assignment - wrap in useMemo to avoid dependency issues
  const genres = useMemo(() => ['Electronic', 'Pop', 'Hip Hop', 'Rock', 'Jazz', 'Blues', 'Classical'], []);

  const { sendAsync } = useSendTransaction({ calls: [] });
  const { contract } = useContract({
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });
  const { address } = useAccount();

  const { data, isFetching, error } = useReadContract({
    abi: CAIROFY_ABI,
    address: CAIROFY_CONTRACT_ADDRESS,
    functionName: "get_all_songs",
    args: [],
  });

  const { data: userSubscriptionData } = useReadContract({
    abi: CAIROFY_ABI,
    address: CAIROFY_CONTRACT_ADDRESS,
    functionName: "get_user_subscription",
    args: address ? [address] : undefined,
    enabled: Boolean(address),
  });

  // Helper to check if the current wallet owns the song
  const isOwnedByUser = useCallback((songOwner: string): boolean => {
    if (!userWallet || !songOwner) return false;
    return userWallet.toLowerCase() === songOwner.toLowerCase();
  }, [userWallet]);

  // Check if subscription is valid
  useEffect(() => {
    if (userSubscriptionData) {
      try {
        const currentDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const subscriptionExpiryDate = Number(userSubscriptionData.expiry_date);
        
        // Check if subscription is active
        const isActive = subscriptionExpiryDate > currentDate;
        setHasUserSubscription(isActive);
        console.log('Subscription status:', isActive, 'Expires:', new Date(subscriptionExpiryDate * 1000).toLocaleDateString());
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasUserSubscription(false);
      }
    } else {
      setHasUserSubscription(false);
    }
  }, [userSubscriptionData]);

  // Time limit effect for non-owned songs
  useEffect(() => {
    // Skip if no song is playing or user has a subscription
    if (!playingSongId || !isPlaying || hasUserSubscription) return;
    
    const currentSong = songs.find(s => s.id === playingSongId);
    if (!currentSong) return;
    
    // Check if the user owns this song
    const isOwned = isOwnedByUser(currentSong.owner);
    if (isOwned) return; // No time limit for owned songs
    
    // Set up timer to check if we hit the 20-second limit
    const checkInterval = setInterval(() => {
      if (audioRef.current && audioRef.current.currentTime > 20) {
        // Pause playback
        audioRef.current.pause();
        setIsPlaying(false);
        
        // Show the subscription modal with the current song
        setCurrentModalSong(currentSong);
        setShowSubscribeModal(true);
        
        // Clear the interval
        clearInterval(checkInterval);
      }
    }, 1000); // Check every second
    
    return () => {
      // Only clear the interval, don't pause playback when unmounting
      clearInterval(checkInterval);
    };
  }, [playingSongId, isPlaying, songs, hasUserSubscription, isOwnedByUser]);

  // Update user wallet when address changes
  useEffect(() => {
    if (address) {
      setUserWallet(`0x${BigInt(address).toString(16).padStart(64, '0')}`);
    } else {
      setUserWallet(null);
    }
  }, [address]);

  useEffect(() => {
    // Stop audio when unmounting component
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      try {
        console.log("Raw song data from contract:", data);
        
      const parsedSongs = data.map((song: any) => {
          try {
            // Extract numerical ID
            const id = Number(song.id);
            
            // Decode song name with enhanced error handling
            let name = decodeSongName(song.name, id);
            
            // Avoid showing empty or purely numeric names
            if (!name || name.trim() === '' || (!isNaN(Number(name)) && !name.includes('Song'))) {
              console.warn(`Song ${id} has invalid name: "${name}". Using fallback.`);
              name = `Unknown Song ${id}`;
            }
            
            // Decode IPFS hashes with better error handling
            let ipfsHash = "";
            try {
              ipfsHash = decodeByteArray(song.ipfs_hash);
            } catch (e) {
              console.error(`Error decoding ipfs_hash for song ${id}:`, e);
            }
            
            let previewIpfsHash = "";
            try {
              previewIpfsHash = decodeByteArray(song.preview_ipfs_hash);
            } catch (e) {
              console.error(`Error decoding preview_ipfs_hash for song ${id}:`, e);
            }
            
            // Extract price (handles both object and primitive formats)
            const price = BigInt(
              typeof song.price === 'object' && 'low' in song.price 
                ? song.price.low 
                : typeof song.price === 'object' 
                  ? song.price.toString() 
                  : song.price
            );
            
            // Format the owner address
            const owner = `0x${BigInt(song.owner).toString(16).padStart(64, '0')}`;
            
            // Determine if for sale
            const forSale = Boolean(song.for_sale);
            
            // Log successful parsing
            console.log(`Successfully parsed song ${id}:`, {name, ipfsHash, previewIpfsHash});

        return {
              id,
          name,
          ipfsHash,
          previewIpfsHash,
              price,
              owner,
              forSale
            };
          } catch (error) {
            console.error("Error parsing song:", error, song);
            // Return a minimal valid song object to avoid breaking the UI
            return {
              id: song.id ? Number(song.id) : 0,
              name: "Error: Unparsable Song",
              ipfsHash: "",
              previewIpfsHash: "",
              price: BigInt(0),
              owner: "0x0",
              forSale: false
            };
          }
      });

      setSongs(parsedSongs);

      // Populate additional data for filters
      const newGenres: Record<string, string> = {};
      const newStreamCounts: Record<string, number> = {};
      const newArtistNames: Record<string, string> = {};
      
      parsedSongs.forEach((song) => {
        const songId = song.id.toString();
        const randomGenre = genres[Math.floor(Math.random() * (genres.length - 1)) + 1]; // Skip "All Genres"
        const randomStreamCount = Math.floor(Math.random() * 500000) + 50000;
        
        newGenres[songId] = randomGenre;
        newStreamCounts[songId] = randomStreamCount;
        newArtistNames[songId] = `Artist ${songId}`;
      });
      
      setSongGenres(newGenres);
      setStreamCounts(newStreamCounts);
      setArtistNames(newArtistNames);

      console.log("Parsed songs:", parsedSongs);
      } catch (error) {
        console.error("Error processing songs data:", error);
      }
    }
  }, [data, genres]);

  // Subscribe function
  const handleSubscribe = async () => {
    // If another transaction is already in progress, prevent this one
    if (isTransactionPending || currentTransactionType) {
      toast.error("A transaction is already in progress. Please wait for it to complete.");
      return;
    }
    
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    try {
      // Set transaction pending state
      setIsTransactionPending(true);
      setCurrentTransactionType('subscribe');
      
      toast.loading("Please confirm the subscription transaction in your wallet...", {
        id: "subscribe-transaction-pending",
      });
      
      if (!contract) {
        toast.error("Contract not initialized", {
          id: "subscribe-transaction-pending",
        });
        setIsTransactionPending(false);
        setCurrentTransactionType(null);
        return;
      }
      
      // Create manual call to ensure proper formatting
      const call = {
        contractAddress: CAIROFY_CONTRACT_ADDRESS,
        entrypoint: 'subscribe',
        calldata: []
      };
      
      console.log("Sending subscribe transaction:", call);
      
      // Check if the subscription is successful
      try {
        // Send transaction
        const response = await sendAsync([call]);
          
        if (response.transaction_hash) {
          toast.success(`Subscription transaction submitted! Hash: ${response.transaction_hash.substring(0, 10)}...`, {
            id: "subscribe-transaction-pending",
          });
          console.log("Subscribe transaction submitted:", response.transaction_hash);
          
          // Close the modal
          setShowSubscribeModal(false);
          
          // Assume subscription is successful for immediate UI feedback
          // The real status will be updated when userSubscriptionData refreshes
          setHasUserSubscription(true);
        } else {
          throw new Error("No transaction hash returned");
        }
      } catch (txError) {
        console.error("Transaction error:", txError);
        
        // Check if the error message contains info about missing function
        const errorMessage = txError instanceof Error ? txError.message : String(txError);
        if (errorMessage.includes("Unknown method") || errorMessage.includes("not found")) {
          toast.error("Subscription feature is not available in this contract", {
            id: "subscribe-transaction-pending",
          });
        } else {
          throw txError; // Re-throw for the outer catch block to handle
        }
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message.includes("User rejected") 
          ? "Transaction was rejected in the wallet" 
          : error.message;
      }
      
      toast.error(`Failed to subscribe: ${errorMessage}`, {
        id: "subscribe-transaction-pending",
      });
    } finally {
      setIsTransactionPending(false);
      setCurrentTransactionType(null);
    }
  };

  // Update handlePlayPause to not check for ownership anymore
  const handlePlayPause = async (song: Song, playFullVersion = false) => {
    // First handle cases where we're toggling the currently playing song
    if (playingSongId === song.id && isPlayingFullVersion === playFullVersion) {
      // Toggle play/pause for current song
      if (isPlaying) {
        console.log("Pausing current song");
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        return; // Exit early after pausing
      } else {
        console.log("Resuming current song");
        try {
          if (audioRef.current) {
            // Store current time before attempting to play
            const currentPosition = audioRef.current.currentTime;
            
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Resume successful");
                  setIsPlaying(true);
                })
                .catch(err => {
                  console.error("Error resuming audio:", err);
                  
                  // Try again after resetting
                  if (audioRef.current) {
                    audioRef.current.currentTime = currentPosition;
                    audioRef.current.play()
                      .then(() => setIsPlaying(true))
                      .catch(() => {
                        toast.error("Failed to resume audio playback");
                        setIsPlaying(false);
                      });
                  }
                });
            }
          }
          return; // Exit early after resuming
        } catch (err) {
          console.error("Error in play operation:", err);
          toast.error("Failed to play audio");
          setIsPlaying(false);
          return; // Exit early after error
        }
      }
    }
    
    // Below this point we're playing a new song or switching versions
    
    // If playing full version, check only for ipfsHash validity
    if (playFullVersion) {
      // Only check for a valid hash, don't block based on ownership
      if (!song.ipfsHash) {
        toast.error("Full version not available for this song");
        return;
      }
      // If user doesn't own the song and doesn't have a subscription,
      // we'll still play but will enforce the 20-second limit via the useEffect
    } else {
      // Preview version checks
      if (!song.previewIpfsHash) {
        toast.error("No preview available for this song");
        return;
      }
    }
    
    // Get the appropriate IPFS hash based on whether playing full or preview
    const ipfsHash = playFullVersion ? song.ipfsHash : song.previewIpfsHash;
    
    // Skip if we know this audio URL has failed before
    if (failedAudioUrls[ipfsHash]) {
      toast.error(`Audio ${playFullVersion ? 'full version' : 'preview'} unavailable for this song`);
      return;
    }

    if (playingSongId === song.id && isPlayingFullVersion === playFullVersion) {
      // Toggle play/pause for current song
      if (isPlaying) {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        try {
          if (audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                })
                .catch(err => {
                  console.error("Error resuming audio:", err);
                  toast.error("Failed to resume audio playback");
                  setIsPlaying(false);
                });
            }
          }
        } catch (err) {
          console.error("Error in play operation:", err);
          toast.error("Failed to play audio");
          setIsPlaying(false);
        }
      }
    } else {
      // Play a new song or switch between full/preview versions
      setLoadingAudio(true);
      setIsPlayingFullVersion(playFullVersion);
      
      // Pause any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      try {
        // Get the IPFS URL asynchronously
        const audioUrl = await getCachedIPFSUrl(ipfsHash, true);
        if (!audioUrl) {
          toast.error("Invalid audio source");
          setLoadingAudio(false);
          return;
        }

        // Log the actual audio URL for debugging
        console.log(`Playing ${playFullVersion ? 'full version' : 'preview'} from:`, audioUrl);
        
        // Try to load the audio with multiple gateway fallbacks
        const tryPlayWithFallbacks = async (initialUrl: string) => {
          const cleanHash = ipfsHash.startsWith('ipfs://') 
            ? ipfsHash.slice(7) 
            : ipfsHash;
            
          // Create array of URLs to try (start with the provided URL, then try other gateways)
          const urlsToTry = [
            initialUrl,
            ...IPFS_GATEWAYS.map(gateway => `${gateway}${cleanHash}`).filter(url => url !== initialUrl)
          ];
          
          // Try each URL until one works
          for (let i = 0; i < urlsToTry.length; i++) {
            const currentUrl = urlsToTry[i];
            console.log(`Trying audio URL ${i+1}/${urlsToTry.length}: ${currentUrl}`);
            
            try {
              // Create a new audio element each time
              const newAudio = new Audio();
              newAudio.crossOrigin = "anonymous";
              
              // Create a promise that resolves when canplaythrough fires or rejects on error
              const canPlayPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
                const onCanPlay = () => {
                  newAudio.removeEventListener('canplaythrough', onCanPlay);
                  newAudio.removeEventListener('error', onError);
                  resolve(newAudio);
                };
                
                const onError = () => {
                  newAudio.removeEventListener('canplaythrough', onCanPlay);
                  newAudio.removeEventListener('error', onError);
                  reject(new Error(`Failed to load audio from ${currentUrl}`));
                };
                
                newAudio.addEventListener('canplaythrough', onCanPlay);
                newAudio.addEventListener('error', onError);
              });
              
              // Set the source and start loading
              newAudio.src = currentUrl;
              newAudio.load();
              
              // Set a timeout for this attempt
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Audio loading timeout")), 5000);
              });
              
              // Wait for either canplaythrough or timeout
              try {
                const successfulAudio = await Promise.race([canPlayPromise, timeoutPromise]) as HTMLAudioElement;
                
                // If we get here, audio loaded successfully
                // Set up the event handlers
                successfulAudio.addEventListener('timeupdate', () => {
                  setCurrentTime(successfulAudio.currentTime);
                });
                
                successfulAudio.addEventListener('loadedmetadata', () => {
                  setDuration(successfulAudio.duration);
                  setLoadingAudio(false);
                });
                
                successfulAudio.addEventListener('ended', () => {
                  setIsPlaying(false);
                  setPlayingSongId(null);
                  setCurrentTime(0);
                });
                
                // Play the audio
                await successfulAudio.play();
                
                // Update state
                audioRef.current = successfulAudio;
                setIsPlaying(true);
                setPlayingSongId(song.id);
                toast.success(`Now playing: ${song.name}`, { id: "audio-loading" });
                
                // Return early as we found a working URL
                return true;
              } catch (err) {
                console.warn(`Failed to load audio from ${currentUrl}:`, err);
                // Continue to next URL
              }
            } catch (err) {
              console.warn(`Error setting up audio for ${currentUrl}:`, err);
              // Continue to next URL
            }
          }
          
          // If we reach here, all URLs failed
          return false;
        };
        
      toast.loading(`Loading "${song.name}"...`, { id: "audio-loading" });
        
        // Try to play with fallbacks
        const success = await tryPlayWithFallbacks(audioUrl);
        
        if (!success) {
          // All gateway attempts failed
          console.error("All gateway attempts failed for audio");
          toast.error(`Couldn't play audio for ${song.name}`, { id: "audio-loading" });
          setFailedAudioUrls(prev => ({...prev, [ipfsHash]: true}));
          setLoadingAudio(false);
        }
      } catch (error) {
        console.error("Error preparing audio:", error);
        toast.error("Failed to prepare audio for playback");
        setLoadingAudio(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const buySong = async (songId: number) => {
    // If another transaction is already in progress, prevent this one
    if (isTransactionPending || currentTransactionType) {
      toast.error("A transaction is already in progress. Please wait for it to complete.");
      return;
    }
    
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    try {
      // Find the song to validate if it's for sale
      const songToBuy = songs.find(s => s.id === songId);
      
      if (!songToBuy) {
        toast.error("Song not found");
        return;
      }
      
      if (!songToBuy.forSale) {
        toast.error("This song is not for sale");
        return;
      }
      
      // Set transaction pending state to disable buttons and show loading indicators
      setIsTransactionPending(true);
      setCurrentTransactionType('buy');
      
      toast.loading("Please confirm the transaction in your wallet...", {
        id: "buy-transaction-pending",
      });
      
      if (!contract) {
        toast.error("Contract not initialized", {
          id: "buy-transaction-pending",
        });
        setIsTransactionPending(false);
        setCurrentTransactionType(null);
        return;
      }
      
      // Create manual call to ensure proper formatting
      const call = {
        contractAddress: CAIROFY_CONTRACT_ADDRESS,
        entrypoint: 'buy_song',
        calldata: [songId.toString()]
      };
      
      console.log("Sending buy transaction:", call);
      
      // Send transaction
      const response = await sendAsync([call]);
        
      if (response.transaction_hash) {
        toast.success(`Transaction submitted! Hash: ${response.transaction_hash.substring(0, 10)}...`, {
          id: "buy-transaction-pending",
        });
        console.log("Buy transaction submitted:", response.transaction_hash);
        
        // Close modal after successful transaction
        setShowSubscribeModal(false);
      } else {
        throw new Error("No transaction hash returned");
      }
    } catch (error) {
      console.error("Error buying song:", error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message.includes("User rejected") 
          ? "Transaction was rejected in the wallet" 
          : error.message;
      }
      
      toast.error(`Failed to buy song: ${errorMessage}`, {
        id: "buy-transaction-pending",
      });
    } finally {
      // Always reset the loading state when transaction completes or fails
      setIsTransactionPending(false);
      setCurrentTransactionType(null);
    }
  };

  // Update the formatPrice function to show exactly two decimal places
  const formatPrice = (price: bigint): string => {
    const priceNumber = Number(price) / 10**18;
    return priceNumber.toFixed(2) + " STARK";
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isFetching) return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-3 text-white">Loading songs...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-xl mx-auto p-6 bg-[#1A1A1A] rounded-xl border border-[#333333]">
          <h2 className="text-xl font-bold text-white mb-4">Error Loading Songs</h2>
          <p className="text-white/70">{error.message}</p>
        </div>
      </div>
    </div>
  );

  // Filter songs based on search, genre, and price
  const filteredSongs = songs.filter(song => {
    const songId = song.id.toString();
    const title = song.name;
    const artistName = artistNames[songId] || '';
    
    // Only filter by search query
    return searchQuery === '' || 
           title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           artistName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort songs based on selected sort criteria
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    const aId = a.id.toString();
    const bId = b.id.toString();
    
    if (sortBy === 'Popular') {
      return (streamCounts[bId] || 0) - (streamCounts[aId] || 0);
    } else if (sortBy === 'Price: Low to High') {
      return Number(a.price) - Number(b.price);
    } else if (sortBy === 'Price: High to Low') {
      return Number(b.price) - Number(a.price);
    } else if (sortBy === 'Newest') {
      // For this demo, we'll just sort by ID as a proxy for newest
      return Number(b.id) - Number(a.id);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12 pt-24 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center mb-2">
              <ShoppingBag className="mr-2 h-6 w-6" />
              Available Songs
            </h1>
            <p className="text-white/70">
              Discover and play music from artists on the blockchain
            </p>
          </div>
          
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 text-white">
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort: {sortBy}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1A1A1A] border-[#333333]">
                <DropdownMenuItem 
                  className="text-white hover:bg-[#0EA5E9]/10 cursor-pointer"
                  onClick={() => setSortBy('Popular')}
                >
                  Popular
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-white hover:bg-[#0EA5E9]/10 cursor-pointer"
                  onClick={() => setSortBy('Price: Low to High')}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-white hover:bg-[#0EA5E9]/10 cursor-pointer"
                  onClick={() => setSortBy('Price: High to Low')}
                >
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-white hover:bg-[#0EA5E9]/10 cursor-pointer"
                  onClick={() => setSortBy('Newest')}
                >
                  Newest
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4 px-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 bg-[#1A1A1A] border-[#333333] text-white rounded-xl focus:border-primary focus:ring-primary"
            />
          </div>
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-white/70">
              Showing {sortedSongs.length} {sortedSongs.length === 1 ? 'result' : 'results'}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        </div>
        
        {/* Show user wallet if connected */}
        {userWallet && (
          <div className="mb-6 p-4 bg-[#1A1A1A] border border-[#333333] rounded-xl">
            <p className="text-gray-400 text-sm">Connected as: 
              <span className="text-primary ml-2 font-mono">
                {userWallet.substring(0, 8)}...{userWallet.substring(userWallet.length - 6)}
              </span>
            </p>
          </div>
        )}
        
        {/* Show subscription status if active */}
        {hasUserSubscription && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-300 text-sm font-medium">
                Active Subscription - Enjoy unlimited access to all songs
              </p>
            </div>
          </div>
        )}
        
        {songs.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 text-center">
            <p className="text-white">No songs found in the contract.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedSongs.map((song) => (
              <SongCard 
                key={song.id}
                song={song}
                isCurrentlyPlaying={playingSongId === song.id && isPlaying}
                isCurrentSong={playingSongId === song.id}
                loadingAudio={loadingAudio && playingSongId === song.id}
                onPlay={handlePlayPause}
                onBuy={buySong}
                isOwned={isOwnedByUser(song.owner)}
                currentTime={currentTime}
                duration={duration}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                formatTime={formatTime}
                formatPrice={formatPrice}
                isPlayingFullVersion={isPlayingFullVersion}
                hasUserSubscription={hasUserSubscription}
              />
            ))}
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-12 border-t border-[#333333] pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Cairofy</h3>
              <p className="text-white/60 text-sm">
                A decentralized music platform built on StarkNet, enabling artists to tokenize and sell their music directly to fans.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Discover Music</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Upload Your Tracks</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Artist Dashboard</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Subscription Plan</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Help Center</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Documentation</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">API</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Twitter</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">Discord</a></li>
                <li><a href="#" className="text-white/60 hover:text-primary text-sm">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#333333] flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/40 text-sm">© 2023 Cairofy. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-white/40 hover:text-primary text-sm">Terms</a>
              <a href="#" className="text-white/40 hover:text-primary text-sm">Privacy</a>
              <a href="#" className="text-white/40 hover:text-primary text-sm">Cookies</a>
            </div>
          </div>
        </footer>
      </main>
      
      {/* Now Playing Bar - only show when a song is playing */}
      {playingSongId !== null && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-gray-800 p-4 backdrop-blur-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              {isPlaying ? (
                <button onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                }} className="bg-white rounded-full p-2 mr-4">
                  <Pause className="h-6 w-6 text-black" />
                </button>
              ) : (
                <button onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.play().catch(console.error);
                    setIsPlaying(true);
                  }
                }} className="bg-white rounded-full p-2 mr-4">
                  <Play className="h-6 w-6 text-black" />
                </button>
              )}
              
              <div>
                <p className="text-white font-medium">
                  {songs.find(s => s.id === playingSongId)?.name || 'Unknown Song'}
                </p>
                <div className="flex items-center">
                  <p className="text-gray-400 text-sm">
                    Now playing {isPlayingFullVersion ? 'full version' : 'preview'}
                  </p>
                  
                  {/* Preview countdown for non-owned songs */}
                  {!isPlayingFullVersion && 
                   playingSongId !== null && 
                   !hasUserSubscription && 
                   !isOwnedByUser(songs.find(s => s.id === playingSongId)?.owner || '') && (
                    <div className="ml-3 text-yellow-400 text-xs font-medium flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mr-1"></div>
                      Preview ends in {Math.max(0, 20 - Math.floor(currentTime))}s
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 mx-8 max-w-2xl">
              <div className="flex items-center justify-between text-white text-xs mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        ></div>
                      </div>
                    </div>
            
              <button onClick={toggleMute} className="text-white p-2">
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
                          </button>
          </div>
        </div>
      )}
      
      {/* Subscription/Buy Modal */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        song={currentModalSong}
        onBuy={buySong}
        onSubscribe={handleSubscribe}
        isLoading={isTransactionPending}
      />
    </div>
  );
}