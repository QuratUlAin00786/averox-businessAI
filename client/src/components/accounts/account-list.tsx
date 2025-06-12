import { useState, useMemo } from "react";
import { 
  Search, 
  PlusCircle, 
  MoreHorizontal, 
  Trash2, 
  Pencil, 
  Building,
  Globe,
  Phone,
  Mail,
  MapPin,
  CheckSquare,
  Eye
} from "lucide-react";
import { Account } from "@shared/schema";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (account: Account) => void;
  onDelete: (accountId: number) => void;
  onAdd: () => void;
  onView?: (account: Account) => void;
}

export function AccountList({ 
  accounts, 
  isLoading, 
  error, 
  onEdit, 
  onDelete, 
  onAdd,
  onView
}: AccountListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Safely display field that might be encrypted
  const safeDisplayField = (field: any) => {
    if (!field) return null;
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field.encrypted) return "***";
    return field;
  };

  // Filter accounts based on search query and active status
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      // Filter by active status
      if (!showInactive && account.isActive === false) {
        return false;
      }
      
      // Filter by search query
      const query = searchQuery.toLowerCase();
      const safeName = safeDisplayField(account.name);
      const safeIndustry = safeDisplayField(account.industry);
      const safeWebsite = safeDisplayField(account.website);
      const safePhone = safeDisplayField(account.phone);
      const safeBillingCity = safeDisplayField(account.billingCity);
      const safeBillingState = safeDisplayField(account.billingState);
      const safeBillingCountry = safeDisplayField(account.billingCountry);
      
      return (
        (safeName && typeof safeName === 'string' && safeName.toLowerCase().includes(query)) ||
        (safeIndustry && typeof safeIndustry === 'string' && safeIndustry.toLowerCase().includes(query)) ||
        (safeWebsite && typeof safeWebsite === 'string' && safeWebsite.toLowerCase().includes(query)) ||
        (safePhone && typeof safePhone === 'string' && safePhone.toLowerCase().includes(query)) ||
        (safeBillingCity && typeof safeBillingCity === 'string' && safeBillingCity.toLowerCase().includes(query)) ||
        (safeBillingState && typeof safeBillingState === 'string' && safeBillingState.toLowerCase().includes(query)) ||
        (safeBillingCountry && typeof safeBillingCountry === 'string' && safeBillingCountry.toLowerCase().includes(query))
      );
    });
  }, [accounts, searchQuery, showInactive]);

  // Generate initials from name
  const getInitials = (name: string | null) => {
    const safeName = safeDisplayField(name);
    if (!safeName || typeof safeName !== 'string') return '?';
    
    const words = safeName.split(' ');
    if (words.length === 1) {
      return safeName.substring(0, 2).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };
  
  // Handle select all accounts
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(account => account.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Handle select single account
  const handleSelectAccount = (id: number) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(accountId => accountId !== id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };
  
  // Handle bulk delete action
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedAccounts.length} accounts?`)) {
      selectedAccounts.forEach(id => onDelete(id));
      setSelectedAccounts([]);
      setSelectAll(false);
    }
  };
  
  // Handle bulk set status action
  const handleSetStatus = (isActive: boolean) => {
    // This would typically call an API endpoint to update multiple accounts
    // For now, we'll just simulate this by calling update on each account
    alert(`Set ${selectedAccounts.length} accounts to ${isActive ? 'active' : 'inactive'}`);
    setSelectedAccounts([]);
    setSelectAll(false);
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
        <div className="text-red-500 font-medium">Error Loading Accounts</div>
        <p className="text-neutral-600 mt-2">
          There was a problem loading the accounts data: {error.message}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search accounts..."
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
          Add Account
        </Button>
      </div>

      {selectedAccounts.length > 0 && (
        <div className="bg-neutral-50 border rounded-md p-3 mb-4 flex items-center justify-between">
          <div>
            <span className="font-medium">{selectedAccounts.length} accounts selected</span>
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
                  <p>Set selected accounts as active</p>
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
                    <Building className="h-4 w-4 mr-1" />
                    Mark Inactive
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set selected accounts as inactive</p>
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
      
      {/* Desktop view - table */}
      <div className="border rounded-md hidden md:block">
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
              <TableHead className="w-[250px]">Account Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
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
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => handleSelectAccount(account.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(account.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {safeDisplayField(account.name)}
                        </span>
                        {account.isActive === false && (
                          <span className="text-xs text-neutral-500">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {safeDisplayField(account.industry) ? (
                      <Badge variant="outline" className="font-normal">
                        {safeDisplayField(account.industry)}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{safeDisplayField(account.phone) || "—"}</TableCell>
                  <TableCell>
                    {safeDisplayField(account.billingCity) ? (
                      <span className="text-neutral-600">
                        {safeDisplayField(account.billingCity)}
                        {safeDisplayField(account.billingState) ? `, ${safeDisplayField(account.billingState)}` : ''}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{formatDate(account.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(account)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onView && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={() => onEdit(account)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(account.id)}
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
                      <Building className="h-8 w-8 text-neutral-400" />
                      <p className="text-neutral-500">No accounts match your search</p>
                      <Button variant="link" onClick={() => setSearchQuery("")}>
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Building className="h-8 w-8 text-neutral-400" />
                      <p className="text-neutral-500">No accounts found</p>
                      <Button onClick={onAdd} variant="outline" className="mt-2">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add your first account
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile view - card list */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          // Loading skeletons for mobile
          Array(3).fill(0).map((_, i) => (
            <div key={`loading-mobile-${i}`} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))
        ) : filteredAccounts.length > 0 ? (
          filteredAccounts.map((account) => (
            <div key={`mobile-${account.id}`} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary mr-3"
                  checked={selectedAccounts.includes(account.id)}
                  onChange={() => handleSelectAccount(account.id)}
                />
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(account.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {safeDisplayField(account.name)}
                    </span>
                    {safeDisplayField(account.industry) && (
                      <Badge variant="outline" className="font-normal mt-1">
                        {safeDisplayField(account.industry)}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(account)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {onView && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={() => onEdit(account)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-1 gap-1 pt-1 text-sm">
                {safeDisplayField(account.phone) && (
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 text-neutral-400 mr-2 mt-0.5" />
                    <span className="text-neutral-700">{safeDisplayField(account.phone)}</span>
                  </div>
                )}
                {safeDisplayField(account.website) && (
                  <div className="flex items-start">
                    <Globe className="h-4 w-4 text-neutral-400 mr-2 mt-0.5" />
                    <span className="text-neutral-700">{safeDisplayField(account.website)}</span>
                  </div>
                )}
                {(safeDisplayField(account.billingCity) || safeDisplayField(account.billingState)) && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-neutral-400 mr-2 mt-0.5" />
                    <span className="text-neutral-700">
                      {safeDisplayField(account.billingCity)}
                      {safeDisplayField(account.billingState) ? `, ${safeDisplayField(account.billingState)}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-start mt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs w-full"
                    onClick={() => onView && onView(account)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-white rounded-lg border">
            {searchQuery ? (
              <div className="flex flex-col items-center gap-2">
                <Building className="h-8 w-8 text-neutral-400" />
                <p className="text-neutral-500">No accounts match your search</p>
                <Button variant="link" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Building className="h-8 w-8 text-neutral-400" />
                <p className="text-neutral-500">No accounts found</p>
                <Button onClick={onAdd} variant="outline" className="mt-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add your first account
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}