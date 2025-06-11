import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, AlertCircle, Plus, CalendarClock, ClipboardCheck, FileDown } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from '@/lib/queryClient';

export default function BatchLotManagement() {
  const [activeTab, setActiveTab] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    lotNumber: '',
    batchNumber: '',
    productId: '',
    vendorId: '',
    quantity: '',
    unitOfMeasure: 'kg',
    manufacturingDate: '',
    expirationDate: '',
    status: 'Available',
    qualityStatus: 'Pending',
    cost: '',
    notes: ''
  });
  
  const [inspectionFormData, setInspectionFormData] = useState({
    batchLotId: '',
    inspectorName: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    testType: '',
    testResult: '',
    qualityRating: '',
    defectsFound: '',
    corrective_action: '',
    approved: false,
    comments: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to generate and download expiring batches report
  const generateExpiringBatchesReport = () => {
    if (!expiringLotsData || expiringLotsData.length === 0) {
      toast({
        title: "No Data Available",
        description: "There are no expiring batches to include in the report.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content
    const headers = ['Batch Number', 'Material', 'Quantity', 'UOM', 'Location', 'Expiration Date', 'Days Remaining', 'Status'];
    const csvContent = [
      headers.join(','),
      ...expiringLotsData.map(batch => [
        `"${batch.batchNumber}"`,
        `"${batch.materialName}"`,
        parseFloat(batch.remainingQuantity).toFixed(2),
        `"${batch.uom}"`,
        `"${batch.locationName || 'Unassigned'}"`,
        `"${formatDate(batch.expirationDate)}"`,
        batch.daysRemaining,
        `"${batch.status}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expiring-batches-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Generated",
      description: "Expiring batches report has been downloaded successfully."
    });
  };

  // Create inspection mutation
  const createInspectionMutation = useMutation({
    mutationFn: async (inspectionData: any) => {
      const response = await apiRequest('POST', '/api/manufacturing/quality-inspections', inspectionData);
      if (!response.ok) {
        throw new Error('Failed to create quality inspection');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inspection Created",
        description: "Quality inspection has been created successfully."
      });
      setIsInspectionDialogOpen(false);
      setInspectionFormData({
        batchLotId: '',
        inspectorName: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        testType: '',
        testResult: '',
        qualityRating: '',
        defectsFound: '',
        corrective_action: '',
        approved: false,
        comments: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/quality-inspections'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quality inspection.",
        variant: "destructive"
      });
    }
  });

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInspectionMutation.mutate(inspectionFormData);
  };
  
  // Fetch products for dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });
  
  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/manufacturing/vendors'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/vendors');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    }
  });
  
  // Create batch lot mutation
  const createBatchLotMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Transform camelCase to snake_case for API
      const apiData = {
        product_id: parseInt(data.productId),
        lot_number: data.lotNumber,
        batch_number: data.batchNumber,
        quantity: parseFloat(data.quantity),
        unit_of_measure: data.unitOfMeasure,
        vendor_id: data.vendorId ? parseInt(data.vendorId) : null,
        manufacture_date: data.manufacturingDate || null,
        expiration_date: data.expirationDate || null,
        status: data.status,
        quality_status: data.qualityStatus,
        cost: data.cost ? parseFloat(data.cost) : null,
        notes: data.notes || null
      };
      const response = await apiRequest('POST', '/api/manufacturing/batch-lots', apiData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Batch/lot created successfully" });
      setIsDialogOpen(false);
      setFormData({
        lotNumber: '',
        batchNumber: '',
        productId: '',
        vendorId: '',
        quantity: '',
        unitOfMeasure: 'kg',
        manufacturingDate: '',
        expirationDate: '',
        status: 'Available',
        qualityStatus: 'Pending',
        cost: '',
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/batch-lots'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create batch/lot",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lotNumber || !formData.productId || !formData.quantity) {
      toast({ 
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createBatchLotMutation.mutate(formData);
  };
  
  // Fetch all batch lots
  const { 
    data: batchLotsResponse, 
    isLoading: isLoadingBatchLots, 
    isError: isBatchLotsError,
    error: batchLotsError
  } = useQuery({
    queryKey: ['/api/manufacturing/batch-lots'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/batch-lots');
      if (!response.ok) {
        throw new Error('Failed to fetch batch/lot data');
      }
      return response.json();
    },
    enabled: activeTab === 'current'
  });

  // Use the data directly - our API endpoints now format the data correctly
  const batchLotsData = batchLotsResponse || [];

  // Fetch expiring batch lots
  const { 
    data: expiringLotsResponse, 
    isLoading: isLoadingExpiringLots,
    isError: isExpiringLotsError,
    error: expiringLotsError
  } = useQuery({
    queryKey: ['/api/manufacturing/batch-lots/expiring', { days: 90 }],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/batch-lots/expiring?days=90');
      if (!response.ok) {
        throw new Error('Failed to fetch expiring batch/lot data');
      }
      return response.json();
    },
    enabled: activeTab === 'expiring'
  });
  
  // Use the data directly - our API endpoints now format the data correctly
  const expiringLotsData = expiringLotsResponse || [];

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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Batch/Lot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Batch/Lot</DialogTitle>
                      <DialogDescription>
                        Enter batch/lot details to add a new entry to the system
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lotNumber">Lot Number *</Label>
                          <Input
                            id="lotNumber"
                            value={formData.lotNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
                            placeholder="LOT-001"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="batchNumber">Batch Number</Label>
                          <Input
                            id="batchNumber"
                            value={formData.batchNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                            placeholder="BATCH-001"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="productId">Product *</Label>
                          <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(products) && products.map((product: any) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vendorId">Vendor</Label>
                          <Select value={formData.vendorId} onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a vendor" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(vendors) && vendors.map((vendor: any) => (
                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                  {vendor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                            placeholder="100"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                          <Select value={formData.unitOfMeasure} onValueChange={(value) => setFormData(prev => ({ ...prev, unitOfMeasure: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="lbs">lbs</SelectItem>
                              <SelectItem value="pieces">pieces</SelectItem>
                              <SelectItem value="liters">liters</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
                          <Input
                            id="manufacturingDate"
                            type="datetime-local"
                            value={formData.manufacturingDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expirationDate">Expiration Date</Label>
                          <Input
                            id="expirationDate"
                            type="datetime-local"
                            value={formData.expirationDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Reserved">Reserved</SelectItem>
                              <SelectItem value="Consumed">Consumed</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualityStatus">Quality Status</Label>
                          <Select value={formData.qualityStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, qualityStatus: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                              <SelectItem value="On Hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cost">Cost</Label>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          value={formData.cost}
                          onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes..."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createBatchLotMutation.isPending}>
                          {createBatchLotMutation.isPending ? 'Creating...' : 'Create Batch/Lot'}
                        </Button>
                      </div>
                    </form>
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
                <Button variant="outline" onClick={generateExpiringBatchesReport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
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
                <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Inspection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Quality Inspection</DialogTitle>
                      <DialogDescription>
                        Enter inspection details for batch/lot quality control
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInspectionSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="batchLotId">Batch/Lot</Label>
                          <Select value={inspectionFormData.batchLotId} onValueChange={(value) => setInspectionFormData(prev => ({ ...prev, batchLotId: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select batch/lot" />
                            </SelectTrigger>
                            <SelectContent>
                              {batchLotsData?.map((batch: any) => (
                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                  {batch.batchNumber} - {batch.materialName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inspectorName">Inspector Name</Label>
                          <Input
                            id="inspectorName"
                            value={inspectionFormData.inspectorName}
                            onChange={(e) => setInspectionFormData(prev => ({ ...prev, inspectorName: e.target.value }))}
                            placeholder="Enter inspector name"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="inspectionDate">Inspection Date</Label>
                          <Input
                            id="inspectionDate"
                            type="date"
                            value={inspectionFormData.inspectionDate}
                            onChange={(e) => setInspectionFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="testType">Test Type</Label>
                          <Select value={inspectionFormData.testType} onValueChange={(value) => setInspectionFormData(prev => ({ ...prev, testType: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select test type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visual Inspection">Visual Inspection</SelectItem>
                              <SelectItem value="Chemical Analysis">Chemical Analysis</SelectItem>
                              <SelectItem value="Physical Testing">Physical Testing</SelectItem>
                              <SelectItem value="Microbiological">Microbiological</SelectItem>
                              <SelectItem value="Functional Testing">Functional Testing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="testResult">Test Result</Label>
                          <Select value={inspectionFormData.testResult} onValueChange={(value) => setInspectionFormData(prev => ({ ...prev, testResult: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pass">Pass</SelectItem>
                              <SelectItem value="Fail">Fail</SelectItem>
                              <SelectItem value="Conditional">Conditional</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualityRating">Quality Rating</Label>
                          <Select value={inspectionFormData.qualityRating} onValueChange={(value) => setInspectionFormData(prev => ({ ...prev, qualityRating: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A - Excellent</SelectItem>
                              <SelectItem value="B">B - Good</SelectItem>
                              <SelectItem value="C">C - Acceptable</SelectItem>
                              <SelectItem value="D">D - Poor</SelectItem>
                              <SelectItem value="F">F - Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defectsFound">Defects Found</Label>
                        <Textarea
                          id="defectsFound"
                          value={inspectionFormData.defectsFound}
                          onChange={(e) => setInspectionFormData(prev => ({ ...prev, defectsFound: e.target.value }))}
                          placeholder="Describe any defects found..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="corrective_action">Corrective Action</Label>
                        <Textarea
                          id="corrective_action"
                          value={inspectionFormData.corrective_action}
                          onChange={(e) => setInspectionFormData(prev => ({ ...prev, corrective_action: e.target.value }))}
                          placeholder="Describe corrective actions taken..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea
                          id="comments"
                          value={inspectionFormData.comments}
                          onChange={(e) => setInspectionFormData(prev => ({ ...prev, comments: e.target.value }))}
                          placeholder="Additional comments..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="approved"
                          checked={inspectionFormData.approved}
                          onChange={(e) => setInspectionFormData(prev => ({ ...prev, approved: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="approved">Mark as Approved</Label>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsInspectionDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createInspectionMutation.isPending}>
                          {createInspectionMutation.isPending ? 'Creating...' : 'Create Inspection'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No quality control data available. Please add data to the database.
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