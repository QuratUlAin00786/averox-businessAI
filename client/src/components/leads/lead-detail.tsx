import { useState } from "react";
import { Lead, User } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Check, Phone, Mail, Building, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LeadDetailProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
}

export function LeadDetail({
  isOpen,
  lead,
  onClose,
  onEdit,
  onConvert,
}: LeadDetailProps) {
  // Fetch owner data if available
  const { data: owner, isLoading: isLoadingOwner } = useQuery<User>({
    queryKey: ["/api/users", lead?.ownerId],
    enabled: isOpen && !!lead?.ownerId,
  });

  // Getting status badge color
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-green-100 text-green-800";
      case "Contacted":
        return "bg-yellow-100 text-yellow-800";
      case "Not Interested":
        return "bg-red-100 text-red-800";
      case "Converted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Getting initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  if (!lead) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0">
        <div className="sticky top-0 z-10 bg-white pt-6 px-6 pb-4 border-b">
          <DialogHeader className="mb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {lead ? getInitials(lead.firstName, lead.lastName) : "--"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl mb-1">
                    {lead.firstName} {lead.lastName}
                  </DialogTitle>
                  <div className="flex gap-2 items-center text-sm text-neutral-500">
                    {lead.title && (
                      <>
                        <span>{lead.title}</span>
                        {lead.company && <span>•</span>}
                      </>
                    )}
                    {lead.company && <span>{lead.company}</span>}
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(lead.status)}>
                {lead.status || "New"}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="h-full max-h-[calc(80vh-100px)] px-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-500" />
                    <span>{lead.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-neutral-500" />
                    <span>{lead.phone || "No phone provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-neutral-500" />
                    <span>{lead.company || "No company provided"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2">
                    <div className="text-neutral-500">Status</div>
                    <div>{lead.status || "New"}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="text-neutral-500">Source</div>
                    <div>{lead.source || "Unknown"}</div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="text-neutral-500">Created</div>
                    <div>
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="text-neutral-500">Owner</div>
                    <div className="truncate">
                      {isLoadingOwner ? (
                        <RefreshCw className="h-3 w-3 animate-spin inline mr-1" />
                      ) : owner ? (
                        `${owner.firstName} ${owner.lastName}`
                      ) : (
                        "Unassigned"
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conversion Status</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2">
                    <div className="text-neutral-500">Converted</div>
                    <div>{lead.isConverted ? "Yes" : "No"}</div>
                  </div>
                  {lead.isConverted && (
                    <>
                      <div className="grid grid-cols-2">
                        <div className="text-neutral-500">Contact</div>
                        <div>{lead.convertedToContactId ? "Created" : "N/A"}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-neutral-500">Account</div>
                        <div>{lead.convertedToAccountId ? "Created" : "N/A"}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-neutral-500">Opportunity</div>
                        <div>{lead.convertedToOpportunityId ? "Created" : "N/A"}</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-base mb-2">Notes</h3>
            <Card>
              <CardContent className="p-4 text-sm min-h-[100px]">
                {lead.notes || "No notes available for this lead."}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="bg-neutral-50 p-4 flex justify-end gap-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onEdit(lead)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          {!lead.isConverted && (
            <Button 
              onClick={() => onConvert(lead)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" /> Convert
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}