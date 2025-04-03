import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SimpleButton } from "@/components/ui/simple-button";

interface StatCardProps {
  title: string;
  value: string | number;
  change: {
    value: string;
    percentage?: number;
    trend: "up" | "down" | "neutral";
    text: string;
  };
  icon: LucideIcon;
  iconColor: "primary" | "secondary" | "accent" | "info";
}

export function StatCard({ title, value, change, icon: Icon, iconColor }: StatCardProps) {
  const colorClasses = {
    primary: {
      bg: "bg-primary-light bg-opacity-20",
      text: "text-primary"
    },
    secondary: {
      bg: "bg-secondary-light bg-opacity-20",
      text: "text-secondary"
    },
    accent: {
      bg: "bg-accent bg-opacity-20",
      text: "text-accent"
    },
    info: {
      bg: "bg-info bg-opacity-20",
      text: "text-info"
    }
  };

  const trendClasses = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-neutral-500"
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <SimpleButton 
        className="w-full text-left p-0 h-auto hover:bg-neutral-50"
        onClick={() => window.alert(`Viewing detailed analytics for ${title}...`)}
        variant="ghost"
      >
        <div className="p-8 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-3 sm:mb-0">
              <div className={cn("flex items-center justify-center w-24 h-24 sm:w-14 sm:h-14 rounded-md mx-auto sm:mx-0", colorClasses[iconColor].bg)}>
                <Icon className={cn("w-12 h-12 sm:w-7 sm:h-7", colorClasses[iconColor].text)} />
              </div>
            </div>
            <div className="flex-1 w-full sm:w-0 sm:ml-5 text-center sm:text-left mt-2 sm:mt-0">
              <dl>
                <dt className="text-xl sm:text-sm font-medium text-neutral-500 truncate">{title}</dt>
                <dd className="mt-2 sm:mt-0">
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
