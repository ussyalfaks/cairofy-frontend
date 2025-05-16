import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Heart
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';

interface MusicPlayerProps {
  songTitle?: string;
  artist?: string;
  coverImage?: string;
  audioSrc?: string;
}

const MusicPlayer = ({
  songTitle = "Not Playing",
  artist = "No Artist",
  coverImage = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBwbGF5ZXJ8ZW58MHx8MHx8fDA%3D",
  audioSrc = "",
}: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
    if (isMuted && newValue[0] > 0) {
      setIsMuted(false);
    }
  };

  const handleProgressChange = (newValue: number[]) => {
    const newTime = newValue[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/80 backdrop-blur-md border-t border-[#333333] py-3 px-4 z-40">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center">
        {/* Song Info */}
        <div className="flex items-center w-full sm:w-1/3 mb-3 sm:mb-0">
          <Image
            src={coverImage}
            alt={songTitle}
            width={500}
            height={500}
            className="w-12 h-12 rounded-md object-cover mr-3"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate">{songTitle}</h4>
            <p className="text-white/70 text-sm truncate">{artist}</p>
          </div>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`ml-2 p-2 rounded-full ${
              isLiked ? 'text-red-500' : 'text-white/50 hover:text-white'
            }`}
          >
            <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col w-full sm:w-2/5">
          <div className="flex items-center justify-center space-x-4 mb-1">
            <button className="text-white/70 hover:text-white p-1">
              <Shuffle className="h-4 w-4" />
            </button>
            <button className="text-white/70 hover:text-white p-1">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-primary rounded-full p-2 hover:bg-primary/90 hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="h-5 w-5 text-white" />
              )}
            </button>
            <button className="text-white/70 hover:text-white p-1">
              <SkipForward className="h-5 w-5" />
            </button>
            <button className="text-white/70 hover:text-white p-1">
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center w-full px-2">
            <span className="text-white/60 text-xs w-10 text-right mr-2">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 mx-2">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="cursor-pointer"
              />
            </div>
            <span className="text-white/60 text-xs w-10 ml-2">
              {formatTime(duration || 0)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="hidden sm:flex items-center justify-end w-full sm:w-1/4">
          <button
            onClick={toggleMute}
            className="text-white/70 hover:text-white p-1 mr-2"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <div className="w-24">
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
    </div>
  );
};

export default MusicPlayer;