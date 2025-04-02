import { useState } from "react";
import { 
  Search, 
  PlusCircle, 
  MoreHorizontal, 
  Trash2, 
  Pencil, 
  ChevronDown,
  User,
  CheckSquare,
  Mail,
  UserCog
} from "lucide-react";
import { Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => void;
  onAdd: () => void;
}

export function ContactList({ 
  contacts, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onAdd 
}: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter contacts based on search query and active status
  const filteredContacts = contacts.filter(contact => {
    // Filter by active status
    if (!showInactive && contact.isActive === false) {
      return false;
    }
    
    // Filter by search query
    const query = searchQuery.toLowerCase();
    return (
      contact.firstName?.toLowerCase().includes(query) ||
      contact.lastName?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      contact.title?.toLowerCase().includes(query) ||
      contact.address?.toLowerCase().includes(query) ||
      contact.city?.toLowerCase().includes(query)
    );
  });

  // Generate initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };
  
  // Handle select all contacts
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Handle select single contact
  const handleSelectContact = (id: number) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };
  
  // Handle bulk delete action
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
      selectedContacts.forEach(id => onDelete(id));
      setSelectedContacts([]);
      setSelectAll(false);
    }
  };
  
  // Handle bulk set status action
  const handleSetStatus = (isActive: boolean) => {
    // This would typically call an API endpoint to update multiple contacts
    // For now, we'll just simulate this by calling update on each contact
    alert(`Set ${selectedContacts.length} contacts to ${isActive ? 'active' : 'inactive'}`);
    setSelectedContacts([]);
    setSelectAll(false);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Contacts</CardTitle>
          <CardDescription>
            There was a problem loading the contacts data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox" 
              id="showInactive"
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            <label htmlFor="showInactive" className="text-sm text-neutral-600">
              Show inactive
            </label>
          </div>
        </div>
        <Button onClick={onAdd}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {selectedContacts.length > 0 && (
        <div className="bg-neutral-50 border rounded-md p-3 mb-4 flex items-center justify-between">
          <div>
            <span className="font-medium">{selectedContacts.length} contacts selected</span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSetStatus(true)}
                    className="text-neutral-700"
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Mark Active
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set selected contacts as active</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSetStatus(false)}
                    className="text-neutral-700"
                  >
                    <UserCog className="h-4 w-4 mr-1" />
                    Mark Inactive
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set selected contacts as inactive</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBulkDelete}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array(5).fill(0).map((_, i) => (
                <TableRow key={`loading-${i}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(contact.firstName, contact.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                        {contact.isActive === false && (
                          <span className="text-xs text-neutral-500">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.email || "—"}</TableCell>
                  <TableCell>{contact.phone || "—"}</TableCell>
                  <TableCell>
                    {contact.title ? (
                      <Badge variant="outline" className="font-normal">
                        {contact.title}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{formatDate(contact.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(contact)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchQuery ? (
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-neutral-400" />
                      <p className="text-neutral-500">No contacts match your search</p>
                      <Button variant="link" onClick={() => setSearchQuery("")}>
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-neutral-400" />
                      <p className="text-neutral-500">No contacts found</p>
                      <Button onClick={onAdd} variant="outline" className="mt-2">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add your first contact
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}