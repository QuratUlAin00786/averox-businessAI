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
        <div className="p-5">
          <div className="flex items-center">
            {/* Icon container */}
            <div className="flex-shrink-0">
              <div className={cn("flex items-center justify-center w-12 h-12 rounded-md", bgColorClass)}>
                <UserPlusIcon className={cn("w-6 h-6", textColorClass)} />
              </div>
            </div>
            
            {/* Content container */}
            <div className="flex-1 ml-5">
              <dl>
                <dt className="text-sm font-medium text-neutral-500">New Leads</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-700">{value}</div>
                  <div className="flex items-baseline mt-1">
                    <div className={cn("text-sm font-semibold", trendClasses[change.trend])}>
                      {change.value}
                    </div>
                    <div className="ml-1 text-xs text-neutral-500">{change.text}</div>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </SimpleButton>
    </div>
  );
}