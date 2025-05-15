"use client";
// import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Heart, Clock, Music } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Navbar from '@/components/layouts/Navbar';
import SongCard from '@/components/SongCard';

// Sample user data - in a real app, this would come from an API
const userData = {
  username: 'Music Collector',
  walletAddress: '0x1234...5678',
  memberSince: 'April 2023',
  rewardsPoints: 250,
  nftCollection: [
    {
      id: '1',
      title: 'Cosmic Harmony',
      artist: 'Stellar Beats',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D',
      streamCount: 145230,
      isOwned: true
    },
    {
      id: '2',
      title: 'Digital Dreams',
      artist: 'Crypto Composer',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
      streamCount: 98450,
      isOwned: true
    }
  ]
};

const Profile = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0]">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 text-center">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4 ring-2 ring-[#0EA5E9] ring-offset-2 ring-offset-[#1A1A1A]">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-[#0EA5E9]/20 text-[#0EA5E9]">MC</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-white mb-1">{userData.username}</h2>
                <p className="text-white/60 text-sm font-mono mb-2">{userData.walletAddress}</p>
                <p className="text-white/40 text-sm">Member since {userData.memberSince}</p>
              </div>
              
              <div className="mt-6 p-4 bg-[#0F0F0] rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Music className="h-5 w-5 text-[#8B5CF6]" />
                  <span className="text-2xl font-bold text-white">{userData.rewardsPoints}</span>
                </div>
                <p className="text-white/60 text-sm">Rewards earned from listening</p>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button className="w-full bg-[#8B5CF6] hover:bg-[#8B5CF6]/90">
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full border-[#333333] hover:bg-[#0F0F0]">
                  Withdraw Rewards
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <Tabs defaultValue="collection" className="space-y-8">
              <div className="border-b border-[#333333]">
                <TabsList className="bg-transparent">
                  <TabsTrigger 
                    value="collection"
                    className="data-[state=active]:text-[#8B5CF6] data-[state=active]:border-[#8B5CF6] relative px-4 py-2 text-white/70 hover:text-white border-b-2 border-transparent data-[state=active]:border-b-2"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    My Collection
                  </TabsTrigger>
                  <TabsTrigger 
                    value="favorites"
                    className="data-[state=active]:text-[#8B5CF6] data-[state=active]:border-[#8B5CF6] relative px-4 py-2 text-white/70 hover:text-white border-b-2 border-transparent data-[state=active]:border-b-2"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="data-[state=active]:text-[#8B5CF6] data-[state=active]:border-[#8B5CF6] relative px-4 py-2 text-white/70 hover:text-white border-b-2 border-transparent data-[state=active]:border-b-2"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Listening History
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="collection" className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-6">My Collection</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userData.nftCollection.map((song) => (
                    <SongCard
                      key={song.id}
                      title={song.title}
                      artist={song.artist}
                      coverImage={song.coverImage}
                      streamCount={song.streamCount}
                      isPurchased={song.isOwned}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="favorites">
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No favorites yet</h3>
                  <p className="text-white/60 mb-6">Start adding songs to your favorites</p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No listening history</h3>
                  <p className="text-white/60 mb-6">Your listening history will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;