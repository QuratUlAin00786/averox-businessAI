import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { CloudOff, CheckCircle, Clock } from "lucide-react";

interface Migration {
  id: number;
  source: string;
  status: "success" | "failed" | "in_progress";
  recordsProcessed: number;
  totalRecords: number;
  startedAt: string;
  completedAt?: string;
  errorCount?: number;
  duration?: string;
}

interface MigrationStatsProps {
  migrations: Migration[];
}

export default function MigrationStats({ migrations }: MigrationStatsProps) {
  if (!migrations || migrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 p-4">
        <div className="text-muted-foreground mb-2">
          <CloudOff className="h-12 w-12" />
        </div>
        <p className="text-center text-muted-foreground">No migration history found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {migrations.map((migration) => {
        const progressPercentage = migration.totalRecords > 0
          ? Math.round((migration.recordsProcessed / migration.totalRecords) * 100)
          : 0;
          
        return (
          <div key={migration.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">{migration.source} Migration</h3>
                {getStatusBadge(migration.status)}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(migration.startedAt), { addSuffix: true })}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress: {migration.recordsProcessed} / {migration.totalRecords} records</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {migration.errorCount !== undefined && (
                <div className="flex items-center gap-1">
                  <CloudOff className="h-3.5 w-3.5" />
                  <span>{migration.errorCount} errors</span>
                </div>
              )}
              
              {migration.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Duration: {migration.duration}</span>
                </div>
              )}
              
              {migration.status === "success" && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Completed successfully</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}