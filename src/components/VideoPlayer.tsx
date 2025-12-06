import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { VideoSource } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { VSSAnalysisResult } from '@/services/vssApi';

interface VideoPlayerProps {
  source: VideoSource | null;
  lastAnalysis?: VSSAnalysisResult | null;
  isAnalyzing?: boolean;
}

export function VideoPlayer({ source, lastAnalysis, isAnalyzing = false }: VideoPlayerProps) {
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

        {/* VSS Analysis Status Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <div>
                <p className="text-lg font-medium">Analyzing Video</p>
                <p className="text-sm text-muted-foreground">NVIDIA VSS is scanning for wildlife...</p>
              </div>
            </div>
          </div>
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


      {/* VSS Analysis Output - Always visible */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          VSS Analysis Output
        </h3>
        
        {isAnalyzing ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Sending video to VSS for analysis...</span>
          </div>
        ) : lastAnalysis ? (
          <div className="space-y-3">
            <div className={cn(
              "rounded-md p-3 border",
              lastAnalysis.wildlifeDetected 
                ? "border-warning bg-warning/10" 
                : "border-success bg-success/10"
            )}>
              <div className="flex items-center gap-2">
                {lastAnalysis.wildlifeDetected ? (
                  <CheckCircle2 className="w-4 h-4 text-warning" />
                ) : (
                  <XCircle className="w-4 h-4 text-success" />
                )}
                <span className="text-sm font-medium">
                  {lastAnalysis.wildlifeDetected 
                    ? `Wildlife Detected${lastAnalysis.animalType ? `: ${lastAnalysis.animalType}` : ''}`
                    : 'No Wildlife Detected'
                  }
                </span>
              </div>
            </div>
            
            <div className="bg-secondary/50 rounded-md p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Full Response:</p>
              <p className="text-sm whitespace-pre-wrap font-mono">
                {lastAnalysis.summary}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Analyzed at {lastAnalysis.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No analysis results yet. Click "+ Add Video Source" and upload a video to analyze it for wildlife via the VSS API.
          </p>
        )}
      </div>
    </div>
  );
}
