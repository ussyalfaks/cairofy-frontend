import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface IPFSAudioPlayerProps {
  cid: string;
  mimeType?: string;
}

export default function IPFSAudioPlayer({ cid, mimeType = 'audio/mpeg' }: IPFSAudioPlayerProps) {
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        const response = await fetch(`/api/ipfs?cid=${cid}&mimeType=${mimeType}`);
        const data = await response.json();
        
        if (data.success) {
          setAudioUrls(data.gateways);
        } else {
          throw new Error('Failed to get gateways');
        }
      } catch (err) {
        console.error('Gateway fetch error:', err);
        toast.error('Failed to load audio sources');
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGateways();
  }, [cid, mimeType]);

  const handleError = async (currentSrc: string) => {
    // Rotate to next gateway
    setAudioUrls(prev => {
      const newUrls = prev.filter(url => url !== currentSrc);
      if (newUrls.length === 0) {
        setError(true);
        toast.error('All gateways failed - try refreshing');
      }
      return newUrls;
    });
  };

  if (error) return <div>Failed to load audio</div>;
  if (loading) return <div>Loading audio sources...</div>;

  return (
    <div className="audio-player">
      {audioUrls.map((url, index) => (
        <audio
          key={`${cid}-${index}`}
          controls
          onError={() => handleError(url)}
          style={{ display: index === 0 ? 'block' : 'none' }}
        >
          <source src={url} type={mimeType} />
          Your browser does not support the audio element.
        </audio>
      ))}
    </div>
  );
} 