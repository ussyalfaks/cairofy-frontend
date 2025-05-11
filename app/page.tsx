"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  MusicIcon,
  Wallet,
  Upload,
  ArrowRight,
  ShoppingBag,
  Music3,
  Coins,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SongCard from "@/components/SongCard";
// import ConnectWalletModal from '@/components/ConnectWalletModal';

// Sample featured songs data
const featuredSongs = [
  {
    id: "1",
    title: "Ethereum Dreams",
    artist: "Block Beats",
    coverImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D",
    streamCount: 145230,
    price: 2.5,
    isForSale: true,
  },
  {
    id: "2",
    title: "Digital Nomad",
    artist: "Crypto Punk",
    coverImage:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
    streamCount: 98450,
    price: 1.8,
    isForSale: true,
  },
  {
    id: "3",
    title: "Cairo Nights",
    artist: "StarkNet Collective",
    coverImage:
      "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG11c2ljfGVufDB8fDB8fHww",
    streamCount: 217840,
    price: 3.2,
    isForSale: true,
  },
  {
    id: "4",
    title: "Blockchain Beats",
    artist: "Web3 Audio",
    coverImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fHww",
    streamCount: 76540,
    price: 1.5,
    isForSale: true,
  },
];

const Page = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY;
        heroRef.current.style.transform = `translateY(${
          scrollPosition * 0.4
        }px)`;
        heroRef.current.style.opacity = `${1 - scrollPosition * 0.002}`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F0F]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 15, 0.7), rgba(15, 15, 15, 1)), url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          ref={heroRef}
        />

        <div className="container mx-auto px-4 md:px-8 relative z-10 mt-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#8B5CF6]">
              Cairofy
            </h1>
            <h2 className="text-xl md:text-3xl font-medium mb-6 text-white">
              Stream. Own. Earn.
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              The next generation music platform on StarkNet. Own your favorite
              songs as NFTs and support artists directly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className=" bg-purple-600 hover:bg-purple-800 group flex items-center justify-center animate-pulse-glow"
                asChild
              >
                <Link href="/marketplace">
                  <Play className="h-5 w-5 mr-2" />
                  Start Listening
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="btn-outline group flex items-center justify-center"
                asChild
              >
                <Link href="/Upload">
                  <MusicIcon className="h-5 w-5 mr-2" />
                  Become an Artist
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
      </div>

      {/* How It Works Section */}
      <section className="py-24 bg-[#0F0F0F]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#8B5CF6]">
              How It Works
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Cairofy combines traditional music streaming with Web3 technology,
              giving artists and listeners new possibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#1A1A1A] hover-glow">
              <div className="bg-[#0EA5E9]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Music3 className="h-8 w-8 text-[#0EA5E9]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Stream Music
              </h3>
              <p className="text-white/70">
                Subscribe to access unlimited streaming of all songs on the
                platform. Artists earn from every stream.
              </p>
            </div>

            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#1A1A1A] hover-glow">
              <div className="bg-[#10B981]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Own Songs
              </h3>
              <p className="text-white/70">
                Purchase songs to truly own them. Resell them on the marketplace
                and earn royalties from future sales.
              </p>
            </div>

            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#1A1A1A] hover-glow">
              <div className="bg-[8B5CF6]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Coins className="h-8 w-8 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Earn STARK
              </h3>
              <p className="text-white/70">
                Artists earn STARK tokens directly from streams and sales.
                Listeners earn by participating in the ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Music Section */}
      <section className="py-20 bg-[#0F0F0F]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Music</h2>
            <Link
              href="/marketplace"
              className="text-[#0EA5E9] hover:text-[#0EA5E9]/80 flex items-center transition-colors"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSongs.map((song) => (
              <SongCard
                key={song.id}
                title={song.title}
                artist={song.artist}
                coverImage={song.coverImage}
                streamCount={song.streamCount}
                price={song.price}
                isForSale={song.isForSale}
              />
            ))}
          </div>
        </div>
      </section>

      {/* For Artists Section */}
      <section className="py-24 bg-[#1A1A1A] border-y border-[#1A1A1A]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#8B5CF6]">
                For Artists
              </h2>
              <p className="text-white/80 text-lg mb-6">
                Take control of your music and connect directly with your fans.
                Earn from streams, sales, and resales without middlemen.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#10B981] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">100% Ownership</h4>
                    <p className="text-white/70">
                      Retain full rights to your music
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#10B981] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">
                      Fair Compensation
                    </h4>
                    <p className="text-white/70">
                      Earn 90% of primary sales and 10% royalties on secondary
                      sales
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#10B981] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Data Insights</h4>
                    <p className="text-white/70">
                      Access detailed analytics about your audience and earnings
                    </p>
                  </div>
                </li>
              </ul>

              <Button className="btn-secondary" asChild>
                <Link href="/upload">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your Music
                </Link>
              </Button>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#0EA5E9] to-[#10B981] rounded-xl blur-md opacity-50"></div>
                <Image
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Artist studio"
                  width={500}
                  height={500}
                  className="relative rounded-xl w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Listeners Section */}
      <section className="py-24 bg-[#0F0F0F]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] rounded-xl blur-md opacity-50"></div>
                <Image
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Music listener"
                  width={500}
                  height={50}
                  className="relative rounded-xl w-full h-96 object-cover"
                />
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#8B5CF6]">
                For Listeners
              </h2>
              <p className="text-white/80 text-lg mb-6">
                Enjoy your favorite music while truly supporting the artists.
                Own the music you love and even earn from your collection.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#0EA5E9] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">
                      Subscribe & Stream
                    </h4>
                    <p className="text-white/70">
                      Unlimited streaming with a simple STARK token subscription
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#0EA5E9] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">True Ownership</h4>
                    <p className="text-white/70">
                      Buy songs and own them forever, even offline
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#0EA5E9] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">
                      Investment Potential
                    </h4>
                    <p className="text-white/70">
                      Sell songs from your collection on the marketplace
                    </p>
                  </div>
                </li>
              </ul>

              <Button className="text-[#0EA5E9]" asChild>
                <Link href="/marketplace">
                  <Play className="h-5 w-5 mr-2" />
                  Start Listening
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0F0F0F] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/10 to-[#8B5CF6]/10 opacity-50"></div>

        <div className="container relative mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#8B5CF6]">
            Ready to Join the Future of Music?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Start streaming, owning, and earning today with Cairofy. Connect
            your wallet to begin your journey.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="text-[#0EA5E9]" asChild>
              <Link href="/marketplace">
                <Play className="h-5 w-5 mr-2" />
                Explore Music
              </Link>
            </Button>
            <Button variant="outline" className="btn-outline">
              <Wallet className="h-5 w-5 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Page;
