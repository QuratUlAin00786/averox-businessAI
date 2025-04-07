import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/ui/portal';

export interface TourStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  spotlightPadding?: number; // Extra padding around target element
  disableOverlay?: boolean; // Whether to disable the overlay for this step
  disableScrolling?: boolean; // Whether to disable scrolling for this step
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  showCloseButton?: boolean;
  showSkipButton?: boolean;
  showProgress?: boolean;
  showDots?: boolean;
  className?: string;
  tourId: string; // Unique ID for the tour to save progress
}

export function GuidedTour({
  steps,
  isOpen,
  onClose,
  onComplete,
  showCloseButton = true,
  showSkipButton = true,
  showProgress = true,
  showDots = true,
  className = '',
  tourId
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { t, isRTL } = useLanguage();

  // Load saved position if any
  useEffect(() => {
    if (isOpen) {
      const savedStep = localStorage.getItem(`tour_${tourId}`);
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    }
  }, [isOpen, tourId]);

  // Save progress
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(`tour_${tourId}`, currentStep.toString());
    }
  }, [currentStep, isOpen, tourId]);

  // Position tooltip based on target element
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (!targetElement) {
      console.error(`Target element not found: ${step.target}`);
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const placement = step.placement || 'bottom';
    
    // Scroll to element if necessary
    if (!step.disableScrolling) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    // Calculate tooltip position based on placement
    let top = 0;
    let left = 0;

    setTimeout(() => {
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      if (!tooltipRect) return;

      switch (placement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - 10;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + 10;
          break;
      }

      // Adjust for RTL if needed
      if (isRTL && (placement === 'left' || placement === 'right')) {
        left = placement === 'left' ? targetRect.right + 10 : targetRect.left - tooltipRect.width - 10;
      }

      // Make sure tooltip is within viewport
      if (top < 0) top = 10;
      if (left < 0) left = 10;
      if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 10;
      }
      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
      }

      setTooltipPosition({ top, left });
    }, 100);
  }, [currentStep, isOpen, isRTL, steps]);

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle skip
  const handleSkip = () => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
    onClose();
  };

  // Handle complete
  const handleComplete = () => {
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
    onComplete();
    onClose();
  };

  // Handle specific step
  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <Portal>
      {/* Overlay */}
      {!currentStepData.disableOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={showCloseButton ? handleSkip : undefined}
        />
      )}

      {/* Spotlight for the target element */}
      {!currentStepData.disableOverlay && (
        <div
          className="absolute z-[51] pointer-events-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[60] w-80 rounded-lg bg-background shadow-lg border border-border ${className}`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium text-base">{currentStepData.title}</h3>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleSkip}
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p>{currentStepData.content}</p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {showProgress && (
                <span className="text-xs text-muted-foreground">
                  {currentStep + 1} {t.tooltips.of} {steps.length}
                </span>
              )}
              {showSkipButton && currentStep < steps.length - 1 && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs"
                  onClick={handleSkip}
                >
                  {t.tooltips.skip || 'Skip'}
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="flex items-center"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  {t.tooltips.previous || 'Previous'}
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                className="flex items-center"
              >
                {currentStep < steps.length - 1
                  ? (t.tooltips.next || 'Next')
                  : (t.tooltips.finish || 'Finish')}
                {currentStep < steps.length - 1 && (
                  <ChevronRight size={16} className="ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Dots */}
          {showDots && steps.length > 1 && (
            <div className="flex justify-center mt-3 space-x-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30'
                  }`}
                  onClick={() => goToStep(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

// This hook manages the tour state
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
  
  // Reset the tour (clear saved progress)
  const resetTour = () => {
    localStorage.removeItem(`tour_${tourId}`);
    localStorage.removeItem(`tour_${tourId}_completed`);
  };
  
  return {
    isTourOpen,
    startTour,
    closeTour,
    resetTour,
    hasCompletedTour
  };
}

// Floating help button to start tour
export function TourHelpButton({ onClick, className = '', size = 40 }: { 
  onClick: () => void;
  className?: string;
  size?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 z-50 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all ${className}`}
      style={{ width: size, height: size }}
    >
      <HelpCircle size={size * 0.6} />
    </button>
  );
}

