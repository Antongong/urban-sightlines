import { Search, Radio, Settings, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  environment: 'demo' | 'production';
  onEnvironmentChange: (env: 'demo' | 'production') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isVSSConnected?: boolean;
}

export function Navbar({ environment, onEnvironmentChange, searchQuery, onSearchChange, isVSSConnected = false }: NavbarProps) {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Radio className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            Urban Wildlife Watch
          </h1>
        </div>
        
        <Badge 
          variant="outline" 
          className={isVSSConnected 
            ? 'border-success/50 text-success bg-success/10' 
            : 'border-muted-foreground/50 text-muted-foreground bg-muted/10'
          }
        >
          {isVSSConnected ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              NVIDIA VSS
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              VSS Offline
            </>
          )}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cameras..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-secondary border-border h-9"
          />
        </div>

        <Select value={environment} onValueChange={(v) => onEnvironmentChange(v as 'demo' | 'production')}>
          <SelectTrigger className="w-32 h-9 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="demo">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse-subtle" />
                Demo
              </span>
            </SelectItem>
            <SelectItem value="production">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                Production
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <button className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
