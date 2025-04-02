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
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={cn("flex items-center justify-center w-12 h-12 rounded-md", colorClasses[iconColor].bg)}>
                <Icon className={cn("w-6 h-6", colorClasses[iconColor].text)} />
              </div>
            </div>
            <div className="flex-1 w-0 ml-5">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-700">{value}</div>
                  <div className="flex items-baseline">
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
