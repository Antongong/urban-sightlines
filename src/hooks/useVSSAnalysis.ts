import { useState, useCallback } from 'react';
import { 
  analyzeVideoForWildlife, 
  checkVSSHealth, 
  VSSAnalysisResult,
  addLiveStreamToVSS,
  summarizeVideo
} from '@/services/vssApi';
import { useToast } from '@/hooks/use-toast';

export interface AnalysisState {
  isAnalyzing: boolean;
  isVSSConnected: boolean;
  lastAnalysis: VSSAnalysisResult | null;
  error: string | null;
}

export function useVSSAnalysis() {
  const { toast } = useToast();
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    isVSSConnected: false,
    lastAnalysis: null,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    try {
      const isConnected = await checkVSSHealth();
      setState(prev => ({ ...prev, isVSSConnected: isConnected }));
      return isConnected;
    } catch (error) {
      setState(prev => ({ ...prev, isVSSConnected: false }));
      return false;
    }
  }, []);

  const analyzeVideo = useCallback(async (file: File): Promise<VSSAnalysisResult | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    
    try {
      toast({
        title: 'Uploading video...',
        description: 'Sending video to VSS for wildlife analysis',
      });

      const result = await analyzeVideoForWildlife(file);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        isVSSConnected: true,
        lastAnalysis: result,
      }));

      // Show detection result
      if (result.wildlifeDetected) {
        toast({
          title: '🦌 Wildlife Detected!',
          description: result.animalType 
            ? `A ${result.animalType} was detected in the video.`
            : 'A wild animal was detected in the video.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'No Wildlife Detected',
          description: 'No wild animals were found in the video.',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        lastAnalysis: {
          fileId: 'error',
          summary: `VSS Analysis Failed: ${errorMessage}`,
          wildlifeDetected: false,
          animalType: null,
          timestamp: new Date(),
          rawResponse: { id: '', object: '', created: 0, model: '', choices: [] },
        },
      }));

      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    }
  }, [toast]);

  const analyzeLiveStream = useCallback(async (streamUrl: string, name: string): Promise<string | null> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    
    try {
      const isConnected = await checkVSSHealth();
      if (!isConnected) {
        throw new Error('VSS backend is not available.');
      }

      toast({
        title: 'Adding live stream...',
        description: 'Connecting stream to VSS for wildlife monitoring',
      });

      const result = await addLiveStreamToVSS(streamUrl, name);
      
      // Start summarization for the live stream
      await summarizeVideo(result.id);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        isVSSConnected: true,
      }));

      toast({
        title: 'Stream Connected',
        description: 'Live stream is now being monitored for wildlife.',
      });

      return result.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
      }));

      toast({
        title: 'Stream Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    }
  }, [toast]);

  return {
    ...state,
    checkConnection,
    analyzeVideo,
    analyzeLiveStream,
  };
}
