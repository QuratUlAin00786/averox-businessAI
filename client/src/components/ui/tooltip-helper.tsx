import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface TooltipHelperProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconSize?: number;
}

export function TooltipHelper({ 
  content, 
  side = "right", 
  className = "", 
  iconSize = 16 
}: TooltipHelperProps) {
  const { isRTL } = useLanguage();
  
  // For RTL layouts, we flip the side (right becomes left and vice versa)
  const adjustedSide = isRTL
    ? side === "right" 
      ? "left" 
      : side === "left" 
        ? "right" 
        : side
    : side;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center cursor-help ${className}`}>
            <HelpCircle size={iconSize} className="text-muted-foreground/70 hover:text-primary transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={adjustedSide} 
          className="max-w-xs bg-background border border-border shadow-md text-sm p-3 rounded-md z-50"
          align="start"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Advanced version with steps
interface TooltipStepHelperProps {
  steps: { title: string; content: string }[];
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  iconSize?: number;
}

export function TooltipStepHelper({ 
  steps, 
  side = "right", 
  className = "", 
  iconSize = 16 
}: TooltipStepHelperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { isRTL, t } = useLanguage();
  
  // For RTL layouts, we flip the side (right becomes left and vice versa)
  const adjustedSide = isRTL
    ? side === "right" 
      ? "left" 
      : side === "left" 
        ? "right" 
        : side
    : side;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(steps.length - 1);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center cursor-help ${className}`}>
            <HelpCircle size={iconSize} className="text-muted-foreground/70 hover:text-primary transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={adjustedSide} 
          className="max-w-sm bg-background border border-border shadow-md text-sm p-4 rounded-md z-50"
          align="start"
        >
          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-base">{steps[currentStep].title}</h4>
            <p>{steps[currentStep].content}</p>
            
            {steps.length > 1 && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <button 
                  onClick={prevStep}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  ← {isRTL ? t.tooltips.previous : 'Previous'}
                </button>
                <span className="text-xs text-muted-foreground">
                  {t.tooltips.step} {currentStep + 1} {t.tooltips.of} {steps.length}
                </span>
                <button 
                  onClick={nextStep}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  {isRTL ? t.tooltips.next : 'Next'} →
                </button>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}