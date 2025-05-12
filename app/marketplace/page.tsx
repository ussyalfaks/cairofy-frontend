====================
app/marketplace/page.tsx
====================

"use client";
import { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Music, 
  SlidersHorizontal,
  ChevronDown,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
// import Link from 'next/link';
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
import Navbar from '@/components/Navbar';
// import Footer from '@/components/Footer';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';

// Sample marketplace data
const marketplaceData = {
  topSongs: [
    {
      id: '1',
      title: 'Ethereum Dreams',
      artist: 'Block Beats',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D',
      streamCount: 145230,
      price: 2.5,
      isForSale: true,
      genre: 'Electronic'
    },
    {
      id: '2',
      title: 'Digital Nomad',
      artist: 'Crypto Punk',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
      streamCount: 98450,
      price: 1.8,
      isForSale: true,
      genre: 'Pop'
    },
    {
      id: '3',
      title: 'Cairo Nights',
      artist: 'StarkNet Collective',
      coverImage: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG11c2ljfGVufDB8fDB8fHww',
      streamCount: 217840,
      price: 3.2,
      isForSale: true,
      genre: 'Electronic'
    },
    {
      id: '4',
      title: 'Blockchain Beats',
      artist: 'Web3 Audio',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fHww',
      streamCount: 76540,
      price: 1.5,
      isForSale: true,
      genre: 'Hip Hop'
    },
    {
      id: '5',
      title: 'Crypto Summer',
      artist: 'Block Party',
      coverImage: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBjb3ZlcnxlbnwwfHwwfHx8MA%3D%3D',
      streamCount: 354210,
      price: 3.2,
      isForSale: true,
      genre: 'Pop'
    },
    {
      id: '6',
      title: 'DeFi Anthem',
      artist: 'Token Economy',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D',
      streamCount: 287430,
      price: 2.8,
      isForSale: true,
      genre: 'Electronic'
    },
    {
      id: '7',
      title: 'Web3 Vibes',
      artist: 'Cairo Collective',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
      streamCount: 198650,
      price: 1.9,
      isForSale: true,
      genre: 'Rock'
    },
    {
      id: '8',
      title: 'Blockchain Blues',
      artist: 'Hash Function',
      coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG11c2ljfGVufDB8fDB8fHww',
      streamCount: 132540,
      price: 1.5,
      isForSale: true,
      genre: 'Blues'
    }
  ],
  genres: ['All Genres', 'Electronic', 'Pop', 'Hip Hop', 'Rock', 'Jazz', 'Blues', 'Classical'],
  priceRange: { min: 0.5, max: 10 }
};

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [priceRange, setPriceRange] = useState([0.5, 5]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Popular');
  
  const handlePlay = (songId: string) => {
    setPlayingSong(songId === playingSong ? null : songId);
  };

  // Filter songs based on search, genre, and price
  const filteredSongs = marketplaceData.topSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All Genres' || song.genre === selectedGenre;
    const matchesPrice = song.price >= priceRange[0] && song.price <= priceRange[1];
    
    return matchesSearch && matchesGenre && matchesPrice;
  });

  // Sort songs based on selected sort criteria
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortBy === 'Popular') {
      return b.streamCount - a.streamCount;
    } else if (sortBy === 'Price: Low to High') {
      return a.price - b.price;
    } else if (sortBy === 'Price: High to Low') {
      return b.price - a.price;
    } else if (sortBy === 'Newest') {
      // For this demo, we'll just sort by ID as a proxy for newest
      return parseInt(b.id) - parseInt(a.id);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#0F0F0] flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8">
          {/* Marketplace Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center mb-2">
                  <ShoppingBag className="h-7 w-7 mr-2" />
                  NFT Marketplace
                </h1>
                <p className="text-white/70">
                  Discover and own unique music NFTs from artists around the world
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 btn-outline"
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
                    <Button variant="outline" className="flex items-center gap-2 btn-outline">
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
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for songs or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 bg-[#1A1A1A] border-[#333333] text-white rounded-xl focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                />
              </div>
              
              <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1A1A1A] p-6 rounded-xl border border-[#333333] mb-6">
                    <div>
                      <h3 className="text-white font-medium mb-3">Genre</h3>
                      <div className="flex flex-wrap gap-2">
                        {marketplaceData.genres.map((genre) => (
                          <Badge
                            key={genre}
                            className={`cursor-pointer px-3 py-1 rounded-full ${
                              selectedGenre === genre
                                ? 'bg-[#0EA5E9] text-white'
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
                        max={10}
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
                      className="bg-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/30 px-2 py-1 flex items-center gap-1"
                      onClick={() => setSelectedGenre('All Genres')}
                    >
                      Genre: {selectedGenre}
                      <XIcon className="h-3 w-3" />
                    </Badge>
                  )}
                  
                  {(priceRange[0] !== 0.5 || priceRange[1] !== 5) && (
                    <Badge
                      className="bg-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/30 px-2 py-1 flex items-center gap-1"
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
          
          {/* Song Grid */}
          {sortedSongs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {sortedSongs.map((song) => (
                <SongCard
                  key={song.id}
                  title={song.title}
                  artist={song.artist}
                  coverImage={song.coverImage}
                  streamCount={song.streamCount}
                  price={song.price}
                  isForSale={song.isForSale}
                  onPlay={() => handlePlay(song.id)}
                />
              ))}
            </div>
          ) : (
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
      
      <MusicPlayer 
        songTitle={playingSong ? 
          marketplaceData.topSongs.find(song => song.id === playingSong)?.title : undefined
        }
        artist={playingSong ? 
          marketplaceData.topSongs.find(song => song.id === playingSong)?.artist : undefined
        }
        coverImage={playingSong ? 
          marketplaceData.topSongs.find(song => song.id === playingSong)?.coverImage : undefined
        }
      />
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