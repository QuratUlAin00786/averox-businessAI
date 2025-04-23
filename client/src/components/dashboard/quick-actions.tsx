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
      name: "Manage Leads",
      icon: <UserPlus className="h-4 w-4" />,
      onClick: () => setLocation("/leads"),
      description: "View and create potential customers"
    },
    {
      name: "Opportunities",
      icon: <BarChart3 className="h-4 w-4" />,
      onClick: () => setLocation("/opportunities"),
      description: "Manage sales opportunities"
    },
    {
      name: "View Reports",
      icon: <PieChart className="h-4 w-4" />,
      onClick: () => setLocation("/reports"),
      description: "Access sales and lead reports"
    },
    {
      name: "Accounts",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setLocation("/accounts"),
      description: "Manage customer accounts"
    },
    {
      name: "Settings",
      icon: <CloudUpload className="h-4 w-4" />,
      onClick: () => setLocation("/settings"),
      description: "Configure system settings"
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