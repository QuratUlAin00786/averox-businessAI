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
          {/* Responsive layout that works well on all devices */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            {/* Icon container */}
            <div className="flex-shrink-0 mb-3 sm:mb-0">
              <div className={cn("flex items-center justify-center w-16 h-16 sm:w-14 sm:h-14 rounded-md mx-auto sm:mx-0", bgColorClass)}>
                <UserPlusIcon className={cn("w-10 h-10 sm:w-8 sm:h-8", textColorClass)} />
              </div>
            </div>
            
            {/* Content container */}
            <div className="flex-1 w-full sm:w-0 sm:ml-5 text-center sm:text-left">
              <dl>
                <dt className="text-xl sm:text-sm font-medium text-neutral-500">New Leads</dt>
                <dd className="mt-1">
                  <div className="text-3xl sm:text-lg font-semibold text-neutral-700">{value}</div>
                  <div className="flex flex-wrap items-baseline justify-center sm:justify-start mt-2">
                    <div className={cn("text-xl sm:text-sm font-semibold", trendClasses[change.trend])}>
                      {change.value}
                    </div>
                    <div className="ml-1 text-lg sm:text-xs text-neutral-500">{change.text}</div>
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