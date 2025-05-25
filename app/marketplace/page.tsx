"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Music, 
  SlidersHorizontal,
  ChevronDown,
  PlusCircle,
  MinusCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layouts/Navbar';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import Sidebar from '@/components/Sidebar';
import { 
  useAccount, 
  useContract, 
  useSendTransaction, 
  useReadContract 
} from '@starknet-react/core';
import { CAIROFY_CONTRACT_ADDRESS, CAIROFY_ABI } from '@/constants/contrat';
import { toast } from 'sonner';
import { shortString } from 'starknet';

// Define Song type consistent with fetch page
type Song = {
  id: number;
  name: string;
  ipfsHash: string;
  previewIpfsHash: string;
  price: bigint;
  owner: string;
  forSale: boolean;
};

const genres = ['All Genres', 'Electronic', 'Pop', 'Hip Hop', 'Rock', 'Jazz', 'Blues', 'Classical'];

// Sample cover images to use as fallbacks
const sampleCoverImages = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG11c2ljfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fHww',
];

// Fallback image in case IPFS fails
const FALLBACK_IMAGE = '/images/music-placeholder.jpg';

// Available IPFS Gateways
const IPFS_GATEWAYS = [
  'https://amber-voluntary-possum-989.mypinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
];

// Add a memoization cache to avoid repeated API calls for the same hash
const ipfsUrlCache: Record<string, string> = {};

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
const extractByteArrayText = (byteArray: any): string => {
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

// Simple ByteArray decoder - fallback for various use cases
const decodeByteArray = (byteArray: any): string => {
  // First try our specialized extractor
  const extracted = extractByteArrayText(byteArray);
  if (extracted && extracted.length > 0) {
    return extracted;
  }
  
  // Fallback: try simple toString approach
  try {
    if (byteArray && byteArray.toString) {
      const str = byteArray.toString();
      // Try to decode if it looks like a felt
      try {
        return shortString.decodeShortString(str);
      } catch (e) {
        return str; // Return as-is if decoding fails
      }
    }
  } catch (error) {
    console.error("Error in basic decodeByteArray:", error);
  }
  
  return '';
};

// Update the decodeSongName function to better handle ByteArray
const decodeSongName = (nameData: any, songId: number): string => {
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
  if (nameData && nameData.data) {
    try {
      // Check if it's an array of bytes31
      if (Array.isArray(nameData.data)) {
        let text = '';
        for (const chunk of nameData.data) {
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
    } catch (e) {
      console.error(`Error processing data array for song ${songId}:`, e);
    }
  }
  
  // If nameData is an object with a name property, use that
  if (nameData && typeof nameData === 'object' && 'name' in nameData) {
    return String(nameData.name);
  }
  
  // Last resort: use a generic name with the ID
  return `Song ${songId}`;
};

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [priceRange, setPriceRange] = useState([0.5, 5]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Popular');
  const [songs, setSongs] = useState<Song[]>([]);
  const [songGenres, setSongGenres] = useState<Record<string, string>>({});
  const [streamCounts, setStreamCounts] = useState<Record<string, number>>({});
  const [artistNames, setArtistNames] = useState<Record<string, string>>({});
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState(true);
  
  // Get wallet connection status
  const { address } = useAccount();
  
  // Setup contract
  const { contract } = useContract({
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });
  
  // Initialize transaction hook
  const { sendAsync } = useSendTransaction({
    calls: [], // Start with empty calls, we'll provide them when sending the transaction
  });
  
  // Read contract data using hook
  const { data, isLoading, error } = useReadContract({
    functionName: 'get_all_songs',
    args: [],
    address: CAIROFY_CONTRACT_ADDRESS,
    abi: CAIROFY_ABI,
  });

  // Process the songs data when it's received
  useEffect(() => {
    if (error) {
      console.error("Error fetching songs:", error);
      toast.error("Error loading songs from blockchain");
      setSongs([]);
      return;
    }

    if (data && Array.isArray(data)) {
      console.log("Songs data from contract:", data);
      
      try {
        // Parse songs using the enhanced approach from fetch page
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
        
        // Populate additional data maps
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
        
        // Load cover images
        loadCoverImagesForSongs(parsedSongs);
      } catch (error) {
        console.error("Error processing songs data:", error);
        toast.error("Error processing songs data");
        setSongs([]);
      }
    } else if (!isLoading) {
      console.log("No songs data received");
      setSongs([]);
    }
  }, [data, isLoading, error]);
  
  // Function to load cover images for all songs
  const loadCoverImagesForSongs = async (songsList: Song[]) => {
    setLoadingImages(true);
    console.log("Loading cover images for songs:", songsList.map(s => ({ id: s.id, ipfsHash: s.ipfsHash })));
    
    const newCoverImages: Record<string, string> = {};
    
    // Load images in parallel
    const imagePromises = songsList.map(async (song) => {
      const songId = song.id.toString();
      try {
        if (song.ipfsHash) {
          console.log(`Loading image for song ${songId} with hash ${song.ipfsHash}`);
          const imageUrl = await getCachedIPFSUrl(song.ipfsHash, false);
          console.log(`Got image URL for song ${songId}: ${imageUrl}`);
          return { songId, imageUrl };
        }
        console.log(`No IPFS hash for song ${songId}, using fallback image`);
        return { songId, imageUrl: FALLBACK_IMAGE };
      } catch (error) {
        console.error(`Error loading image for song ${songId}:`, error);
        return { songId, imageUrl: FALLBACK_IMAGE };
      }
    });
    
    // Wait for all images to load
    const results = await Promise.all(imagePromises);
    
    // Process results
    results.forEach(({ songId, imageUrl }) => {
      newCoverImages[songId] = imageUrl;
    });
    
    console.log("Finished loading cover images:", newCoverImages);
    setCoverImages(newCoverImages);
    setLoadingImages(false);
  };
  
  // Get song price in ETH format
  const getSongPrice = (song: Song) => {
    return Number(song.price) / 10**18;
  };
  
  const handlePlay = (songId: string) => {
    setPlayingSong(songId === playingSong ? null : songId);
  };

  // Function to buy a song
  const handleBuySong = async (songId: string) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!contract) {
      toast.error("Contract not initialized");
      return;
    }
    
    try {
      toast.loading("Please confirm the transaction in your wallet...", {
        id: "buy-transaction-pending",
      });
      
      // Prepare the buy_song transaction call
      const calls = contract.populate('buy_song', [BigInt(songId)]);
      
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
    }
  };

  // Filter songs based on search, genre, and price
  const filteredSongs = songs.filter(song => {
    const songId = song.id.toString();
    const title = song.name;
    const artistName = artistNames[songId] || '';
    const genre = songGenres[songId] || '';
    const price = getSongPrice(song);
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         artistName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All Genres' || genre === selectedGenre;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesGenre && matchesPrice;
  });

  // Sort songs based on selected sort criteria
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    const aId = a.id.toString();
    const bId = b.id.toString();
    
    if (sortBy === 'Popular') {
      return (streamCounts[bId] || 0) - (streamCounts[aId] || 0);
    } else if (sortBy === 'Price: Low to High') {
      return getSongPrice(a) - getSongPrice(b);
    } else if (sortBy === 'Price: High to Low') {
      return getSongPrice(b) - getSongPrice(a);
    } else if (sortBy === 'Newest') {
      // For this demo, we'll just sort by ID as a proxy for newest
      return Number(b.id) - Number(a.id);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 flex flex-col min-h-0 px-6 py-12">
            <div className="flex-1 overflow-y-auto">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white flex items-center mb-2">
                      <ShoppingBag className="h-7 w-7 mr-2" />
                      Songs Marketplace
                    </h1>
                    <p className="text-white/70">
                      Discover and own unique music NFTs from artists around the world
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      className="flex items-center gap-2 text-white"
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {isFiltersOpen ? (
                        <MinusCircle className="h-4 w-4" />
                      ) : (
                        <PlusCircle className="h-4 w-4" />
                      )}
                    </Button>
                    
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
                  
                  <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1A1A1A] p-6 rounded-xl border border-[#333333] mb-6">
                        <div>
                          <h3 className="text-white font-medium mb-3">Genre</h3>
                          <div className="flex flex-wrap gap-2">
                            {genres.map((genre) => (
                              <Badge
                                key={genre}
                                className={`cursor-pointer px-3 py-1 rounded-full ${
                                  selectedGenre === genre
                                    ? 'bg-primary text-white'
                                    : 'bg-[#0F0F0] text-white/70 hover:bg-[#0F0F0]/80'
                                }`}
                                onClick={() => setSelectedGenre(genre)}
                              >
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-white font-medium mb-3">Price Range (STARK)</h3>
                          <Slider
                            defaultValue={[0.5, 5]}
                            max={1100}
                            min={0.5}
                            step={0.1}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="my-6"
                          />
                          <div className="flex justify-between">
                            <span className="text-white/70">{priceRange[0]} STARK</span>
                            <span className="text-white/70">{priceRange[1]} STARK</span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Active Filters */}
                  {(selectedGenre !== 'All Genres' || searchQuery || 
                    priceRange[0] !== 0.5 || priceRange[1] !== 5) && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-white/70 text-sm">Active Filters:</span>
                      
                      {selectedGenre !== 'All Genres' && (
                        <Badge
                          className="bg-[#0EA5E9]/20 primary hover:bg-[#0EA5E9]/30 px-2 py-1 flex items-center gap-1"
                          onClick={() => setSelectedGenre('All Genres')}
                        >
                          Genre: {selectedGenre}
                          <XIcon className="h-3 w-3" />
                        </Badge>
                      )}
                      
                      {(priceRange[0] !== 0.5 || priceRange[1] !== 5) && (
                        <Badge
                          className="bg-[#0EA5E9]/20 text-primary hover:bg-[#0EA5E9]/30 px-2 py-1 flex items-center gap-1"
                          onClick={() => setPriceRange([0.5, 5])}
                        >
                          Price: {priceRange[0]} - {priceRange[1]} STARK
                          <XIcon className="h-3 w-3" />
                        </Badge>
                      )}
                      
                      {searchQuery && (
                        <Badge
                          className="bg-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/30 px-2 py-1 flex items-center gap-1"
                          onClick={() => setSearchQuery('')}
                        >
                          Search: {searchQuery}
                          <XIcon className="h-3 w-3" />
                        </Badge>
                      )}
                      
                      <Button
                        variant="link"
                        className="text-[#0EA5E9] text-sm p-0 h-auto"
                        onClick={() => {
                          setSelectedGenre('All Genres');
                          setPriceRange([0.5, 5]);
                          setSearchQuery('');
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-white/70">
                    Showing {sortedSongs.length} {sortedSongs.length === 1 ? 'result' : 'results'}
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              </div>
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="ml-4 text-white text-lg">Loading songs from blockchain...</p>
                </div>
              )}
              
              {/* Song Grid */}
              {!isLoading && sortedSongs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {sortedSongs.map((song) => {
                    const songId = song.id.toString();
                    const coverImage = coverImages[songId] || FALLBACK_IMAGE;
                    
                    console.log(`Rendering song ${songId} with name: ${song.name}, cover: ${coverImage}`);
                    
                    return (
                      <Link href={`/songDetails?id=${songId}`} key={songId}>
                        <SongCard
                          title={song.name}
                          artist={artistNames[songId] || `Artist ${songId}`}
                          coverImage={coverImage}
                          streamCount={streamCounts[songId] || 0}
                          price={getSongPrice(song)}
                          isForSale={song.forSale}
                          onPlay={() => handlePlay(songId)}
                          onBuy={() => {
                            handleBuySong(songId);
                            return false; // Prevent navigation
                          }}
                          songId={songId}
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : !isLoading && (
                <div className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-[#333333]">
                  <Music className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No songs found</h3>
                  <p className="text-white/70 mb-6 max-w-md mx-auto">
                    We couldn&apos;t find any songs matching your current filters.
                    Try adjusting your search or filters.
                  </p>
                  <Button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedGenre('All Genres');
                      setPriceRange([0.5, 5]);
                      setSearchQuery('');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </main>
          {/* MusicPlayer at the bottom */}
          <div className="w-full border-t border-[#222] bg-[#181818]">
            <MusicPlayer />
          </div>
        </div>
        {/* Right Panel */}
        <div className="w-[340px] hidden lg:flex flex-col border-l border-[#222] bg-secondary p-6">
          {/* Currently Playing Card */}
          <div className="rounded-2xl overflow-hidden shadow-xl bg-[#111]">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80"
                alt="Currently Playing Cover"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-center">
                <span className="text-white text-lg font-semibold tracking-wide">Currently Playing</span>
              </div>
            </div>
            <div className="p-5 bg-[#181818] flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-semibold text-white">Rupesh</span>
                <button className="border border-white/30 rounded-full px-5 py-1 text-white/80 hover:bg-white/10 transition text-base">unfollow</button>
              </div>
              <div className="text-white/70 text-sm font-medium mb-1">
                <span className="font-bold text-white">999,999</span> Monthly listeners
              </div>
              <div className="text-white/50 text-sm">i am Rupesh and i make maharani.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small X icon component for the filter badges
const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default Page;