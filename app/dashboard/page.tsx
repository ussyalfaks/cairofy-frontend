"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  PlayCircle,
  PauseCircle,
  ListMusic,
  Library,
  Music,
  ShoppingBag,
  LineChart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layouts/Navbar";
import MusicPlayer from "@/components/MusicPlayer";
import SongCard from "@/components/SongCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample user data
const userData = {
  username: "Music Lover",
  subscription: {
    isActive: true,
    expiresAt: "2024-05-15",
    plan: "Monthly",
  },
  walletBalance: 125.5,
  purchasedSongs: [
    {
      id: "1",
      title: "Ethereum Dreams",
      artist: "Block Beats",
      coverImage:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D",
      streamCount: 145230,
      purchasedAt: "2023-11-10",
      isPurchased: true,
      isForSale: false,
    },
    {
      id: "2",
      title: "Digital Nomad",
      artist: "Crypto Punk",
      coverImage:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
      streamCount: 98450,
      purchasedAt: "2024-01-22",
      isPurchased: true,
      isForSale: true,
      price: 2.5,
    },
  ],
  recentlyPlayed: [
    {
      id: "3",
      title: "Cairo Nights",
      artist: "StarkNet Collective",
      coverImage:
        "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG11c2ljfGVufDB8fDB8fHww",
      streamCount: 217840,
      isPlaying: false,
      lastPlayed: "2 hours ago",
    },
    {
      id: "4",
      title: "Blockchain Beats",
      artist: "Web3 Audio",
      coverImage:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fHww",
      streamCount: 76540,
      isPlaying: false,
      lastPlayed: "5 hours ago",
    },
  ],
  playlists: [
    { id: "1", name: "Favorites", songCount: 12 },
    { id: "2", name: "Chill Vibes", songCount: 8 },
    { id: "3", name: "Workout Mix", songCount: 15 },
  ],
};

// Sample trending songs
const trendingSongs = [
  {
    id: "5",
    title: "Crypto Summer",
    artist: "Block Party",
    coverImage:
      "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBjb3ZlcnxlbnwwfHwwfHx8MA%3D%3D",
    streamCount: 354210,
    isForSale: true,
    price: 3.2,
  },
  {
    id: "6",
    title: "DeFi Anthem",
    artist: "Token Economy",
    coverImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D",
    streamCount: 287430,
    isForSale: true,
    price: 2.8,
  },
  {
    id: "7",
    title: "Web3 Vibes",
    artist: "Cairo Collective",
    coverImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
    streamCount: 198650,
    isForSale: true,
    price: 1.9,
  },
  {
    id: "8",
    title: "Blockchain Blues",
    artist: "Hash Function",
    coverImage:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG11c2ljfGVufDB8fDB8fHww",
    streamCount: 132540,
    isForSale: true,
    price: 1.5,
  },
];

