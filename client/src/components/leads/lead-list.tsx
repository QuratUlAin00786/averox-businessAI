import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Search, MoreHorizontal, Pencil, Trash2, Eye, Check, RefreshCw } from "lucide-react";

interface LeadListProps {
  data: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
}

export function LeadList({
  data,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onConvert,
}: LeadListProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to safely display encrypted fields
  const safeDisplayField = (field: any): string => {
    if (!field) return "";
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field.encrypted) return "***";
    return field;
  };

  // Filter leads based on search term
  const filteredLeads = data.filter((lead) => {
    const safeEmail = safeDisplayField(lead.email);
    const safePhone = safeDisplayField(lead.phone);
    const searchString = `${lead.firstName} ${lead.lastName} ${safeEmail} ${
      safePhone
    } ${lead.title || ""} ${lead.company || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
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

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-neutral-500">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search leads..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isMobile ? (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-neutral-500">No leads found</p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <Card key={lead.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <AvatarFallback className="text-primary text-xs">
                          {getInitials(lead.firstName, lead.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {lead.firstName} {lead.lastName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {lead.title || "No Title"} {lead.company ? `at ${lead.company}` : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>{lead.status || "New"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-neutral-600">
                    <div>
                      <p className="text-xs text-neutral-500">Email</p>
                      <p className="truncate">{safeDisplayField(lead.email) || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Phone</p>
                      <p>{safeDisplayField(lead.phone) || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Source</p>
                      <p>{lead.source || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Created</p>
                      <p>{new Date(lead.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end p-2 bg-neutral-50 gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(lead)}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEdit(lead)}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  {!lead.isConverted && (
                    <Button 
                      size="sm" 
                      onClick={() => onConvert(lead)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" /> Convert
                    </Button>
                  )}
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
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-primary text-xs">
                            {getInitials(lead.firstName, lead.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div className="text-sm text-neutral-500">{lead.title || ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || "—"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status || "New"}
                      </Badge>
                    </TableCell>
                    <TableCell>{safeDisplayField(lead.email) || "—"}</TableCell>
                    <TableCell>{safeDisplayField(lead.phone) || "—"}</TableCell>
                    <TableCell>{lead.source || "—"}</TableCell>
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
                          <DropdownMenuItem onClick={() => onView(lead)}>
                            <Eye className="h-4 w-4 mr-2" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(lead)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!lead.isConverted && (
                            <DropdownMenuItem onClick={() => onConvert(lead)}>
                              <Check className="h-4 w-4 mr-2" /> Convert lead
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(lead)}
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