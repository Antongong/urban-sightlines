import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CameraSidebar } from '@/components/CameraSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AlertPanel } from '@/components/AlertPanel';
import { AddVideoModal } from '@/components/AddVideoModal';
import { videoSources as initialSources, generateDetections, alerts as mockAlerts, analysisSummary as mockAnalysisSummary } from '@/data/mockData';
import { VideoSource, Alert, AnalysisSummary, AnimalType } from '@/types';
import { useVSSAnalysis } from '@/hooks/useVSSAnalysis';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [environment, setEnvironment] = useState<'demo' | 'production'>('demo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>('1');
  const [sources, setSources] = useState<VideoSource[]>(initialSources);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary>(mockAnalysisSummary);

  const { 
    isAnalyzing, 
    isVSSConnected, 
    lastAnalysis, 
    checkConnection, 
    analyzeVideo,
    analyzeLiveStream 
  } = useVSSAnalysis();

  // Check VSS connection on mount and periodically (every 30s)
  useEffect(() => {
    checkConnection();
    
    const intervalId = setInterval(() => {
      checkConnection();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [checkConnection]);

  // Also check when modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      checkConnection();
    }
  }, [isAddModalOpen, checkConnection]);

  const selectedSource = useMemo(
    () => sources.find((s) => s.id === selectedSourceId) || null,
    [sources, selectedSourceId]
  );

  const detections = useMemo(
    () => (selectedSourceId ? generateDetections(selectedSourceId) : []),
    [selectedSourceId]
  );

  // Update alerts and analysis when we get VSS results
  useEffect(() => {
    if (lastAnalysis && lastAnalysis.wildlifeDetected) {
      const newAlert: Alert = {
        id: `vss-${Date.now()}`,
        sourceId: 'vss-analysis',
        sourceName: 'VSS Analysis',
        animalType: (lastAnalysis.animalType as AnimalType) || 'deer',
        riskLevel: 'Medium',
        description: lastAnalysis.summary.substring(0, 150),
        timestamp: lastAnalysis.timestamp,
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
      // Update analysis summary
      setAnalysisSummary(prev => ({
        ...prev,
        totalDetections: prev.totalDetections + 1,
        summary: lastAnalysis.summary,
      }));
    }
  }, [lastAnalysis]);

  const handleAddSource = async (source: { 
    name: string; 
    location: string; 
    type: 'live' | 'uploaded'; 
    url?: string;
    file?: File;
  }) => {
    const newSource: VideoSource = {
      id: `custom-${Date.now()}`,
      name: source.name,
      location: source.location || 'Custom Location',
      type: source.type,
      isOnline: true,
      url: source.url,
    };

    // Add source and select it
    setSources((prev) => [...prev, newSource]);
    setSelectedSourceId(newSource.id);

    // Always attempt VSS analysis for uploaded videos with a file
    if (source.file && source.type === 'uploaded') {
      // Trigger VSS analysis (will show error toast if VSS is offline)
      const result = await analyzeVideo(source.file);
      
      if (result) {
        // Update the source with VSS file ID for reference
        setSources(prev => prev.map(s => 
          s.id === newSource.id 
            ? { ...s, vssFileId: result.fileId } as VideoSource
            : s
        ));
      }
      
      setIsAddModalOpen(false);
    } else if (source.type === 'live' && source.url) {
      // For live streams, try to connect to VSS monitoring
      const streamId = await analyzeLiveStream(source.url, source.name);
      
      if (streamId) {
        setSources(prev => prev.map(s => 
          s.id === newSource.id 
            ? { ...s, vssStreamId: streamId } as VideoSource
            : s
        ));
      }
      
      setIsAddModalOpen(false);
    } else {
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar
        environment={environment}
        onEnvironmentChange={setEnvironment}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isVSSConnected={isVSSConnected}
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
          <VideoPlayer 
            source={selectedSource} 
            detections={detections} 
            lastAnalysis={lastAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </main>

        <AlertPanel alerts={alerts} analysis={analysisSummary} />
      </div>

      <AddVideoModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSource}
        isAnalyzing={isAnalyzing}
        isVSSConnected={isVSSConnected}
      />
    </div>
  );
};

export default Index;
