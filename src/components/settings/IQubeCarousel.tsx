import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Brain, Database } from 'lucide-react';
import { MetaQube } from '@/lib/types';
import { cn } from '@/lib/utils';
import { metaQubesData } from '@/components/layout/sidebar/sidebarData';
import ScoreTooltip from '@/components/shared/ScoreTooltips';

interface IQubeCarouselProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMetaQube: MetaQube;
  onQubeSelect: (qubeId: string) => void;
  activeQubes: {[key: string]: boolean};
  onToggleActive: (qubeName: string) => void;
  getProfileImageUrl: (qubeId: string) => string | null;
}

interface DotScoreProps {
  value: number;
  label: string;
  type: 'risk' | 'sensitivity' | 'trust' | 'accuracy' | 'verifiability';
}

const DotScore = ({ value, label, type }: DotScoreProps) => {
  const dotCount = Math.ceil(value / 2);
  const maxDots = 5;
  
  const getScoreColor = () => {
    if (type === 'risk' || type === 'sensitivity') {
      return value <= 4 
        ? "bg-green-500" 
        : value <= 7 
          ? "bg-yellow-500" 
          : "bg-red-500";
    } else if (type === 'accuracy' || type === 'verifiability' || type === 'trust') {
      return value <= 3 
        ? "bg-red-500" 
        : value <= 6 
          ? "bg-yellow-500" 
          : "bg-green-500";
    } else {
      return value >= 5 
        ? "bg-green-500" 
        : value >= 3 
          ? "bg-yellow-500" 
          : "bg-red-500";
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <ScoreTooltip type={type} score={value}>
        <div className="flex space-x-0.5 cursor-help">
          {[...Array(maxDots)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i < dotCount ? getScoreColor() : "bg-gray-400"
              )}
            />
          ))}
        </div>
      </ScoreTooltip>
    </div>
  );
};

