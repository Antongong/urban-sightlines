import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Detection, VideoSource } from '@/types';
import { DetectionTimeline } from './DetectionTimeline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  source: VideoSource | null;
  detections: Detection[];
}

export function VideoPlayer({ source, detections }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300);
  const [isMuted, setIsMuted] = useState(true);

  const isRealVideo = source?.type === 'uploaded' && source?.url;

  useEffect(() => {
    if (isRealVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isRealVideo]);

  useEffect(() => {
    if (isRealVideo && videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, isRealVideo]);

  // Simulated playback for non-uploaded sources
  useEffect(() => {
    if (isRealVideo || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) return 0;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isRealVideo, duration]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (isRealVideo && videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  if (!source) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No camera selected</p>
          <p className="text-sm mt-1">Select a camera from the sidebar to begin monitoring</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Video area */}
      <div className="relative flex-1 bg-background rounded-lg overflow-hidden border border-border min-h-[400px]">
        {isRealVideo ? (
          <video
            ref={videoRef}
            src={source.url}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            playsInline
          />
        ) : (
          <>
            {/* Simulated video background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40" />
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 4px)',
                }}
              />
            </div>
          </>
        )}

        {/* Camera info overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="glass rounded px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  source.isOnline ? 'bg-success animate-pulse-subtle' : 'bg-muted-foreground'
                )}
              />
              <span className="text-sm font-medium">{source.name}</span>
              <span className="text-xs text-muted-foreground">• {source.location}</span>
            </div>
          </div>

          <div className="glass rounded px-3 py-1.5">
            <span className="text-xs font-mono text-muted-foreground">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 glass p-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={([value]) => handleSeek(value)}
                className="cursor-pointer"
              />
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <DetectionTimeline
        detections={detections}
        duration={duration}
        currentTime={currentTime}
        onSeek={handleSeek}
      />
    </div>
  );
}
