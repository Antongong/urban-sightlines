import { Detection } from '@/types';
import { getRiskColor, getAnimalIcon } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DetectionTimelineProps {
  detections: Detection[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function DetectionTimeline({ detections, duration, currentTime, onSeek }: DetectionTimelineProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="bg-card rounded-lg p-3 border border-border">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-muted-foreground">{formatTime(currentTime)}</span>
        <div className="flex-1 relative h-8">
          {/* Timeline track */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Detection markers */}
          {detections.map((detection) => {
            const position = (detection.timestamp / duration) * 100;
            const riskColor = getRiskColor(detection.riskLevel);

            return (
              <Tooltip key={detection.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSeek(detection.timestamp)}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full',
                      'transition-all duration-200 hover:scale-150 cursor-pointer z-10',
                      riskColor === 'destructive' && 'bg-destructive glow-danger',
                      riskColor === 'warning' && 'bg-warning glow-warning',
                      riskColor === 'success' && 'bg-success glow-success'
                    )}
                    style={{ left: `${position}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span>{getAnimalIcon(detection.animalType)}</span>
                    <span className="capitalize">{detection.animalType}</span>
                    <span className="text-muted-foreground">@ {formatTime(detection.timestamp)}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Playhead */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-4 bg-foreground rounded-full z-20"
            style={{ left: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground">{formatTime(duration)}</span>
      </div>
    </div>
  );
}