const Dashboard = () => {
  const [playingSong, setPlayingSong] = useState<string | null>(null);

  const handlePlay = (songId: string) => {
    setPlayingSong(songId === playingSong ? null : songId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8">
          {/* Subscription Status Banner */}
          <div className="mb-8 bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  Welcome back, {userData.username}
                </h2>
                <div className="flex items-center">
                  {userData.subscription.isActive ? (
                    <>
                      <Badge className="bg-[#10B981] text-white mr-3">
                        Active Subscription
                      </Badge>
                      <span className="text-white/70 text-sm">
                        Renews on {formatDate(userData.subscription.expiresAt)}
                      </span>
                    </>
                  ) : (
                    <Badge variant="destructive" className="mr-3">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#0F0F0F] px-4 py-2 rounded-lg border border-[#333333]">
                  <p className="text-xs text-white/70 mb-1">Wallet Balance</p>
                  <p className="text-white font-medium">
                    {userData.walletBalance} STARK
                  </p>
                </div>

                {userData.subscription.isActive ? (
                  <Button variant="outline" className="btn-outline">
                    Manage Subscription
                  </Button>
                ) : (
                  <Button className="btn-primary">Subscribe Now</Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="discover" className="space-y-8">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-[#1A1A1A] border border-[#333333] p-1">
                <TabsTrigger
                  value="discover"
                  className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white"
                >
                  Discover
                </TabsTrigger>
                <TabsTrigger
                  value="collection"
                  className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white"
                >
                  My Collection
                </TabsTrigger>
                <TabsTrigger
                  value="playlists"
                  className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white"
                >
                  Playlists
                </TabsTrigger>
              </TabsList>

              <Link
                href="/marketplace"
                className="text-[#0EA5E9] hover:text-[#0EA5E9]/80 flex items-center text-sm"
              >
                Go to Marketplace
              </Link>
            </div>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-8 mt-4">
              {/* Recently Played */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recently Played
                  </h3>
                </div>

                <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-4">
                  {userData.recentlyPlayed.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between py-3 px-2 border-b border-[#333333] last:border-0"
                    >
                      <div className="flex items-center">
                        <div className="relative w-12 h-12 mr-4">
                          <Image
                            src={song.coverImage}
                            alt={song.title}
                            width={500}
                            height={500}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md opacity-0 hover:opacity-100 transition-opacity"
                            onClick={() => handlePlay(song.id)}
                          >
                            {playingSong === song.id ? (
                              <PauseCircle className="h-6 w-6 text-white" />
                            ) : (
                              <PlayCircle className="h-6 w-6 text-white" />
                            )}
                          </button>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">
                            {song.title}
                          </h4>
                          <p className="text-white/70 text-sm">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-white/50 text-sm mr-4">
                          {song.lastPlayed}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <ListMusic className="h-4 w-4 text-white/70" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Now */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Trending Now
                  </h3>
                  <Link
                    href="/marketplace"
                    className="text-[#0EA5E9] hover:text-[#0EA5E9]/80 text-sm"
                  >
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingSongs.map((song) => (
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
              </div>
            </TabsContent>

            {/* Collection Tab */}
            <TabsContent value="collection" className="space-y-8 mt-4">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    My NFT Collection
                  </h3>
                  <Link
                    href="/marketplace"
                    className="btn-outline text-sm py-2 px-4 rounded-lg"
                  >
                    Browse Marketplace
                  </Link>
                </div>

                {userData.purchasedSongs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {userData.purchasedSongs.map((song) => (
                      <SongCard
                        key={song.id}
                        title={song.title}
                        artist={song.artist}
                        coverImage={song.coverImage}
                        streamCount={song.streamCount}
                        price={song.price}
                        isPurchased={song.isPurchased}
                        isForSale={song.isForSale}
                        onPlay={() => handlePlay(song.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-8 text-center">
                    <ShoppingBag className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Your collection is empty
                    </h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                      Start building your NFT music collection by purchasing
                      songs from the marketplace.
                    </p>
                    <Button className="btn-primary" asChild>
                      <Link href="/marketplace">Browse Marketplace</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists" className="space-y-8 mt-4">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Library className="h-5 w-5 mr-2" />
                    My Playlists
                  </h3>
                  <Button
                    size="sm"
                    className="bg-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/30 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Playlist
                  </Button>
                </div>

                {userData.playlists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userData.playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 hover:border-[#0EA5E9]/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-[#0EA5E9]/20 rounded-md flex items-center justify-center">
                            <Music className="h-6 w-6 text-[#0EA5E9]" />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <PlayCircle className="h-5 w-5 text-white/70 hover:text-white" />
                          </Button>
                        </div>
                        <h4 className="font-medium text-white mb-1">
                          {playlist.name}
                        </h4>
                        <p className="text-white/70 text-sm">
                          {playlist.songCount} songs
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-8 text-center">
                    <Library className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No playlists yet
                    </h3>
                    <p className="text-white/70 mb-6">
                      Create your first playlist to organize your favorite
                      songs.
                    </p>
                    <Button className="bg-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/30">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Playlist
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MusicPlayer
        songTitle={
          playingSong
            ? [
                ...userData.recentlyPlayed,
                ...trendingSongs,
                ...userData.purchasedSongs,
              ].find((song) => song.id === playingSong)?.title
            : undefined
        }
        artist={
          playingSong
            ? [
                ...userData.recentlyPlayed,
                ...trendingSongs,
                ...userData.purchasedSongs,
              ].find((song) => song.id === playingSong)?.artist
            : undefined
        }
        coverImage={
          playingSong
            ? [
                ...userData.recentlyPlayed,
                ...trendingSongs,
                ...userData.purchasedSongs,
              ].find((song) => song.id === playingSong)?.coverImage
            : undefined
        }
      />

      {/* Footer not shown due to music player */}
    </div>
  );
};

export default Dashboard;
