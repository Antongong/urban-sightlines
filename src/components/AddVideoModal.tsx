import { useState } from 'react';
import { X, Link2, Upload, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AddVideoModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (source: { name: string; location: string; type: 'live' | 'uploaded'; url?: string }) => void;
}

export function AddVideoModal({ open, onClose, onAdd }: AddVideoModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleAddStream = () => {
    if (!name || !streamUrl) return;
    onAdd({ name, location, type: 'live', url: streamUrl });
    resetAndClose();
  };

  const handleAddUpload = () => {
    if (!name || !fileName) return;
    onAdd({ name, location, type: 'uploaded' });
    resetAndClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
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
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Add Video Source
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stream" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stream" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Live Stream
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stream" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="stream-name">Camera Name</Label>
              <Input
                id="stream-name"
                placeholder="e.g., Highway Exit 42"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-location">Location</Label>
              <Input
                id="stream-location"
                placeholder="e.g., Downtown District"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-url">Stream URL</Label>
              <Input
                id="stream-url"
                placeholder="rtsp:// or https://..."
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supports RTSP, HLS, and MPEG-DASH streams
              </p>
            </div>

            <Button
              onClick={handleAddStream}
              disabled={!name || !streamUrl}
              className="w-full"
            >
              Add Live Stream
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="upload-name">Source Name</Label>
              <Input
                id="upload-name"
                placeholder="e.g., Recorded Footage 01"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-location">Location</Label>
              <Input
                id="upload-location"
                placeholder="e.g., Forest Reserve"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Video File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
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
                        MP4, WebM, or AVI (max 500MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button
              onClick={handleAddUpload}
              disabled={!name || !fileName}
              className="w-full"
            >
              Upload and Analyze
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
