"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useAnimation, HTMLMotionProps } from "framer-motion";
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
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
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

const MotionImage = motion(Image);

const floatingShapesData = [
  // Left Side Shapes
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e500622e_floating-bg-shape-1-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 80, style: { top: '15%', left: '2%', opacity: 0.5, transform: 'rotate(10deg)' }, animationProps: { x: "0px", y: ["-8px", "8px"], duration: 6, delay: 0.2 } },
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e500627f_floating-bg-shape-3-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 70, style: { top: '50%', left: '1%', opacity: 0.45, transform: 'rotate(-15deg)' }, animationProps: { x: "0px", y: ["-5px", "5px"], duration: 1, delay: 0.8 } },
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e5006281_floating-bg-shape-11-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 75, style: { bottom: '15%', left: '3%', opacity: 0.5, transform: 'rotate(20deg)' }, animationProps: { x: ["-6px", "6px"], y: "0px", duration: 2, delay: 1.2 } },

  // Right Side Shapes
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e5006235_floating-bg-shape-2-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 90, style: { top: '20%', right: '1%', opacity: 0.5, transform: 'rotate(-5deg)' }, animationProps: { x: "0px", y: ["7px", "-7px"], duration: 4, delay: 0.5 } },
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e500627c_floating-bg-shape-4-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 65, style: { top: '55%', right: '2%', opacity: 0.4, transform: 'rotate(25deg)' }, animationProps: { x: "0px", y: ["-6px", "6px"], duration: 3, delay: 1 } },
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e500622b_floating-bg-shape-12-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 100, style: { bottom: '20%', right: '3%', opacity: 0.55, transform: 'rotate(-10deg)' }, animationProps: { x: ["5px", "-5px"], y: "0px", duration: 4, delay: 0.3 } },

  // Bottom Shapes
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e500622c_floating-bg-shape-5-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 95, style: { bottom: '5%', left: '20%', opacity: 0.45, transform: 'rotate(5deg)' }, animationProps: { x: "0px", y: ["-4px", "4px"], duration: 5.5, delay: 0.7 } },
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e500627d_floating-bg-shape-6-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 70, style: { bottom: '8%', left: '45%', opacity: 0.4, transform: 'translateX(-50%) rotate(-8deg)' }, animationProps: { x: ["-7px", "7px"], y:"0px", duration: 3, delay: 0.1 } }, 
  { src: "https://cdn.prod.website-files.com/6543db7e1cca9947e500617d/6543db7e1cca9947e5006282_floating-bg-shape-9-cryptomatic-webflow-ecommerce-template.jpg", alt: "", size: 110, style: { bottom: '3%', right: '25%', opacity: 0.5, transform: 'rotate(12deg)' }, animationProps: { x: "0px", y: ["6px", "-6px"], duration: 2, delay: 1.5 } },
];

