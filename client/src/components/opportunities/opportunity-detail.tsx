import { useState, useEffect } from "react";
import { Opportunity, User, Account } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pencil, 
  Check, 
  X, 
  DollarSign, 
  Building, 
  Calendar, 
  RefreshCw, 
  Users, 
  BarChart4,
  FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { CommunicationPanel } from "@/components/communications/communication-panel";
import AssignmentManager from "@/components/assignment/assignment-manager";

interface OpportunityDetailProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onEdit: (opportunity: Opportunity) => void;
  onChangeStatus: (opportunity: Opportunity, status: { isClosed: boolean, isWon: boolean }) => void;
  onOpenProposals?: (opportunity: Opportunity) => void;
}

export function OpportunityDetail({
  isOpen,
  opportunity,
  onClose,
  onEdit,
  onChangeStatus,
  onOpenProposals,
}: OpportunityDetailProps) {
  // Fetch owner data if available
  const { data: owner, isLoading: isLoadingOwner } = useQuery<User>({
    queryKey: ["/api/users", opportunity?.ownerId ? opportunity.ownerId.toString() : undefined],
    enabled: isOpen && !!opportunity?.ownerId,
  });

  // Fetch account data if available
  const { data: account, isLoading: isLoadingAccount } = useQuery<Account>({
    queryKey: ["/api/accounts", opportunity?.accountId ? opportunity.accountId.toString() : undefined],
    enabled: isOpen && !!opportunity?.accountId,
  });

  // Add debug logging via useEffect
  useEffect(() => {
    if (account && opportunity) {
      console.log('%c Opportunity Detail - Account Data:', 'background: #6366f1; color: white; padding: 2px 5px; border-radius: 3px;', account);
      console.log('%c Opportunity Detail - Account Phone:', 'background: #6366f1; color: white; padding: 2px 5px; border-radius: 3px;', {
        phone: account.phone,
        phoneType: typeof account.phone,
        hasPhone: !!account.phone,
        phoneToString: String(account.phone || "")
      });
    }
  }, [account, opportunity]);

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

  const getStatusColor = (opp: Opportunity | null) => {
    if (!opp) return "bg-gray-100 text-gray-800";
    if (opp.isClosed) {
      return opp.isWon 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (opp: Opportunity | null) => {
    if (!opp) return "Unknown";
    if (opp.isClosed) {
      return opp.isWon ? "Won" : "Lost";
    }
    return "Open";
  };

  // Get stage progress percentage
  const getStageProgress = (stage: string | null) => {
    const stages = ["Lead Generation", "Qualification", "Proposal", "Negotiation", "Closing"];
    const index = stage ? stages.indexOf(stage) : 0;
    return Math.max(0, ((index + 1) / stages.length) * 100);
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "PPP");
    } catch (e) {
      return "Invalid date";
    }
  };

  if (!opportunity) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
        <div className="sticky top-0 z-10 bg-white pt-6 px-6 pb-4 border-b">
          <DialogHeader className="mb-0">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl mb-1">
                  {opportunity.name}
                </DialogTitle>
                <div className="flex gap-2 items-center text-sm text-neutral-500">
                  {account ? (
                    <>
                      <Building className="h-4 w-4" />
                      <span>{account.name}</span>
                    </>
                  ) : isLoadingAccount ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>No account associated</span>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(opportunity)}>
                {getStatusText(opportunity)}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="h-full max-h-[calc(80vh-100px)] px-6 pt-2">
          <div className="my-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Deal Progress</h3>
              <Badge className={getStageColor(opportunity.stage)}>
                {opportunity.stage || "No Stage"}
              </Badge>
            </div>
            <Progress value={getStageProgress(opportunity.stage)} className="h-2 mb-1" />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Lead Generation</span>
              <span>Qualification</span>
              <span>Proposal</span>
              <span>Negotiation</span>
              <span>Closing</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Deal Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-neutral-500" />
                    <span className="font-medium">
                      {opportunity.amount 
                        ? formatCurrency(opportunity.amount) 
                        : "No amount set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <span>Expected Close: {formatDate(opportunity.expectedCloseDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart4 className="h-4 w-4 text-neutral-500" />
                    <span>Pipeline Stage: {opportunity.stage || "Not set"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {isLoadingAccount ? (
                    <div className="flex justify-center py-4">
                      <RefreshCw className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                  ) : account ? (
                    <>
                      <div className="grid grid-cols-2">
                        <div className="text-neutral-500">Name</div>
                        <div>{account.name}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-neutral-500">Industry</div>
                        <div>{account.industry || "—"}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-neutral-500">Revenue</div>
                        <div>
                          {account.annualRevenue 
                            ? formatCurrency(account.annualRevenue) 
                            : "—"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-neutral-500">Employees</div>
                        <div>{account.employeeCount || "—"}</div>
                      </div>
                    </>
                  ) : (
                    <div className="py-2 text-center text-neutral-500">
                      No account linked to this opportunity
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Owner Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {isLoadingOwner ? (
                    <div className="flex justify-center py-4">
                      <RefreshCw className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                  ) : owner ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {owner.firstName?.[0]}{owner.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{owner.firstName} {owner.lastName}</div>
                        <div className="text-xs text-neutral-500">{owner.role || "Sales Representative"}</div>
                        <div className="text-xs text-neutral-500">{owner.email}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-neutral-500">
                      No owner assigned to this opportunity
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-6">
            <Tabs defaultValue="communications" className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="communications" title="Click to view all communication channels and history, including phone, SMS, WhatsApp">
                  Communications
                </TabsTrigger>
                <TabsTrigger value="proposals">
                  Proposals
                </TabsTrigger>
                <TabsTrigger value="assignments">
                  Assignments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm min-h-[100px]">
                    {opportunity.notes || "No notes available for this opportunity."}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="communications">
                {/* Debug log for account data (called in useEffect to avoid React node issues) */}
                <span className="hidden">{account && opportunity ? JSON.stringify({account, opportunity}) : ""}</span>
                {/* Force a check to ensure account data is available */}
                {account ? (
                  <>
                    {/* Additional debug information for phone numbers - hidden from view */}
                    <div className="hidden">
                      Debug info logged to console
                      {/* Using useEffect in the component to log this instead */}
                    </div>
                    <CommunicationPanel 
                      contactId={opportunity.id}
                      contactType="customer"
                      contactName={opportunity.name}
                      email={account.email || ""}
                      phone={account.phone || ""} 
                    />
                  </>
                ) : (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-neutral-400" />
                    <p className="ml-2">Loading account information...</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="proposals">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Proposals</CardTitle>
                    <CardDescription>Create and manage proposals for this opportunity</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Button 
                      className="w-full justify-center py-8"
                      onClick={() => {
                        // Call the onOpenProposals handler if provided, otherwise fallback to edit
                        if (onOpenProposals) {
                          onOpenProposals(opportunity);
                        } else {
                          onEdit(opportunity);
                        }
                      }}
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Manage Proposals
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="assignments">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Assignment Management</CardTitle>
                    <CardDescription>Assign this opportunity to users or teams</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <AssignmentManager 
                      entityType="opportunity" 
                      entityId={opportunity.id} 
                      entityName={opportunity.name}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="bg-neutral-50 p-4 flex justify-end gap-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onEdit(opportunity)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          {!opportunity.isClosed && (
            <>
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => onChangeStatus(opportunity, { isClosed: true, isWon: true })}
              >
                <Check className="h-4 w-4 mr-2" /> Mark as Won
              </Button>
              <Button 
                variant="outline" 
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => onChangeStatus(opportunity, { isClosed: true, isWon: false })}
              >
                <X className="h-4 w-4 mr-2" /> Mark as Lost
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}