"use client";

import { useState } from 'react';
import { Play, Pause, Heart, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SongCardProps {
  title: string;
  artist: string;
  coverImage: string;
  streamCount: number;
  price?: number;
  isPurchased?: boolean;
  isForSale?: boolean;
  onPlay?: () => void;
  className?: string;
}

const SongCard = ({
  title,
  artist,
  coverImage,
  streamCount,
  price,
  isPurchased = false,
  isForSale = false,
  onPlay,
  className,
}: SongCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying);
    if (onPlay) onPlay();
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className={cn(
      "group card-glow rounded-xl overflow-hidden flex flex-col",
      className
    )}>
      <div className="relative overflow-hidden">
        <Image
          src={coverImage}
          alt={`${title} by ${artist}`}
          width={500}
          height={500} 
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="bg-[#0EA5E9]/90 rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white" />
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-white line-clamp-1">{title}</h3>
            <p className="text-white/70 text-sm">{artist}</p>
          </div>
          <button
            onClick={handleLikeClick}
            className={`p-1 rounded-full transition-colors ${
              isLiked ? 'text-red-500' : 'text-white/50 hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-white/60 text-xs">
            {streamCount.toLocaleString()} streams
          </span>
          
          <div className="flex items-center space-x-1">
            <button className="p-1 text-white/50 hover:text-white transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            
            {isForSale && !isPurchased && (
              <Button
                size="sm"
                className="ml-2 bg-[#10B981]/90 hover:bg-[#10B981] text-white text-xs px-2 py-1 rounded flex items-center"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                <span>{price} STARK</span>
              </Button>
            )}
            
            {isPurchased && (
              <span className="text-[#0EA5E9]/90 text-xs font-medium">
                Owned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;