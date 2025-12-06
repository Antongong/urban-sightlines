export type RiskLevel = 'Low' | 'Medium' | 'High';

export type AnimalType = 'deer' | 'boar' | 'bear' | 'moose' | 'fox' | 'coyote' | 'raccoon';

export type SourceType = 'live' | 'uploaded';

export interface VideoSource {
  id: string;
  name: string;
  location: string;
  type: SourceType;
  isOnline: boolean;
  thumbnailUrl?: string;
  url?: string;
}

export interface Detection {
  id: string;
  animalType: AnimalType;
  confidence: number;
  timestamp: number; // seconds into video
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  riskLevel: RiskLevel;
}

export interface Alert {
  id: string;
  sourceId: string;
  sourceName: string;
  animalType: AnimalType;
  riskLevel: RiskLevel;
  description: string;
  timestamp: Date;
}

export interface AnalysisSummary {
  period: string;
  totalDetections: number;
  highRiskCount: number;
  mostCommonAnimal: AnimalType;
  summary: string;
}

export type TimeWindow = '10min' | '1hour' | '24hours';
