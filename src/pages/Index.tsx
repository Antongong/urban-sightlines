import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { CameraSidebar } from '@/components/CameraSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AlertPanel } from '@/components/AlertPanel';
import { AddVideoModal } from '@/components/AddVideoModal';
import { videoSources as initialSources, generateDetections, alerts, analysisSummary } from '@/data/mockData';
import { VideoSource } from '@/types';

const Index = () => {
  const [environment, setEnvironment] = useState<'demo' | 'production'>('demo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>('1');
  const [sources, setSources] = useState<VideoSource[]>(initialSources);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedSource = useMemo(
    () => sources.find((s) => s.id === selectedSourceId) || null,
    [sources, selectedSourceId]
  );

  const detections = useMemo(
    () => (selectedSourceId ? generateDetections(selectedSourceId) : []),
    [selectedSourceId]
  );

  const handleAddSource = (source: { name: string; location: string; type: 'live' | 'uploaded' }) => {
    const newSource: VideoSource = {
      id: `custom-${Date.now()}`,
      name: source.name,
      location: source.location || 'Custom Location',
      type: source.type,
      isOnline: true,
    };
    setSources((prev) => [...prev, newSource]);
    setSelectedSourceId(newSource.id);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar
        environment={environment}
        onEnvironmentChange={setEnvironment}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex overflow-hidden">
        <CameraSidebar
          sources={sources}
          selectedId={selectedSourceId}
          onSelect={setSelectedSourceId}
          onAddSource={() => setIsAddModalOpen(true)}
          searchQuery={searchQuery}
        />

        <main className="flex-1 p-4 overflow-hidden">
          <VideoPlayer source={selectedSource} detections={detections} />
        </main>

        <AlertPanel alerts={alerts} analysis={analysisSummary} />
      </div>

      <AddVideoModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSource}
      />
    </div>
  );
};

export default Index;
