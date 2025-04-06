
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MetaQube } from '@/lib/types';
import { Lock, Unlock, ShieldCheck, Database, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetaQubeDisplayProps {
  metaQube: MetaQube;
  compact?: boolean;
  className?: string;
}

interface ScoreBadgeProps {
  value: number;
  label: string;
}

const ScoreBadge = ({ value, label }: ScoreBadgeProps) => {
  const scoreClass = value <= 3 ? 'score-low' : value <= 6 ? 'score-medium' : 'score-high';
  
  return (
    <div className="flex flex-col items-center">
      <div className={cn('score-badge', scoreClass)}>
        {value}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

const MetaQubeDisplay = ({ metaQube, compact = false, className }: MetaQubeDisplayProps) => {
  if (compact) {
    return (
      <Card className={cn("iqube-card", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Database className="h-4 w-4 mr-2 text-iqube-accent" />
            metaQube Info
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-xs text-muted-foreground">
            <p><strong>ID:</strong> {metaQube["iQube-Identifier"]}</p>
            <p><strong>Type:</strong> {metaQube["iQube-Type"]}</p>
            <div className="flex justify-between mt-2">
              <ScoreBadge value={metaQube["Risk-Score"]} label="Risk" />
              <ScoreBadge value={metaQube["Verifiability-Score"]} label="Verify" />
              <ScoreBadge value={metaQube["Accuracy-Score"]} label="Accuracy" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("iqube-card", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-iqube-accent" />
          metaQube: {metaQube["iQube-Identifier"]}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-iqube-primary/10 text-iqube-primary border-iqube-primary/30">
            {metaQube["iQube-Type"]}
          </Badge>
          <Badge variant="outline" className="bg-iqube-accent/10 text-iqube-accent border-iqube-accent/30">
            {metaQube["Owner-Identifiability"]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4 pb-4 border-b">
          <ScoreBadge value={metaQube["Risk-Score"]} label="Risk Score" />
          <ScoreBadge value={metaQube["Verifiability-Score"]} label="Verifiability" />
          <ScoreBadge value={metaQube["Accuracy-Score"]} label="Accuracy" />
          <ScoreBadge value={metaQube["Sensitivity-Score"]} label="Sensitivity" />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger>MetaQube Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-muted-foreground">iQube Designer</div>
                  <div>{metaQube["iQube-Designer"]}</div>
                  
                  <div className="text-muted-foreground">Owner Type</div>
                  <div>{metaQube["Owner-Type"]}</div>
                  
                  <div className="text-muted-foreground">Date Minted</div>
                  <div>{metaQube["Date-Minted"]}</div>
                  
                  <div className="text-muted-foreground">Edition</div>
                  <div>{metaQube["X-of-Y"]}</div>
                  
                  <div className="text-muted-foreground">Related iQubes</div>
                  <div>
                    {metaQube["Related-iQubes"].map((qube, i) => (
                      <Badge key={i} variant="outline" className="mr-1 mt-1">
                        {qube}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="usage">
            <AccordionTrigger>Usage Information</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm">{metaQube["iQube-Use"]}</p>
              <div className="flex mt-4 space-x-2">
                <div className="flex items-center border rounded-md px-2 py-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  <span>Protected</span>
                </div>
                <div className="flex items-center border rounded-md px-2 py-1 text-xs">
                  <Code className="h-3.5 w-3.5 mr-1" />
                  <span>DataQube</span>
                </div>
                {metaQube["Risk-Score"] <= 5 ? (
                  <div className="flex items-center border rounded-md px-2 py-1 text-xs text-green-500 border-green-500/30">
                    <Unlock className="h-3.5 w-3.5 mr-1" />
                    <span>Low Risk</span>
                  </div>
                ) : (
                  <div className="flex items-center border rounded-md px-2 py-1 text-xs text-yellow-500 border-yellow-500/30">
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    <span>Medium Risk</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MetaQubeDisplay;
