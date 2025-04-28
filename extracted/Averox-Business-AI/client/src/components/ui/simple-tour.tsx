import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/use-language';

export interface TourStep {
  title: string;
  content: string;
}

interface SimpleTourProps {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function SimpleTour({
  steps,
  open,
  onOpenChange,
  onComplete
}: SimpleTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  // Reset step when tour opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{steps[currentStep]?.title}</DialogTitle>
          <DialogDescription className="pt-4">
            {steps[currentStep]?.content}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 order-2 sm:order-1">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} {t.tooltips.of} {steps.length}
            </span>
            {steps.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="flex items-center text-xs text-muted-foreground"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                {t.tooltips.skip}
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2 order-1 sm:order-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t.tooltips.previous}
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              className="flex items-center"
            >
              {currentStep < steps.length - 1
                ? t.tooltips.next
                : t.tooltips.finish}
              {currentStep < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Custom hook to manage tour state
export function useTour(tourId: string) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Check if tour has been completed
  const hasCompletedTour = () => {
    return localStorage.getItem(`tour_${tourId}_completed`) === 'true';
  };
  
  // Start the tour
  const startTour = () => {
    setIsTourOpen(true);
  };
  
  // Close the tour
  const closeTour = () => {
    setIsTourOpen(false);
  };
  
  // Complete the tour
  const completeTour = () => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
    setIsTourOpen(false);
  };
  
  return {
    isTourOpen,
    setIsTourOpen,
    startTour,
    closeTour,
    completeTour,
    hasCompletedTour
  };
}

// Tour Help Button
export function TourHelpButton({ onClick, className = '' }: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className={`rounded-full w-12 h-12 p-0 ${className}`}
      variant="default"
    >
      <HelpCircle className="h-6 w-6" />
    </Button>
  );
}