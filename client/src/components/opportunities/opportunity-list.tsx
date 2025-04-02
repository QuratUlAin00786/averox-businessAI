import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Opportunity, Account } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  RefreshCw, 
  DollarSign,
  BarChartHorizontal,
  Calendar,
  Building
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OpportunityListProps {
  data: Opportunity[];
  isLoading: boolean;
  onEdit: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
  onChangeStatus: (opportunity: Opportunity, status: { isClosed: boolean, isWon: boolean }) => void;
}

export function OpportunityList({
  data,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onChangeStatus,
}: OpportunityListProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  // Fetch accounts for lookup
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Function to get account name by ID
  const getAccountName = (accountId: number | null) => {
    if (!accountId) return "—";
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : "—";
  };

  // Filter opportunities based on search term and stage filter
  const filteredOpportunities = data.filter((opportunity) => {
    const matchesSearch = `${opportunity.name} ${getAccountName(opportunity.accountId)} ${opportunity.stage || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !stageFilter || opportunity.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Getting stage badge color
  const getStageColor = (stage: string | null) => {
    switch (stage) {
      case "Lead Generation":
        return "bg-blue-100 text-blue-800";
      case "Qualification":
        return "bg-indigo-100 text-indigo-800";
      case "Proposal":
        return "bg-yellow-100 text-yellow-800";
      case "Negotiation":
        return "bg-orange-100 text-orange-800";
      case "Closing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (opportunity: Opportunity) => {
    if (opportunity.isClosed) {
      return opportunity.isWon 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (opportunity: Opportunity) => {
    if (opportunity.isClosed) {
      return opportunity.isWon ? "Won" : "Lost";
    }
    return "Open";
  };

  // Get stage progress percentage
  const getStageProgress = (stage: string | null) => {
    const stages = ["Lead Generation", "Qualification", "Proposal", "Negotiation", "Closing"];
    const index = stage ? stages.indexOf(stage) : 0;
    return Math.max(0, ((index + 1) / stages.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-neutral-500">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  // Unique stages for filter
  const stages = Array.from(new Set(data.map(opp => opp.stage).filter(Boolean) as string[]));

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search opportunities..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button 
            variant={stageFilter === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setStageFilter(null)}
          >
            All
          </Button>
          {stages.map(stage => (
            <Button
              key={stage}
              variant={stageFilter === stage ? "default" : "outline"}
              size="sm"
              onClick={() => setStageFilter(stage)}
              className={stageFilter === stage ? "" : "border-neutral-200"}
            >
              {stage}
            </Button>
          ))}
        </div>
      </div>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {filteredOpportunities.length === 0 ? (
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-neutral-500">No opportunities found</p>
            </div>
          ) : (
            filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{opportunity.name}</CardTitle>
                      <CardDescription className="text-xs flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {getAccountName(opportunity.accountId)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(opportunity)}>
                      {getStatusText(opportunity)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-neutral-600 mb-3">
                    <div>
                      <p className="text-xs text-neutral-500">Amount</p>
                      <p className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {opportunity.amount ? formatCurrency(parseFloat(opportunity.amount)) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Stage</p>
                      <Badge className={getStageColor(opportunity.stage)}>
                        {opportunity.stage || "—"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Expected Close</p>
                      <p className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {opportunity.expectedCloseDate 
                          ? new Date(opportunity.expectedCloseDate).toLocaleDateString() 
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Progress</p>
                      <div className="flex items-center gap-2">
                        <BarChartHorizontal className="h-3 w-3" />
                        <Progress value={getStageProgress(opportunity.stage)} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-2 bg-neutral-50 gap-2">
                  <div className="flex gap-1">
                    {!opportunity.isClosed && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => onChangeStatus(opportunity, { isClosed: true, isWon: true })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          onClick={() => onChangeStatus(opportunity, { isClosed: true, isWon: false })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onView(opportunity)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEdit(opportunity)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No opportunities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell className="font-medium">
                      {opportunity.name}
                    </TableCell>
                    <TableCell>{getAccountName(opportunity.accountId)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStageColor(opportunity.stage)}>
                          {opportunity.stage || "—"}
                        </Badge>
                        <Progress 
                          value={getStageProgress(opportunity.stage)} 
                          className="h-1.5 w-24" 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {opportunity.amount 
                        ? formatCurrency(parseFloat(opportunity.amount)) 
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {opportunity.expectedCloseDate 
                        ? new Date(opportunity.expectedCloseDate).toLocaleDateString() 
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(opportunity)}>
                        {getStatusText(opportunity)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onView(opportunity)}>
                            <Eye className="h-4 w-4 mr-2" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          
                          {!opportunity.isClosed && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onChangeStatus(opportunity, { isClosed: true, isWon: true })}
                                className="text-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" /> Mark as Won
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onChangeStatus(opportunity, { isClosed: true, isWon: false })}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" /> Mark as Lost
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(opportunity)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}