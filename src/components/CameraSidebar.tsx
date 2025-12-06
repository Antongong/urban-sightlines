import { Video, Upload, Plus, Wifi, WifiOff } from 'lucide-react';
import { VideoSource } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CameraSidebarProps {
  sources: VideoSource[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddSource: () => void;
  searchQuery: string;
}

export function CameraSidebar({ sources, selectedId, onSelect, onAddSource, searchQuery }: CameraSidebarProps) {
  const filteredSources = sources.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-3 border-b border-sidebar-border">
        <Button
          onClick={onAddSource}
          variant="outline"
          className="w-full justify-start gap-2 bg-sidebar-accent border-sidebar-border hover:bg-sidebar-accent/80"
        >
          <Plus className="w-4 h-4" />
          Add Video Source
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {filteredSources.map((source) => (
          <button
            key={source.id}
            onClick={() => onSelect(source.id)}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-md transition-all duration-200',
              'flex items-start gap-3 group',
              selectedId === source.id
                ? 'bg-primary/15 border border-primary/30'
                : 'hover:bg-sidebar-accent border border-transparent'
            )}
          >
            <div className="relative mt-0.5">
              {source.type === 'live' ? (
                <Video className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Upload className="w-4 h-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-sidebar',
                  source.isOnline ? 'bg-success' : 'bg-muted-foreground'
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-medium truncate',
                  selectedId === source.id ? 'text-primary' : 'text-sidebar-foreground'
                )}
              >
                {source.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{source.location}</p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {source.isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-success" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </button>
        ))}

        {filteredSources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No cameras found
          </div>
        )}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{sources.filter((s) => s.isOnline).length} online</span>
          <span>{sources.length} total</span>
        </div>
      </div>
    </aside>
  );
}