const Page = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuredMusicRef = useRef<HTMLDivElement>(null);
  const forArtistsRef = useRef<HTMLDivElement>(null);
  const forListenersRef = useRef<HTMLDivElement>(null);

  const howItWorksInView = useInView(howItWorksRef as React.RefObject<Element>, { once: true, amount: 0.2 });
  const featuredMusicInView = useInView(featuredMusicRef as React.RefObject<Element>, { once: true, amount: 0.2 });
  const forArtistsInView = useInView(forArtistsRef as React.RefObject<Element>, { once: true, amount: 0.2 });
  const forListenersInView = useInView(forListenersRef as React.RefObject<Element>, { once: true, amount: 0.2 });

  const controls = useAnimation();

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

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  type MotionComponentProps = HTMLMotionProps<"div"> & {
    className?: string;
  };

  const MotionDiv = motion.div as React.ComponentType<MotionComponentProps>;
  const MotionUl = motion.ul as React.ComponentType<MotionComponentProps>;
  const MotionLi = motion.li as React.ComponentType<MotionComponentProps>;

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />

      {/* Hero Section */}
      <div
        ref={heroRef} // Added ref for parallax
        className="flex items-center overflow-hidden container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 grid-background rounded-xl"
      >
        <div
        className="w-full mt-3 rounded-xl"
        >
        <div className="container px-4 md:px-8 relative mt-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary cal-sans">
                Your Music, Reimagined.
            </h1>
            <h2 className="text-xl md:text-3xl font-medium mb-6 text-white">
              Cairofy: Stream. Own. Earn on StarkNet.
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Dive into the next generation of sound. Collect exclusive tracks as NFTs, directly support the artists you love, and unlock the true value of music.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className=" flex items-center justify-center animate-pulse-glow"
                asChild
              >
                <Link href="/marketplace" className="text-white">
                  <Play className="h-5 w-5 mr-2" />
                  Start Listening
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="flex items-center justify-center"
                asChild
              >
                <Link href="/upload" className="text-white">
                  <MusicIcon className="h-5 w-5 mr-2" />
                  Become an Artist
                </Link>
              </Button>
            </div>
            <MotionImage 
              src="/globe.png" 
              alt="globe" 
              width={500} 
              height={500} 
              className="w-full h-full mt-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
            />
          </div>
        </div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-secondary to-transparent" />
      </div>

      {/* How It Works Section */}
      <section 
        ref={howItWorksRef}
        className="relative overflow-hidden py-24 bg-secondary"
      >
        {floatingShapesData.map((shape, index) => (
          <motion.div
            key={index}
            style={{
              position: "absolute",
              zIndex: 0,
              top: shape.style.top,
              left: shape.style.left,
              right: shape.style.right,
              bottom: shape.style.bottom,
              opacity: shape.style.opacity,
              transform: shape.style.transform,
            }}
            animate={{ 
              y: shape.animationProps.y, 
              x: shape.animationProps.x 
            }}
            transition={{
              duration: shape.animationProps.duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              delay: shape.animationProps.delay
            }}
          >
            <Image
              src={shape.src}
              alt={shape.alt}
              width={shape.size}
              height={shape.size}
              priority={index < 3}
            />
          </motion.div>
        ))}
        <MotionDiv 
          className="relative z-10 container mx-auto px-4 md:px-8"
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <MotionDiv className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary cal-sans">
              How It Works
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Cairofy combines traditional music streaming with Web3 technology,
              giving artists and listeners new possibilities.
            </p>
          </MotionDiv>

          <MotionDiv 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
          >
            <MotionDiv variants={itemVariants} className="backdrop-blur-[20px] bg-white/2 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="bg-[#0EA5E9]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
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
            </MotionDiv>

            <MotionDiv variants={itemVariants} className="backdrop-blur-[20px] bg-white/2 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Own Songs
                </h3>
                <p className="text-white/70">
                  Purchase songs to truly own them. Resell them on the marketplace
                  and earn royalties from future sales.
                </p>
              </div>
            </MotionDiv>

            <MotionDiv variants={itemVariants} className="backdrop-blur-[20px] bg-white/2 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <div className="bg-[#8B5CF6]/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
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
            </MotionDiv>
          </MotionDiv>
        </MotionDiv>
        
      </section>

      {/* Featured Music Section */}
      <section ref={featuredMusicRef} className="py-20 bg-[#0F0F0F]">
        <MotionDiv 
          className="container mx-auto px-4 md:px-8"
          initial="hidden"
          animate={featuredMusicInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <MotionDiv className="flex justify-between items-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary cal-sans">Featured Music</h2>
            <Link
              href="/marketplace"
              className="text-white flex items-center transition-colors hover:text-primary"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </MotionDiv>

          <MotionDiv 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            {featuredSongs.map((song, index) => (
              <MotionDiv
                key={song.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <SongCard
                  title={song.title}
                  artist={song.artist}
                  coverImage={song.coverImage}
                  streamCount={song.streamCount}
                  price={song.price}
                  isForSale={song.isForSale}
                />
              </MotionDiv>
            ))}
          </MotionDiv>
        </MotionDiv>
      </section>

      {/* For Artists Section */}
      <section ref={forArtistsRef} className="py-24 bg-secondary border-y border-[#1A1A1A]">
        <MotionDiv 
          className="container mx-auto px-4 md:px-8"
          initial="hidden"
          animate={forArtistsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <MotionDiv variants={itemVariants} className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary cal-sans">
                For Artists
              </h2>
              <p className="text-white/80 text-lg mb-6">
                Take control of your music and connect directly with your fans.
                Earn from streams, sales, and resales without middlemen.
              </p>

              <MotionUl 
                className="space-y-4 mb-8"
                variants={containerVariants}
              >
                <MotionLi variants={itemVariants} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">100% Ownership</h4>
                    <p className="text-white/70">
                      Retain full rights to your music
                    </p>
                  </div>
                </MotionLi>
                <MotionLi variants={itemVariants} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">
                      Fair Compensation
                    </h4>
                    <p className="text-white/70">
                      Earn 90% of primary sales and 10% royalties on secondary
                      sales
                    </p>
                  </div>
                </MotionLi>
                <MotionLi variants={itemVariants} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Data Insights</h4>
                    <p className="text-white/70">
                      Access detailed analytics about your audience and earnings
                    </p>
                  </div>
                </MotionLi>
              </MotionUl>

              <MotionDiv variants={itemVariants} className="btn-secondary">
                <Link href="/upload" className="text-white">
                  <Button>
                                      <Upload className="h-5 w-5 mr-2" />
                  Upload Your Music
                  </Button>
                </Link>
              </MotionDiv>
            </MotionDiv>

            <MotionDiv 
              variants={itemVariants}
              className="order-1 lg:order-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="absolute rounded-xl blur-md opacity-50"></div>
                <Image
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Artist studio"
                  width={500}
                  height={500}
                  className="relative rounded-xl w-full h-96 object-cover"
                />
              </div>
            </MotionDiv>
          </div>
        </MotionDiv>
      </section>

      {/* For Listeners Section */}
      <section ref={forListenersRef} className="py-24 bg-[#0F0F0F]">
        <MotionDiv 
          className="container mx-auto px-4 md:px-8"
          initial="hidden"
          animate={forListenersInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <MotionDiv 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="absolute rounded-xl blur-md opacity-50"></div>
                <Image
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Music listener"
                  width={500}
                  height={50}
                  className="relative rounded-xl w-full h-96 object-cover"
                />
              </div>
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary cal-sans">
                For Listeners
              </h2>
              <p className="text-white/80 text-lg mb-6">
                Enjoy your favorite music while truly supporting the artists.
                Own the music you love and even earn from your collection.
              </p>

              <MotionUl 
                className="space-y-4 mb-8"
                variants={containerVariants}
              >
                <MotionLi variants={itemVariants} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">
                      Subscribe & Stream
                    </h4>
                    <p className="text-white/70">
                      Unlimited streaming with a simple STARK token subscription
                    </p>
                  </div>
                </MotionLi>
                <MotionLi variants={itemVariants} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">True Ownership</h4>
                    <p className="text-white/70">
                      Buy songs and own them forever, even offline
                    </p>
                  </div>
                </MotionLi>
                <MotionLi variants={itemVariants} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">
                      Investment Potential
                    </h4>
                    <p className="text-white/70">
                      Sell songs from your collection on the marketplace
                    </p>
                  </div>
                </MotionLi>
              </MotionUl>

              <MotionDiv variants={itemVariants} className="text-white">
                <Link href="/marketplace" className="text-white">
<Button>                  <Play className="h-5 w-5 mr-2" />
                  Start Listening</Button>
                </Link>
              </MotionDiv>
            </MotionDiv>
          </div>
        </MotionDiv>
      </section>

      <Footer />
    </div>
  );
};

export default Page;
