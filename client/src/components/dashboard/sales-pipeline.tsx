import { Button } from "@/components/ui/button";
import { SimpleButton } from "@/components/ui/simple-button";
import { Settings } from "lucide-react";
import { useMemo } from "react";
import { PipelineStage } from "@/lib/data";

interface SalesPipelineProps {
  stages: PipelineStage[];
}

export function SalesPipeline({ stages }: SalesPipelineProps) {
  // Get color based on stage name
  const getStageColor = (stageName: string): string => {
    const stageColors: Record<string, string> = {
      "Lead Generation": "bg-primary",
      "Qualification": "bg-primary-dark",
      "Proposal": "bg-secondary",
      "Negotiation": "bg-secondary-dark",
      "Closing": "bg-success"
    };
    
    return stageColors[stageName] || "bg-primary";
  };

  // Format the stages with appropriate colors
  const formattedStages = useMemo(() => {
    return stages.map(stage => ({
      ...stage,
      color: stage.color ? `bg-[${stage.color}]` : getStageColor(stage.name)
    }));
  }, [stages]);

  // Calculate total pipeline value
  const totalPipeline = useMemo(() => {
    if (stages.length === 0) return "$0";
    
    // Extract numeric values from the formatted currency strings
    const total = stages.reduce((sum, stage) => {
      const value = stage.value.replace(/[^0-9.]/g, '');
      return sum + parseFloat(value || "0");
    }, 0);
    
    // Format total as currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(total);
  }, [stages]);

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <h3 className="text-xl sm:text-lg font-medium leading-6 text-neutral-700 mb-2 sm:mb-0">Sales Pipeline</h3>
          <div className="flex items-center">
            <span className="text-base sm:text-sm text-neutral-500">Last 30 days</span>
            <SimpleButton 
              variant="outline" 
              className="ml-2 border-primary text-primary hover:bg-primary hover:text-white p-2 sm:p-2"
              onClick={() => window.alert("Opening pipeline settings...")}
            >
              <Settings className="w-7 h-7 sm:w-5 sm:h-5" />
            </SimpleButton>
          </div>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="mt-1">
          {formattedStages.length > 0 ? (
            formattedStages.map((stage, index) => (
              <div 
                key={index} 
                className="relative pt-1"
              >
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-base sm:text-xs font-semibold inline-block text-neutral-700">
                      {stage.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-xs font-semibold inline-block text-neutral-700">
                      {stage.value}
                    </span>
                  </div>
                </div>
                <SimpleButton
                  variant="ghost"
                  className="w-full p-0 block h-auto hover:bg-neutral-50 focus:ring-0"
                  onClick={() => window.alert(`Viewing details for ${stage.name} stage: ${stage.value}`)}
                >
                  <div className="overflow-hidden h-4 sm:h-2 mb-4 text-xs flex rounded bg-neutral-100">
                    <div 
                      style={{ 
                        width: `${stage.percentage}%`,
                        backgroundColor: stage.color.startsWith('bg-[') ? 
                          stage.color.substring(4, stage.color.length - 1) : 
                          undefined 
                      }} 
                      className={
                        !stage.color.startsWith('bg-[') ? `shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${stage.color}` : 
                        "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                      }>
                    </div>
                  </div>
                </SimpleButton>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-neutral-500">
              No pipeline data available
            </div>
          )}
        </div>
        
        <SimpleButton
          variant="ghost"
          className="mt-4 text-base sm:text-sm text-center text-neutral-500 w-full p-3 sm:p-2 h-auto hover:bg-neutral-50"
          onClick={() => window.alert("Opening detailed pipeline analysis...")}
        >
          <span className="font-medium text-primary text-xl sm:text-base">{totalPipeline}</span> <span className="text-lg sm:text-sm">total pipeline value</span>
        </SimpleButton>
      </div>
    </div>
  );
}
