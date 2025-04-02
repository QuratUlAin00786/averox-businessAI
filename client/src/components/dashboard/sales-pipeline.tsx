import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface PipelineStage {
  name: string;
  value: string;
  percentage: number;
  color: string;
}

export function SalesPipeline() {
  const pipelineStages: PipelineStage[] = [
    { 
      name: "Lead Generation", 
      value: "$112,000", 
      percentage: 45, 
      color: "bg-primary" 
    },
    { 
      name: "Qualification", 
      value: "$86,000", 
      percentage: 35, 
      color: "bg-primary-dark" 
    },
    { 
      name: "Proposal", 
      value: "$65,000", 
      percentage: 28, 
      color: "bg-secondary" 
    },
    { 
      name: "Negotiation", 
      value: "$42,000", 
      percentage: 18, 
      color: "bg-secondary-dark" 
    },
    { 
      name: "Closing", 
      value: "$24,500", 
      percentage: 12, 
      color: "bg-success" 
    }
  ];

  const totalPipeline = "$329,500";

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-neutral-700">Sales Pipeline</h3>
          <div className="flex items-center">
            <span className="text-sm text-neutral-500">Last 30 days</span>
            <Button variant="ghost" size="icon" className="ml-2 text-neutral-400 hover:text-neutral-500">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          {pipelineStages.map((stage, index) => (
            <div key={index} className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className={`text-xs font-semibold inline-block ${stage.color.replace('bg-', 'text-')}`}>
                    {stage.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold inline-block ${stage.color.replace('bg-', 'text-')}`}>
                    {stage.value}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-neutral-100">
                <div 
                  style={{ width: `${stage.percentage}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${stage.color}`}>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-center text-neutral-500">
          <span className="font-medium text-primary">{totalPipeline}</span> total pipeline value
        </div>
      </div>
    </div>
  );
}
