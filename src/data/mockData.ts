import { VideoSource, Detection, Alert, AnalysisSummary, AnimalType, RiskLevel } from '@/types';

export const videoSources: VideoSource[] = [
  { id: '1', name: 'Main Street Cam', location: 'Downtown District', type: 'live', isOnline: true },
  { id: '2', name: 'Park Entrance', location: 'Riverside Park', type: 'live', isOnline: true },
  { id: '3', name: 'Highway Overpass', location: 'Interstate 405', type: 'live', isOnline: true },
  { id: '4', name: 'School Parking Lot', location: 'Lincoln Elementary', type: 'uploaded', isOnline: true },
  { id: '5', name: 'Suburban Trail', location: 'Oak Ridge', type: 'live', isOnline: false },
  { id: '6', name: 'Bridge Crossing', location: 'River Valley', type: 'live', isOnline: true },
  { id: '7', name: 'Night Patrol Feed', location: 'Industrial Zone', type: 'uploaded', isOnline: true },
  { id: '8', name: 'Forest Edge Cam', location: 'Pinewood Reserve', type: 'live', isOnline: false },
];

export const generateDetections = (sourceId: string): Detection[] => {
  const detections: Detection[] = [
    {
      id: 'd1',
      animalType: 'deer',
      confidence: 94,
      timestamp: 12,
      boundingBox: { x: 25, y: 30, width: 18, height: 25 },
      riskLevel: 'Medium',
    },
    {
      id: 'd2',
      animalType: 'moose',
      confidence: 87,
      timestamp: 45,
      boundingBox: { x: 55, y: 35, width: 22, height: 30 },
      riskLevel: 'High',
    },
    {
      id: 'd3',
      animalType: 'fox',
      confidence: 91,
      timestamp: 78,
      boundingBox: { x: 70, y: 60, width: 12, height: 15 },
      riskLevel: 'Low',
    },
    {
      id: 'd4',
      animalType: 'bear',
      confidence: 89,
      timestamp: 120,
      boundingBox: { x: 15, y: 45, width: 20, height: 28 },
      riskLevel: 'High',
    },
    {
      id: 'd5',
      animalType: 'boar',
      confidence: 82,
      timestamp: 156,
      boundingBox: { x: 40, y: 55, width: 16, height: 18 },
      riskLevel: 'Medium',
    },
    {
      id: 'd6',
      animalType: 'coyote',
      confidence: 78,
      timestamp: 198,
      boundingBox: { x: 60, y: 40, width: 14, height: 16 },
      riskLevel: 'Medium',
    },
    {
      id: 'd7',
      animalType: 'deer',
      confidence: 96,
      timestamp: 234,
      boundingBox: { x: 30, y: 25, width: 18, height: 24 },
      riskLevel: 'Low',
    },
    {
      id: 'd8',
      animalType: 'raccoon',
      confidence: 85,
      timestamp: 267,
      boundingBox: { x: 80, y: 70, width: 10, height: 12 },
      riskLevel: 'Low',
    },
  ];
  return detections;
};

const now = new Date();
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000);

export const alerts: Alert[] = [
  {
    id: 'a1',
    sourceId: '1',
    sourceName: 'Main Street Cam',
    animalType: 'moose',
    riskLevel: 'High',
    description: 'Moose crossing near busy intersection during rush hour',
    timestamp: minutesAgo(2),
  },
  {
    id: 'a2',
    sourceId: '2',
    sourceName: 'Park Entrance',
    animalType: 'bear',
    riskLevel: 'High',
    description: 'Bear spotted near playground area, authorities notified',
    timestamp: minutesAgo(8),
  },
  {
    id: 'a3',
    sourceId: '3',
    sourceName: 'Highway Overpass',
    animalType: 'deer',
    riskLevel: 'Medium',
    description: 'Deer herd approaching highway, speed advisory issued',
    timestamp: minutesAgo(15),
  },
  {
    id: 'a4',
    sourceId: '4',
    sourceName: 'School Parking Lot',
    animalType: 'coyote',
    riskLevel: 'Medium',
    description: 'Coyote detected near school perimeter during after-hours',
    timestamp: minutesAgo(23),
  },
  {
    id: 'a5',
    sourceId: '6',
    sourceName: 'Bridge Crossing',
    animalType: 'fox',
    riskLevel: 'Low',
    description: 'Fox crossing bridge, no traffic concerns',
    timestamp: minutesAgo(31),
  },
  {
    id: 'a6',
    sourceId: '1',
    sourceName: 'Main Street Cam',
    animalType: 'boar',
    riskLevel: 'Medium',
    description: 'Wild boar foraging near downtown restaurants',
    timestamp: minutesAgo(42),
  },
  {
    id: 'a7',
    sourceId: '7',
    sourceName: 'Night Patrol Feed',
    animalType: 'raccoon',
    riskLevel: 'Low',
    description: 'Raccoon activity near dumpsters, routine observation',
    timestamp: minutesAgo(55),
  },
  {
    id: 'a8',
    sourceId: '2',
    sourceName: 'Park Entrance',
    animalType: 'deer',
    riskLevel: 'Low',
    description: 'Deer grazing in park meadow, no public risk',
    timestamp: minutesAgo(67),
  },
];

export const analysisSummary: AnalysisSummary = {
  period: 'Last 30 minutes',
  totalDetections: 12,
  highRiskCount: 3,
  mostCommonAnimal: 'deer',
  summary: `In the last 30 minutes, 3 high-risk encounters were detected near residential areas. A moose was spotted crossing Main Street during peak traffic, prompting an immediate traffic advisory. Bear activity near Riverside Park playground has been flagged for urgent response. Deer populations show increased movement patterns suggesting seasonal migration. Recommend heightened monitoring on Highway 405 corridor during dusk hours.`,
};

export const animalTypes: AnimalType[] = ['deer', 'boar', 'bear', 'moose', 'fox', 'coyote', 'raccoon'];

export const riskLevels: RiskLevel[] = ['Low', 'Medium', 'High'];

export const getAnimalIcon = (animal: AnimalType): string => {
  const icons: Record<AnimalType, string> = {
    deer: '🦌',
    boar: '🐗',
    bear: '🐻',
    moose: '🫎',
    fox: '🦊',
    coyote: '🐺',
    raccoon: '🦝',
  };
  return icons[animal];
};

export const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'High':
      return 'destructive';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'success';
  }
};
