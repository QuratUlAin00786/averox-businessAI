import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, Plus, CalendarClock, ClipboardCheck } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BatchLotManagement() {
  const [activeTab, setActiveTab] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all batch lots
  const { 
    data: batchLotsData, 
    isLoading: isLoadingBatchLots, 
    isError: isBatchLotsError,
    error: batchLotsError
  } = useQuery({
    queryKey: ['/api/manufacturing/batch-lots'],
    enabled: activeTab === 'current'
  });

  // Fetch expiring batch lots
  const { 
    data: expiringLotsData, 
    isLoading: isLoadingExpiringLots,
    isError: isExpiringLotsError,
    error: expiringLotsError
  } = useQuery({
    queryKey: ['/api/manufacturing/batch-lots/expiring', { days: 90 }],
    enabled: activeTab === 'expiring'
  });

  const isLoading = (activeTab === 'current' && isLoadingBatchLots) || 
                   (activeTab === 'expiring' && isLoadingExpiringLots);
  
  const isError = (activeTab === 'current' && isBatchLotsError) || 
                 (activeTab === 'expiring' && isExpiringLotsError);
  
  const error = activeTab === 'current' ? batchLotsError : expiringLotsError;

  // Filter batch lots based on search term
  const filteredBatchLots = batchLotsData && searchTerm
    ? batchLotsData.filter(batch => 
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.vendorName && batch.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (batch.locationName && batch.locationName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : batchLotsData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load batch lot data'}
        </AlertDescription>
      </Alert>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="current">Current Batch Lots</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Batches</TabsTrigger>
          <TabsTrigger value="quality">Quality Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Batch/Lot Management</CardTitle>
                  <CardDescription>
                    Manage batch and lot tracking for inventory
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Batch/Lot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Add New Batch/Lot</DialogTitle>
                      <DialogDescription>
                        Enter batch/lot details to add a new entry to the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-center text-muted-foreground">
                        Batch/Lot creation form will be loaded from the database...
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center border rounded-md px-3 mb-4 w-full max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <Input 
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0" 
                  placeholder="Search batch lots..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {filteredBatchLots?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatchLots.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                        <TableCell>{batch.materialName}</TableCell>
                        <TableCell>
                          {parseFloat(batch.remainingQuantity).toFixed(2)} {batch.uom}
                          {batch.remainingQuantity !== batch.quantity && (
                            <span className="text-xs text-muted-foreground block">
                              (of {parseFloat(batch.quantity).toFixed(2)})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{batch.locationName || 'Unassigned'}</TableCell>
                        <TableCell>
                          <BatchStatusBadge status={batch.status} />
                        </TableCell>
                        <TableCell>{formatDate(batch.expirationDate)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? (
                    <p>No batch lots match your search criteria.</p>
                  ) : (
                    <p>No batch lots found. Please add a batch lot to get started.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiring" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <CalendarClock className="h-5 w-5 mr-2" />
                    Expiring Batches
                  </CardTitle>
                  <CardDescription>
                    Batches expiring in the next 90 days
                  </CardDescription>
                </div>
                <Button variant="outline">Generate Report</Button>
              </div>
            </CardHeader>
            <CardContent>
              {expiringLotsData?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Expiration Date</TableHead>
                      <TableHead>Days Remaining</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringLotsData.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                        <TableCell>{batch.materialName}</TableCell>
                        <TableCell>{parseFloat(batch.remainingQuantity).toFixed(2)} {batch.uom}</TableCell>
                        <TableCell>{batch.locationName || 'Unassigned'}</TableCell>
                        <TableCell>{formatDate(batch.expirationDate)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              batch.daysRemaining <= 30 ? 'bg-red-500' :
                              batch.daysRemaining <= 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }
                          >
                            {batch.daysRemaining} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Action</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="mb-2">No batches expiring in the next 90 days</p>
                  <p className="text-sm">All your inventory items have plenty of shelf life remaining</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <ClipboardCheck className="h-5 w-5 mr-2" />
                    Quality Control
                  </CardTitle>
                  <CardDescription>
                    Batch/lot quality inspection and reporting
                  </CardDescription>
                </div>
                <Button>New Inspection</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Quality control dashboard with inspection schedules and compliance tracking is being loaded...
                </p>
                <Button variant="outline">View Inspection History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for rendering batch status badges
function BatchStatusBadge({ status }) {
  let badgeClass = '';
  
  switch (status) {
    case 'Available':
      badgeClass = 'bg-green-500';
      break;
    case 'Reserved':
      badgeClass = 'bg-blue-500';
      break;
    case 'On Hold':
      badgeClass = 'bg-yellow-500';
      break;
    case 'In QA':
      badgeClass = 'bg-purple-500';
      break;
    case 'Rejected':
      badgeClass = 'bg-red-500';
      break;
    case 'Expired':
      badgeClass = 'bg-gray-500';
      break;
    case 'Consumed':
      badgeClass = 'bg-gray-400';
      break;
    case 'Recalled':
      badgeClass = 'bg-red-600';
      break;
    default:
      badgeClass = 'bg-gray-400';
  }
  
  return <Badge className={badgeClass}>{status}</Badge>;
}