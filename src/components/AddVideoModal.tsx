import { useState, useRef } from 'react';
import { Link2, Upload, Video, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AddVideoModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (source: { 
    name: string; 
    location: string; 
    type: 'live' | 'uploaded'; 
    url?: string;
    file?: File;
  }) => void;
  isAnalyzing?: boolean;
  isVSSConnected?: boolean;
}

export function AddVideoModal({ open, onClose, onAdd, isAnalyzing = false, isVSSConnected = false }: AddVideoModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddStream = () => {
    if (!name || !streamUrl) return;
    onAdd({ name, location, type: 'live', url: streamUrl });
    resetAndClose();
  };

  const handleAddUpload = () => {
    if (!name || !fileName || !fileUrl || !selectedFile) return;
    onAdd({ name, location, type: 'uploaded', url: fileUrl, file: selectedFile });
    // Don't close immediately - let the parent handle closing after analysis
    if (!isVSSConnected) {
      resetAndClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const resetAndClose = () => {
    setName('');
    setLocation('');
    setStreamUrl('');
    setFileName('');
    setFileUrl(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !isAnalyzing && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Add Video Source
            </DialogTitle>
            <Badge 
              variant="outline" 
              className={isVSSConnected 
                ? 'border-success text-success' 
                : 'border-muted-foreground text-muted-foreground'
              }
            >
              {isVSSConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  VSS Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  VSS Offline
                </>
              )}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Video
            </TabsTrigger>
            <TabsTrigger value="stream" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Live Stream
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="upload-name">Source Name</Label>
              <Input
                id="upload-name"
                placeholder="e.g., Recorded Footage 01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-location">Location</Label>
              <Input
                id="upload-location"
                placeholder="e.g., Forest Reserve"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label>Video File</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isAnalyzing 
                    ? 'border-muted cursor-not-allowed opacity-50' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mkv,video/webm,video/avi,.mp4,.mkv,.webm,.avi"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                  disabled={isAnalyzing}
                />
                <label htmlFor="video-upload" className={isAnalyzing ? 'cursor-not-allowed' : 'cursor-pointer'}>
                  {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Video className="w-5 h-5 text-primary" />
                      <span>{fileName}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, MKV, WebM, or AVI (H.264/H.265)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {isVSSConnected && (
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-medium">Wildlife Analysis Enabled:</span> Your video will be automatically analyzed by NVIDIA VSS to detect wild animals (deer, bear, moose, fox, boar, etc.).
                </p>
              </div>
            )}

            <Button
              onClick={handleAddUpload}
              disabled={!name || !fileName || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Video...
                </>
              ) : (
                <>Upload {isVSSConnected ? '& Analyze' : 'Video'}</>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="stream" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="stream-name">Camera Name</Label>
              <Input
                id="stream-name"
                placeholder="e.g., Highway Exit 42"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-location">Location</Label>
              <Input
                id="stream-location"
                placeholder="e.g., Downtown District"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-url">Stream URL</Label>
              <Input
                id="stream-url"
                placeholder="rtsp:// or https://..."
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">
                Supports RTSP, HLS, and MPEG-DASH streams (H.264/H.265)
              </p>
            </div>

            {isVSSConnected && (
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-medium">Live Monitoring:</span> Stream will be continuously monitored for wildlife detection using NVIDIA VSS.
                </p>
              </div>
            )}

            <Button
              onClick={handleAddStream}
              disabled={!name || !streamUrl || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting Stream...
                </>
              ) : (
                'Add Live Stream'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
