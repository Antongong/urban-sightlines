import { Detection } from '@/types';
import { getAnimalIcon, getRiskColor } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface DetectionOverlayProps {
  detections: Detection[];
  currentTime: number;
}

export function DetectionOverlay({ detections, currentTime }: DetectionOverlayProps) {
  // Show detections that are within 3 seconds of current time
  const visibleDetections = detections.filter(
    (d) => Math.abs(d.timestamp - currentTime) < 3
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {visibleDetections.map((detection) => {
        const riskColor = getRiskColor(detection.riskLevel);
        
        return (
          <div
            key={detection.id}
            className={cn(
              'absolute border-2 rounded-sm transition-all duration-300 animate-fade-in',
              riskColor === 'destructive' && 'border-destructive',
              riskColor === 'warning' && 'border-warning',
              riskColor === 'success' && 'border-success'
            )}
            style={{
              left: `${detection.boundingBox.x}%`,
              top: `${detection.boundingBox.y}%`,
              width: `${detection.boundingBox.width}%`,
              height: `${detection.boundingBox.height}%`,
            }}
          >
            {/* Corner accents */}
            <div
              className={cn(
                'absolute -top-0.5 -left-0.5 w-2 h-2 border-l-2 border-t-2',
                riskColor === 'destructive' && 'border-destructive',
                riskColor === 'warning' && 'border-warning',
                riskColor === 'success' && 'border-success'
              )}
            />
            <div
              className={cn(
                'absolute -top-0.5 -right-0.5 w-2 h-2 border-r-2 border-t-2',
                riskColor === 'destructive' && 'border-destructive',
                riskColor === 'warning' && 'border-warning',
                riskColor === 'success' && 'border-success'
              )}
            />
            <div
              className={cn(
                'absolute -bottom-0.5 -left-0.5 w-2 h-2 border-l-2 border-b-2',
                riskColor === 'destructive' && 'border-destructive',
                riskColor === 'warning' && 'border-warning',
                riskColor === 'success' && 'border-success'
              )}
            />
            <div
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-2 h-2 border-r-2 border-b-2',
                riskColor === 'destructive' && 'border-destructive',
                riskColor === 'warning' && 'border-warning',
                riskColor === 'success' && 'border-success'
              )}
            />

            {/* Label */}
            <div
              className={cn(
                'absolute -top-7 left-0 px-2 py-0.5 rounded text-xs font-mono font-medium flex items-center gap-1.5',
                riskColor === 'destructive' && 'bg-destructive text-destructive-foreground',
                riskColor === 'warning' && 'bg-warning text-warning-foreground',
                riskColor === 'success' && 'bg-success text-success-foreground'
              )}
            >
              <span>{getAnimalIcon(detection.animalType)}</span>
              <span className="capitalize">{detection.animalType}</span>
              <span className="opacity-80">{detection.confidence}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
