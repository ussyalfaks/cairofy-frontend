
"use client";
import { useState } from 'react';
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
  Users2
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

// Sample song details
const songDetails = {
  id: '1',
  title: 'Ethereum Dreams',
  artist: 'Block Beats',
  artistId: 'artist-1',
  coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D',
  streamCount: 145230,
  price: 2.5,
  isForSale: true,
  genre: 'Electronic',
  releaseDate: '2023-09-15',
  duration: '3:42',
  totalListeners: 25640,
  description: 'A futuristic electronic track inspired by the world of blockchain and decentralized technologies. Features ambient synths and driving beats that capture the innovative spirit of Ethereum.',
  lyrics: `Verse 1:
Digital frontiers expanding wide
Code and consensus, side by side
A new world forming, bit by bit
The future&apos;s calling, this is it

Chorus:
Ethereum dreams in the midnight code
Building the future, breaking the mold
Decentralized visions, setting us free
A new reality, for you and me

Verse 2:
Smart contracts running, trust is born
Old systems fading, weathered and worn
Innovation flowing through the chain
Revolution rising once again`,
  similarSongs: [
    {
      id: '3',
      title: 'Cairo Nights',
      artist: 'StarkNet Collective',
      coverImage: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG11c2ljfGVufDB8fDB8fHww',
      streamCount: 217840,
      price: 3.2,
      isForSale: true
    },
    {
      id: '6',
      title: 'DeFi Anthem',
      artist: 'Token Economy',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D',
      streamCount: 287430,
      price: 2.8,
      isForSale: true
    },
    {
      id: '2',
      title: 'Digital Nomad',
      artist: 'Crypto Punk',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
      streamCount: 98450,
      price: 1.8,
      isForSale: true
    }
  ]
};

const SongDetail = () => {
  // const { id } = useParams<{ id: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'details'>('details');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isListForSaleModalOpen, setIsListForSaleModalOpen] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  
  // In a real app, you would fetch the song data based on the ID
  const song = songDetails;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handlePurchase = () => {
    // In a real app, this would handle the purchase transaction
    setIsPurchaseModalOpen(false);
    // Show success message
  };

  const handleListForSale = () => {
    // In a real app, this would handle listing the NFT for sale
    setIsListForSaleModalOpen(false);
    // Show success message
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0] flex flex-col">
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
                        <p className="text-cairo-green font-bold text-2xl">{song.price} STARK</p>
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
                        <span className="text-white">#ETH-{song.id}-DREAM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Smart Contract</span>
                        <a href="#" className="text-[#0EA5E9] hover:underline truncate max-w-[180px]">
                          0x72f53...38F1
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
                />
              ))}
            </div>
          </div>
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
              <span className="text-white font-medium">{song.price} STARK</span>
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
              width={500} // Ensure this is explicitly defined
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
                  className="bg-[#0F0F0] border-[#333333] text-white"
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