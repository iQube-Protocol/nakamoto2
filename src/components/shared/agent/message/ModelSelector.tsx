import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Cpu, Brain } from 'lucide-react';
import { useVeniceAgent } from '@/hooks/use-venice-agent';
import { useOpenAIAgent } from '@/hooks/use-openai-agent';

interface ModelSelectorProps {
  currentModel?: string;
  iqubeType?: 'DataQube' | 'AgentQube';
  onModelChange?: (model: string, provider: 'openai' | 'venice') => void;
  className?: string;
}

interface ModelOption {
  id: string;
  name: string;
  provider: 'openai' | 'venice';
  description: string;
  category?: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  // OpenAI Models
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient for most tasks',
    category: 'General'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai', 
    description: 'More powerful for complex reasoning',
    category: 'Advanced'
  },
  
  // Venice AI Models
  {
    id: 'venice-uncensored',
    name: 'Venice Uncensored',
    provider: 'venice',
    description: 'Creative and unrestricted responses',
    category: 'Creative'
  },
  {
    id: 'venice-reasoning',
    name: 'Venice Reasoning',
    provider: 'venice',
    description: 'Enhanced analytical and research capabilities',
    category: 'Analysis'
  },
  {
    id: 'venice-large',
    name: 'Venice Large',
    provider: 'venice',
    description: 'Complex technical and detailed tasks',
    category: 'Technical'
  }
];

const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel = 'gpt-4o-mini',
  iqubeType = 'DataQube',
  onModelChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { veniceActivated, activateVenice, deactivateVenice } = useVeniceAgent();
  const { openAIActivated, activateOpenAI, deactivateOpenAI } = useOpenAIAgent();

  const currentModelInfo = AVAILABLE_MODELS.find(m => m.id === currentModel);
  const currentProvider = currentModelInfo?.provider || 
    (veniceActivated ? 'venice' : openAIActivated ? 'openai' : 'openai');

  const handleModelSelect = async (model: ModelOption) => {
    try {
      // Handle mutual exclusion between providers
      if (model.provider === 'venice' && !veniceActivated) {
        activateVenice();
        // Deactivate OpenAI if active
        if (openAIActivated) {
          deactivateOpenAI();
        }
      } else if (model.provider === 'openai' && !openAIActivated) {
        activateOpenAI();
        // Deactivate Venice if active
        if (veniceActivated) {
          deactivateVenice();
        }
      }
      
      // Call the callback with selected model
      onModelChange?.(model.id, model.provider);
      setIsOpen(false);
    } catch (error) {
      console.error('Error switching model:', error);
    }
  };

  const getProviderModels = (provider: 'openai' | 'venice') => {
    return AVAILABLE_MODELS.filter(m => m.provider === provider);
  };

  const getProviderLabel = (provider: 'openai' | 'venice') => {
    return provider === 'venice' ? 'Venice AI (Uncensored)' : 'OpenAI';
  };

  const getModelDisplayName = (model: string) => {
    const modelInfo = AVAILABLE_MODELS.find(m => m.id === model);
    return modelInfo?.name || model;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <Badge 
            variant="secondary" 
            className={`text-[10px] py-0 h-4 flex items-center cursor-pointer hover:bg-secondary/80 transition-colors ${className}`}
          >
            {iqubeType === 'AgentQube' ? (
              <Brain className="h-3 w-3 mr-1" />
            ) : (
              <Cpu className="h-3 w-3 mr-1" />
            )}
            <span>{getModelDisplayName(currentModel)}</span>
            <ChevronDown className="h-2 w-2 ml-1" />
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 bg-popover border border-border shadow-lg z-[9999]"
        sideOffset={4}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-xs font-medium">
          Select AI Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* OpenAI Models */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {getProviderLabel('openai')}
        </DropdownMenuLabel>
        {getProviderModels('openai').map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={(e) => {
              e.preventDefault();
              handleModelSelect(model);
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleModelSelect(model);
            }}
            className={`text-xs cursor-pointer focus:bg-accent hover:bg-accent ${
              currentModel === model.id && currentProvider === 'openai' 
                ? 'bg-accent text-accent-foreground' 
                : ''
            }`}
          >
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between">
                <span className="font-medium">{model.name}</span>
                {model.category && (
                  <Badge variant="outline" className="text-[8px] h-3 px-1">
                    {model.category}
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-[10px]">
                {model.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Venice AI Models */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {getProviderLabel('venice')}
        </DropdownMenuLabel>
        {getProviderModels('venice').map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={(e) => {
              e.preventDefault();
              handleModelSelect(model);
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleModelSelect(model);
            }}
            className={`text-xs cursor-pointer focus:bg-accent hover:bg-accent ${
              currentModel === model.id && currentProvider === 'venice' 
                ? 'bg-accent text-accent-foreground' 
                : ''
            }`}
          >
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between">
                <span className="font-medium">{model.name}</span>
                {model.category && (
                  <Badge variant="outline" className="text-[8px] h-3 px-1">
                    {model.category}
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-[10px]">
                {model.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-[10px] text-muted-foreground">
          Current: {getProviderLabel(currentProvider)}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;