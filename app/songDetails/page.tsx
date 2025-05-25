"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Tag, 
  ArrowLeft, 
  ShoppingBag,
  Clock,
  Music,
  BarChart3,
  Users2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import Navbar from '@/components/layouts/Navbar';
// import Footer from '@/components/Footer';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import { useAccount, useContract, useSendTransaction, useReadContract } from '@starknet-react/core';
import { CAIROFY_CONTRACT_ADDRESS, CAIROFY_ABI } from '@/constants/contrat';
import { toast } from 'sonner';
import { shortString } from 'starknet';

// IPFS gateway URLs
const IPFS_GATEWAYS = [
  'https://amber-voluntary-possum-989.mypinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
];

// Helper function to get IPFS URL from hash
const getIPFSUrl = (ipfsHash: string, fallbackIndex = 0): string => {
  if (!ipfsHash) {
    return '/images/music-placeholder.jpg';
  }
  
  // Clean the hash (remove ipfs:// prefix if present)
  const cleanHash = ipfsHash.startsWith('ipfs://') ? ipfsHash.slice(7) : ipfsHash;
  
  // Use the gateway at the specified index
  return `${IPFS_GATEWAYS[fallbackIndex % IPFS_GATEWAYS.length]}${cleanHash}`;
};

// Helper function to extract text from ByteArray
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractByteArrayText = (byteArray: any): string => {
  // If it's not a ByteArray-like object, return empty
  if (!byteArray || typeof byteArray !== 'object') {
    return '';
  }
  
  try {
    let result = '';
    
    // Process the data array (main content)
    if (byteArray.data && Array.isArray(byteArray.data)) {
      for (const chunk of byteArray.data) {
        if (chunk) {
          try {
            // For felt252 values, we need to decode them
            result += shortString.decodeShortString(chunk.toString());
          } catch (e) {
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
    if (byteArray.pending_word && byteArray.pending_word_len) {
      try {
        // Only if it has actual content (pending_word_len > 0)
        if (Number(byteArray.pending_word_len) > 0) {
          result += shortString.decodeShortString(byteArray.pending_word.toString());
        }
      } catch (e) {
        // If decoding fails, try using the raw string
        const pendingWord = byteArray.pending_word.toString();
        if (pendingWord && pendingWord.length > 0) {
          result += pendingWord;
        }
      }
    }
    
    return result;
  } catch (e) {
    console.error("Error extracting ByteArray text:", e);
    return '';
  }
};

// Better song name decoder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decodeSongName = (nameData: any): string => {
  // Handle ByteArray format
  const extractedName = extractByteArrayText(nameData);
  if (extractedName && extractedName.length > 0) {
    return extractedName;
  }
  
  // Handle direct string case
  if (typeof nameData === 'string') {
    return nameData;
  }
  
  // Try to get string representation
  try {
    if (nameData && typeof nameData.toString === 'function') {
      const strValue = nameData.toString();
      try {
        return shortString.decodeShortString(strValue);
      } catch {
        return strValue;
      }
    }
  } catch (e) {
    console.error("Error decoding song name:", e);
  }
  
  return "Unknown Song";
};

// Also add a function to decode IPFS hash
const decodeIPFSHash = (hashData: any): string => {
  // Handle ByteArray format
  const extractedHash = extractByteArrayText(hashData);
  if (extractedHash && extractedHash.length > 0) {
    return extractedHash;
  }
  
  // Handle direct string case
  if (typeof hashData === 'string') {
    return hashData;
  }
  
  // Try to get string representation
  try {
    if (hashData && typeof hashData.toString === 'function') {
      return hashData.toString();
    }
  } catch (e) {
    console.error("Error decoding IPFS hash:", e);
  }
  
  return "";
};

// Define the song interface
interface SongDetails {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverImage: string;
  streamCount: number;
  price: number;
  isForSale: boolean;
  genre: string;
  releaseDate: string;
  duration: string;
  totalListeners: number;
  description: string;
  lyrics: string;
  similarSongs: Array<{
    id: string;
    title: string;
    artist: string;
    coverImage: string;
    streamCount: number;
    price: number;
    isForSale: boolean;
  }>;
}

const SongDetail = () => {
  const searchParams = useSearchParams();
  const songId = searchParams.get('id') || "1";
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'details'>('details');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isListForSaleModalOpen, setIsListForSaleModalOpen] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [song, setSong] = useState<SongDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get wallet connection status
  const { address } = useAccount();
  
  // Setup contract
  const { contract } = useContract({
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });
  
  // Initialize transaction hook for buying the song
  const { sendAsync } = useSendTransaction({
    calls: [],
  });
  
  // Fetch song data from contract
  const { data: songData, isLoading: isSongLoading, error: songError } = useReadContract({
    functionName: 'get_song_info',
    args: [BigInt(songId)],
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });
  
  // Fetch all songs for similar songs section
  const { data: allSongs, isLoading: isAllSongsLoading } = useReadContract({
    functionName: 'get_all_songs',
    args: [],
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });
  
  // Process song data when received
  useEffect(() => {
    const loadSongData = async () => {
      setIsLoading(true);
      
      if (songError) {
        console.error("Error fetching song:", songError);
        toast.error("Error loading song details from blockchain");
        setIsLoading(false);
        return;
      }
      
      if (!songData) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Song data from contract:", songData);
        
        // Get actual IPFS image instead of using sample images
        const ipfsHash = decodeIPFSHash(songData.ipfs_hash);
        const coverImage = ipfsHash ? getIPFSUrl(ipfsHash) : '/images/music-placeholder.jpg';
        
        // Sample genres (keep these as they're not in the contract)
        const genres = ['Electronic', 'Pop', 'Hip Hop', 'Rock', 'Jazz', 'Blues'];
        
        // Convert price from contract format to display format
        const priceInEth = typeof songData.price === 'object' && 'low' in songData.price 
          ? Number(songData.price.low) / 10**18 
          : Number(songData.price) / 10**18;
        
        // Generate random values for fields not in the contract
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        const randomStreamCount = Math.floor(Math.random() * 500000) + 50000;
        const randomListeners = Math.floor(Math.random() * 50000) + 5000;
        
        // Get similar songs from all songs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let similarSongs: any[] = [];
        if (allSongs && Array.isArray(allSongs) && allSongs.length > 0) {
          // Filter out current song and get up to 3 others
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          similarSongs = allSongs
            .filter((s: any) => s.id.toString() !== songId)
            .slice(0, 3)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((s: any, index: number) => {
              const similarSongPrice = typeof s.price === 'object' && 'low' in s.price 
                ? Number(s.price.low) / 10**18 
                : Number(s.price) / 10**18;
              
              // Get IPFS image for this song too
              const similarIpfsHash = decodeIPFSHash(s.ipfs_hash);
              const similarCoverImage = similarIpfsHash 
                ? getIPFSUrl(similarIpfsHash) 
                : '/images/music-placeholder.jpg';
              
              return {
                id: s.id.toString(),
                title: decodeSongName(s.name),
                artist: `Artist ${s.id}`,
                coverImage: similarCoverImage,
                streamCount: Math.floor(Math.random() * 500000) + 10000,
                price: similarSongPrice,
                isForSale: s.for_sale
              };
            });
        }
        
        // Create song details object
        const songDetails: SongDetails = {
          id: songData.id.toString(),
          title: decodeSongName(songData.name),
          artist: `Artist ${songData.id}`,
          artistId: `artist-${songData.id}`,
          coverImage: coverImage,
          streamCount: randomStreamCount,
          price: priceInEth,
          isForSale: songData.for_sale,
          genre: randomGenre,
          releaseDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
          duration: `${Math.floor(Math.random() * 3) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          totalListeners: randomListeners,
          description: "A futuristic electronic track inspired by the world of blockchain and decentralized technologies. Features ambient synths and driving beats that capture the innovative spirit of Web3.",
          lyrics: `Verse 1:
Digital frontiers expanding wide
Code and consensus, side by side
A new world forming, bit by bit
The future's calling, this is it

Chorus:
Blockchain dreams in the midnight code
Building the future, breaking the mold
Decentralized visions, setting us free
A new reality, for you and me

Verse 2:
Smart contracts running, trust is born
Old systems fading, weathered and worn
Innovation flowing through the chain
Revolution rising once again`,
          similarSongs: similarSongs
        };
        
        setSong(songDetails);
      } catch (error) {
        console.error("Error processing song data:", error);
        toast.error("Error processing song data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSongData();
  }, [songData, songError, songId, allSongs]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // Buy song function
  const handlePurchase = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      setIsPurchaseModalOpen(false);
      return;
    }
    
    if (!contract || !song) {
      toast.error("Contract not initialized or song not loaded");
      setIsPurchaseModalOpen(false);
      return;
    }
    
    // Check if the song is for sale
    if (!song.isForSale) {
      toast.error("This song is not currently for sale");
      setIsPurchaseModalOpen(false);
      return;
    }
    
    try {
      toast.loading("Please confirm the transaction in your wallet...", {
        id: "buy-transaction-pending",
      });
      
      // Prepare the buy_song transaction call
      const calls = contract.populate('buy_song', [BigInt(song.id)]);
      
      if (!calls) {
        throw new Error('Failed to create contract call');
      }
      
      // Send the transaction
      const response = await sendAsync([calls]);
      
      console.log("Transaction response:", response);
      
      if (response.transaction_hash) {
        toast.success(`Transaction submitted! Transaction hash: ${response.transaction_hash.substring(0, 10)}...`, {
          id: "buy-transaction-pending",
        });
        setIsPurchaseModalOpen(false);
      }
    } catch (error) {
      console.error('Error buying song:', error);
      let errorMessage = 'Unknown contract error';
      
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected in the wallet";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Failed to buy song: ${errorMessage}`, {
        id: "buy-transaction-pending",
      });
      setIsPurchaseModalOpen(false);
    }
  };

  // Handle song listing for sale
  const handleListForSale = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      setIsListForSaleModalOpen(false);
      return;
    }
    
    if (!contract || !song || !salePrice) {
      toast.error("Contract not initialized, song not loaded, or price not set");
      setIsListForSaleModalOpen(false);
      return;
    }
    
    try {
      toast.loading("Please confirm the transaction in your wallet...", {
        id: "list-transaction-pending",
      });
      
      // Prepare the set_song_for_sale transaction call
      const calls = contract.populate('set_song_for_sale', [BigInt(song.id)]);
      
      if (!calls) {
        throw new Error('Failed to create contract call');
      }
      
      // Send the transaction
      const response = await sendAsync([calls]);
      
      console.log("Transaction response:", response);
      
      if (response.transaction_hash) {
        toast.success(`Song listed for sale! Transaction hash: ${response.transaction_hash.substring(0, 10)}...`, {
          id: "list-transaction-pending",
        });
        setIsListForSaleModalOpen(false);
      }
    } catch (error) {
      console.error('Error listing song for sale:', error);
      let errorMessage = 'Unknown contract error';
      
      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected in the wallet";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(`Failed to list song: ${errorMessage}`, {
        id: "list-transaction-pending",
      });
      setIsListForSaleModalOpen(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || !song) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-white text-lg">Loading song details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white flex items-center p-0"
              asChild
            >
              <Link href="/marketplace">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
          
          {/* Song Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#0EA5E9] to-cairo-green rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative">
                <Image
                  src={song.coverImage}
                  alt={song.title}
                  width={500}
                  height={500}
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isPlaying ? (
                    <Pause className="h-16 w-16 text-white" />
                  ) : (
                    <Play className="h-16 w-16 text-white" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{song.title}</h1>
                    <Link 
                      href={`/artist/${song.artistId}`}
                      className="text-[#0EA5E9] hover:text-[#0EA5E9]/80 transition-colors text-xl"
                    >
                      {song.artist}
                    </Link>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleLike}
                      className={`p-2 rounded-full hover:bg-white/5 ${
                        isLiked ? 'text-red-500' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Heart className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/5">
                      <Share2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge className="bg-[#1A1A1A] text-white border-[#333333] px-3 py-1">
                    {song.genre}
                  </Badge>
                  <div className="flex items-center text-white/70 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {song.duration}
                  </div>
                  <div className="flex items-center text-white/70 text-sm">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    {song.streamCount.toLocaleString()} streams
                  </div>
                  <div className="flex items-center text-white/70 text-sm">
                    <Users2 className="h-4 w-4 mr-1" />
                    {song.totalListeners.toLocaleString()} listeners
                  </div>
                </div>
                
                <div className="mb-8">
                  <p className="text-white/70">Released on {formatDate(song.releaseDate)}</p>
                </div>
              </div>
              
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
                {song.isForSale ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">Purchase NFT</h3>
                        <p className="text-white/70">Own this track as an NFT</p>
                      </div>
                      <div className="text-right">
                        <p className="text-cairo-green font-bold text-2xl">{song.price.toFixed(2)} STARK</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full btn-primary"
                      onClick={() => setIsPurchaseModalOpen(true)}
                    >
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-xl mb-1">You Own This Track</h3>
                        <p className="text-white/70">Purchased on {formatDate('2023-11-10')}</p>
                      </div>
                      <Badge className="bg-[#0EA5E9] text-white px-3 py-1">
                        Owned
                      </Badge>
                    </div>
                    <Button 
                      className="w-full btn-outline"
                      onClick={() => setIsListForSaleModalOpen(true)}
                    >
                      <Tag className="h-5 w-5 mr-2" />
                      List For Sale
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Song Details Tabs */}
          <div className="mb-12">
            <div className="flex border-b border-[#333333] mb-6">
              <button
                className={`px-6 py-3 text-lg font-medium ${
                  activeTab === 'details'
                    ? 'text-white border-b-2 border-[#0EA5E9]'
                    : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`px-6 py-3 text-lg font-medium ${
                  activeTab === 'lyrics'
                    ? 'text-white border-b-2 border-[#0EA5E9]'
                    : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setActiveTab('lyrics')}
              >
                Lyrics
              </button>
            </div>
            
            {activeTab === 'details' ? (
              <div className="text-white/80 leading-relaxed">
                <p className="mb-4">{song.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <Music className="h-5 w-5 mr-2" />
                      Track Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Artist</span>
                        <span className="text-white">{song.artist}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Genre</span>
                        <span className="text-white">{song.genre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Released</span>
                        <span className="text-white">{formatDate(song.releaseDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Duration</span>
                        <span className="text-white">{song.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      NFT Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Token ID</span>
                        <span className="text-white">#ETH-{song.id}-MUSIC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Smart Contract</span>
                        <a href="#" className="text-[#0EA5E9] hover:underline truncate max-w-[180px]">
                          {CAIROFY_CONTRACT_ADDRESS.substring(0, 8)}...{CAIROFY_CONTRACT_ADDRESS.substring(CAIROFY_CONTRACT_ADDRESS.length - 4)}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Royalty</span>
                        <span className="text-white">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Owners</span>
                        <span className="text-white">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
                <pre className="text-white/90 font-sans whitespace-pre-wrap leading-relaxed">
                  {song.lyrics}
                </pre>
              </div>
            )}
          </div>
          
          {/* Similar Songs */}
          {song.similarSongs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {song.similarSongs.map((similarSong) => (
                  <SongCard
                    key={similarSong.id}
                    title={similarSong.title}
                    artist={similarSong.artist}
                    coverImage={similarSong.coverImage}
                    streamCount={similarSong.streamCount}
                    price={similarSong.price}
                    isForSale={similarSong.isForSale}
                    songId={similarSong.id}
                    onBuy={() => {
                      // Redirect to song details page for the similar song
                      window.location.href = `/songDetails?id=${similarSong.id}`;
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {isPlaying && (
        <MusicPlayer
          songTitle={song.title}
          artist={song.artist}
          coverImage={song.coverImage}
        />
      )}
      
      {/* Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#333333]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Purchase NFT</DialogTitle>
            <DialogDescription className="text-white/70">
            {`You're about to purchase '${song.title}' by ${song.artist} as an NFT`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-4 py-4">
            <Image
              src={song.coverImage}
              alt={song.title}
              width={500}
              height={500}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div>
              <h4 className="font-medium text-white">{song.title}</h4>
              <p className="text-white/70">{song.artist}</p>
            </div>
          </div>
          
          <Separator className="bg-[#333333]" />
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span className="text-white/70">Price</span>
              <span className="text-white font-medium">{song.price.toFixed(2)} STARK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Platform Fee (2.5%)</span>
              <span className="text-white font-medium">{(song.price * 0.025).toFixed(2)} STARK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white font-medium">Total</span>
              <span className="text-cairo-green font-bold">{(song.price * 1.025).toFixed(2)} STARK</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPurchaseModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              className="btn-primary w-full sm:w-auto"
            >
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* List For Sale Modal */}
      <Dialog open={isListForSaleModalOpen} onOpenChange={setIsListForSaleModalOpen}>
        <DialogContent className="bg-[#1A1A1A] border-[#333333]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">List NFT For Sale</DialogTitle>
            <DialogDescription className="text-white/70">
              Set a price to list &quot;{song.title}&quot; for sale on the marketplace
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-4 py-4">
            <Image
              src={song.coverImage}
              alt={song.title}
              width={500}
              height={500}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div>
              <h4 className="font-medium text-white">{song.title}</h4>
              <p className="text-white/70">{song.artist}</p>
            </div>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-white font-medium">
                Sale Price (STARK)
              </label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="bg-[#0F0F0F] border-[#333333] text-white"
                  placeholder="Enter price in STARK"
                  min="0.1"
                  step="0.1"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <span className="text-white/70">STARK</span>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                You will receive {salePrice ? (parseFloat(salePrice) * 0.975).toFixed(2) : '0'} STARK after platform fees
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsListForSaleModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleListForSale}
              className="btn-primary w-full sm:w-auto"
              disabled={!salePrice || parseFloat(salePrice) <= 0}
            >
              List For Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SongDetail;