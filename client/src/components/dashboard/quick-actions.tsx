import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Plus,
  UserPlus,
  FileText,
  PieChart,
  CloudUpload,
  BarChart3,
} from "lucide-react";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      name: "Add Lead",
      icon: <UserPlus className="h-4 w-4" />,
      onClick: () => setLocation("/leads/new"),
      description: "Create a new potential customer"
    },
    {
      name: "New Opportunity",
      icon: <BarChart3 className="h-4 w-4" />,
      onClick: () => setLocation("/opportunities/new"),
      description: "Create a new sales opportunity"
    },
    {
      name: "Create Proposal",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setLocation("/proposals/new"),
      description: "Draft a new client proposal"
    },
    {
      name: "Run Report",
      icon: <PieChart className="h-4 w-4" />,
      onClick: () => setLocation("/reports"),
      description: "Generate business insights"
    },
    {
      name: "Data Migration",
      icon: <CloudUpload className="h-4 w-4" />,
      onClick: () => setLocation("/settings/data-migration"),
      description: "Import data from other CRMs"
    }
  ];

  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start text-left h-auto py-2.5"
          onClick={action.onClick}
        >
          <div className="rounded-full bg-primary/10 p-1.5 mr-3">
            {action.icon}
          </div>
          <div>
            <div className="font-medium">{action.name}</div>
            <div className="text-xs text-muted-foreground">{action.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}