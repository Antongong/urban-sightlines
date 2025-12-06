import { useState } from 'react';
import { AlertTriangle, Brain, Filter } from 'lucide-react';
import { Alert, AnalysisSummary, AnimalType, RiskLevel, TimeWindow } from '@/types';
import { animalTypes, riskLevels, getAnimalIcon, getRiskColor } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AlertPanelProps {
  alerts: Alert[];
  analysis: AnalysisSummary;
}

export function AlertPanel({ alerts, analysis }: AlertPanelProps) {
  const [animalFilter, setAnimalFilter] = useState<AnimalType | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeWindow>('1hour');

  const filteredAlerts = alerts.filter((alert) => {
    if (animalFilter !== 'all' && alert.animalType !== animalFilter) return false;
    if (riskFilter !== 'all' && alert.riskLevel !== riskFilter) return false;

    const now = new Date();
    const alertTime = new Date(alert.timestamp);
    const diffMinutes = (now.getTime() - alertTime.getTime()) / 60000;

    if (timeFilter === '10min' && diffMinutes > 10) return false;
    if (timeFilter === '1hour' && diffMinutes > 60) return false;
    if (timeFilter === '24hours' && diffMinutes > 1440) return false;

    return true;
  });

  const formatTimeAgo = (date: Date) => {
    const diffMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col h-full">
      <Tabs defaultValue="alerts" className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0 h-auto">
          <TabsTrigger
            value="alerts"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <Brain className="w-4 h-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="flex-1 flex flex-col mt-0 overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={animalFilter} onValueChange={(v) => setAnimalFilter(v as AnimalType | 'all')}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Animal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Animals</SelectItem>
                  {animalTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getAnimalIcon(type)} {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | 'all')}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  {riskLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeWindow)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10min">10 min</SelectItem>
                  <SelectItem value="1hour">1 hour</SelectItem>
                  <SelectItem value="24hours">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2">
            {filteredAlerts.map((alert, index) => {
              const riskColor = getRiskColor(alert.riskLevel);

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg border transition-all duration-300 animate-fade-in',
                    'bg-secondary/50 border-border hover:bg-secondary'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getAnimalIcon(alert.animalType)}</span>
                      <span className="text-sm font-medium capitalize">{alert.animalType}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        riskColor === 'destructive' && 'border-destructive text-destructive',
                        riskColor === 'warning' && 'border-warning text-warning',
                        riskColor === 'success' && 'border-success text-success'
                      )}
                    >
                      {alert.riskLevel}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{alert.sourceName}</span>
                    <span>{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No alerts match your filters
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="flex-1 mt-0 p-4 overflow-y-auto scrollbar-thin">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Brain className="w-5 h-5" />
              <span className="font-medium">AI Analysis</span>
            </div>

            <div className="text-xs text-muted-foreground">{analysis.period}</div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-2xl font-bold font-mono">{analysis.totalDetections}</div>
                <div className="text-xs text-muted-foreground">Detections</div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-2xl font-bold font-mono text-destructive">{analysis.highRiskCount}</div>
                <div className="text-xs text-muted-foreground">High Risk</div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-2xl">{getAnimalIcon(analysis.mostCommonAnimal)}</div>
                <div className="text-xs text-muted-foreground capitalize">Most Common</div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 border border-border">
              <p className="text-sm leading-relaxed text-secondary-foreground">
                {analysis.summary}
              </p>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Analysis updated automatically every 5 minutes
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
