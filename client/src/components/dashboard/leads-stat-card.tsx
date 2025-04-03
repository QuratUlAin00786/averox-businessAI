import { LucideIcon, UserPlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SimpleButton } from "@/components/ui/simple-button";

interface LeadsStatCardProps {
  value: string | number;
  change: {
    value: string;
    percentage?: number;
    trend: "up" | "down" | "neutral";
    text: string;
  };
}

export function LeadsStatCard({ value, change }: LeadsStatCardProps) {
  // Color classes specific for New Leads card
  const bgColorClass = "bg-primary-light bg-opacity-20";
  const textColorClass = "text-primary";
  
  // Classes for trend indicators
  const trendClasses = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-neutral-500"
  };
  
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <SimpleButton 
        className="w-full text-left p-0 h-auto hover:bg-neutral-50"
        onClick={() => window.alert("Viewing detailed analytics for New Leads...")}
        variant="ghost"
      >
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Extra large icon specifically for New Leads */}
            <div className={cn("flex items-center justify-center w-24 h-24 rounded-md", bgColorClass)}>
              <UserPlusIcon className={cn("w-14 h-14", textColorClass)} />
            </div>
            
            {/* Bold, centered title */}
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-neutral-600">New Leads</h3>
              
              {/* Larger value */}
              <p className="mt-2 text-4xl font-bold text-neutral-800">{value}</p>
              
              {/* Trend info */}
              <div className="flex items-center justify-center mt-3">
                <span className={cn("text-xl font-semibold", trendClasses[change.trend])}>
                  {change.value}
                </span>
                <span className="ml-1 text-lg text-neutral-500">{change.text}</span>
              </div>
            </div>
          </div>
        </div>
      </SimpleButton>
    </div>
  );
}