const IQubeCarousel = ({ 
  open, 
  onOpenChange, 
  currentMetaQube, 
  onQubeSelect, 
  activeQubes, 
  onToggleActive,
  getProfileImageUrl 
}: IQubeCarouselProps) => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [maxScroll, setMaxScroll] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Mock MetaQube data for each iQube (in a real app, this would come from props or context)
  const getMetaQubeData = (qubeId: string): MetaQube => {
    const baseData = {
      "iQube-Identifier": `${qubeId} iQube`,
      "iQube-Type": metaQubesData.find(q => q.id === qubeId)?.type || "DataQube",
      "Sensitivity-Score": 7.5,
      "Risk-Score": 3.2,
      "Accuracy-Score": 8.9,
      "Verifiability-Score": 8.1,
    };

    // Use current metaQube data if it matches the queried qube
    if (currentMetaQube["iQube-Identifier"] === `${qubeId} iQube`) {
      return currentMetaQube;
    }

    return baseData as MetaQube;
  };

  const currentIndex = metaQubesData.findIndex(q => 
    currentMetaQube["iQube-Identifier"] === `${q.id} iQube`
  );

  // Update max scroll when container or content changes
  React.useEffect(() => {
    if (scrollContainerRef.current && open) {
      // Wait for the dialog to be fully rendered
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          const containerWidth = container.clientWidth;
          const scrollWidth = container.scrollWidth;
          const newMaxScroll = Math.max(0, scrollWidth - containerWidth);
          setMaxScroll(newMaxScroll);
          console.log('Container width:', containerWidth, 'Scroll width:', scrollWidth, 'Max scroll:', newMaxScroll);
          console.log('Can scroll:', scrollWidth > containerWidth);
        }
      }, 100);
    }
  }, [open, metaQubesData]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Fixed scroll amount per click
      const newPosition = Math.max(0, scrollPosition - scrollAmount);
      console.log('Scrolling left:', { current: scrollPosition, new: newPosition });
      scrollContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Fixed scroll amount per click
      const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
      console.log('Scrolling right:', { current: scrollPosition, new: newPosition, max: maxScroll });
      scrollContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const getQubeIcon = (qubeId: string) => {
    const qubeData = metaQubesData.find(q => q.id === qubeId);
    if (qubeData?.type === 'ModelQube') {
      return <Brain className="h-5 w-5 text-green-500" />;
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    );
  };

  const isActive = (qubeId: string) => {
    return activeQubes[qubeId] || false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[600px]" style={{ overflow: 'visible' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Select Your iQube
          </DialogTitle>
        </DialogHeader>
        
        {/* Navigation buttons */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={scrollPosition <= 0}
            className="z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={scrollPosition >= maxScroll}
            className="z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable container */}
        <div 
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingLeft: '32px',
            paddingRight: '32px',
            paddingTop: '16px',
            paddingBottom: '16px',
            width: '100%',
            flexWrap: 'nowrap'
          }}
          onScroll={(e) => {
            const newScrollPosition = e.currentTarget.scrollLeft;
            setScrollPosition(newScrollPosition);
            console.log('Scroll position:', newScrollPosition, 'Max scroll:', maxScroll);
          }}
        >
            {metaQubesData.map((qube, index) => {
              const metaQube = getMetaQubeData(qube.id);
              const trustScore = Math.round(((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2) * 10) / 10;
              const isCurrentQube = currentMetaQube["iQube-Identifier"] === `${qube.id} iQube`;
              
              return (
                <div
                  key={qube.id}
                  style={{ 
                    minWidth: '320px', 
                    maxWidth: '320px',
                    flexShrink: 0,
                    flexGrow: 0
                  }}
                  className={cn(
                    "p-4 bg-muted/30 border rounded-lg cursor-pointer transition-all hover:scale-105",
                    isCurrentQube && "ring-2 ring-primary bg-primary/5",
                    qube.borderColor
                  )}
                  onClick={() => {
                    // Dispatch iqubeSelected event to match sidebar behavior
                    const event = new CustomEvent('iqubeSelected', { 
                      detail: { 
                        iqubeId: qube.id,
                        selectTab: true 
                      } 
                    });
                    window.dispatchEvent(event);
                    onQubeSelect(qube.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ScoreTooltip type={qube.type === 'ModelQube' ? 'modelQube' : 'dataQube'}>
                        <div className="cursor-help">
                          {getQubeIcon(qube.id)}
                        </div>
                      </ScoreTooltip>
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={
                            qube.id === "OpenAI" 
                              ? "/lovable-uploads/4734cb91-dd30-4b25-b290-90276884b871.png"
                              : qube.id === "Venice"
                              ? "/lovable-uploads/acdecfe9-4c63-4a5b-b350-5918662c0d67.png"
                              : getProfileImageUrl(qube.id) || undefined
                          } 
                          className="object-contain bg-white rounded-full p-0.5"
                        />
                        <AvatarFallback className="text-xs">
                          {qube.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-sm">{qube.name}</h3>
                        <p className="text-xs text-muted-foreground">{qube.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className={cn("flex items-center gap-1", qube.bgColor, qube.borderColor)}>
                      {qube.type === 'ModelQube' ? (
                        <Brain size={12} />
                      ) : (
                        <Database size={12} />
                      )}
                      <span className="text-xs">{qube.type}</span>
                    </Badge>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">
                        {isActive(qube.id) ? 'Active' : 'Inactive'}
                      </span>
                      <Switch 
                        checked={isActive(qube.id)} 
                        onCheckedChange={() => onToggleActive(qube.id)}
                        size="sm"
                        className="data-[state=checked]:bg-iqube-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2 overflow-x-auto">
                    <DotScore value={trustScore} label="Trust" type="trust" />
                    <DotScore value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
                    <DotScore value={metaQube["Risk-Score"]} label="Risk" type="risk" />
                    <DotScore value={metaQube["Accuracy-Score"]} label="Accuracy" type="accuracy" />
                    <DotScore value={metaQube["Verifiability-Score"]} label="Verifiability" type="verifiability" />
                  </div>
                </div>
              );
            })}
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default IQubeCarousel;