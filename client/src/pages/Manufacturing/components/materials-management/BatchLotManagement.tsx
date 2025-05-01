import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, BarChartHorizontal, CheckCircle2, ChevronDown, Download, FileText, PlusCircle, QrCode, Search, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BatchLotManagement() {
  const [activeTab, setActiveTab] = useState('batches');
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  
  // Sample data for demonstration
  const batches = [
    {
      id: 'BATCH-25042',
      material: 'Aluminum Sheets',
      materialCode: 'RM-102',
      manufacturer: 'Superior Raw Materials Inc.',
      quantity: '1000 kg',
      manufacturingDate: '2025-03-10',
      expiryDate: 'N/A',
      received: '2025-03-15',
      status: 'Active',
      location: 'Warehouse A, Zone B',
      qualityStatus: 'Approved'
    },
    {
      id: 'BATCH-25043',
      material: 'Steel Rods',
      materialCode: 'RM-156',
      manufacturer: 'Superior Raw Materials Inc.',
      quantity: '1500 kg',
      manufacturingDate: '2025-03-08',
      expiryDate: 'N/A',
      received: '2025-03-14',
      status: 'Active',
      location: 'Warehouse A, Zone B',
      qualityStatus: 'Approved'
    },
    {
      id: 'BATCH-25044',
      material: 'Electronic Controller',
      materialCode: 'CMP-2245',
      manufacturer: 'Global Components Ltd.',
      quantity: '100 units',
      manufacturingDate: '2025-03-18',
      expiryDate: '2028-03-18',
      received: '2025-03-25',
      status: 'Active',
      location: 'Warehouse A, Zone A',
      qualityStatus: 'Approved'
    },
    {
      id: 'BATCH-25045',
      material: 'Chemical Solvent',
      materialCode: 'CHM-5001',
      manufacturer: 'ChemSupply Systems',
      quantity: '200 liters',
      manufacturingDate: '2025-02-25',
      expiryDate: '2025-08-25',
      received: '2025-03-05',
      status: 'Active',
      location: 'Warehouse D, Zone D',
      qualityStatus: 'Approved'
    },
    {
      id: 'BATCH-25046',
      material: 'Packaging Materials',
      materialCode: 'PKG-3001',
      manufacturer: 'Packaging Solutions Co.',
      quantity: '5000 units',
      manufacturingDate: '2025-03-20',
      expiryDate: '2027-03-20',
      received: '2025-03-28',
      status: 'In QA',
      location: 'QA Lab',
      qualityStatus: 'Under Review'
    },
    {
      id: 'BATCH-25047',
      material: 'Raw Polymer',
      materialCode: 'RM-378',
      manufacturer: 'Chemical Processing Inc.',
      quantity: '3200 kg',
      manufacturingDate: '2025-01-15',
      expiryDate: '2025-12-15',
      received: '2025-02-10',
      status: 'Active',
      location: 'Warehouse C, Zone C',
      qualityStatus: 'Approved'
    }
  ];
  
  const qualityTests = [
    {
      id: 'QA-2504-001',
      batchId: 'BATCH-25042',
      material: 'Aluminum Sheets',
      testType: 'Chemical Composition',
      testedBy: 'John Smith',
      testDate: '2025-03-15',
      result: 'Pass',
      parameters: 'Al: 98.5%, Si: 0.7%, Fe: 0.15%, Others: 0.65%',
      notes: 'Within specification limits'
    },
    {
      id: 'QA-2504-002',
      batchId: 'BATCH-25042',
      material: 'Aluminum Sheets',
      testType: 'Dimensional Analysis',
      testedBy: 'John Smith',
      testDate: '2025-03-15',
      result: 'Pass',
      parameters: 'Thickness: 2.0mm ±0.05mm',
      notes: 'Measurements within tolerance'
    },
    {
      id: 'QA-2504-003',
      batchId: 'BATCH-25043',
      material: 'Steel Rods',
      testType: 'Tensile Strength',
      testedBy: 'Sarah Johnson',
      testDate: '2025-03-14',
      result: 'Pass',
      parameters: '420 MPa, Elongation: 23%',
      notes: 'Meets specification'
    },
    {
      id: 'QA-2504-004',
      batchId: 'BATCH-25044',
      material: 'Electronic Controller',
      testType: 'Functional Test',
      testedBy: 'David Lee',
      testDate: '2025-03-25',
      result: 'Pass',
      parameters: 'Operating Voltage: 12V ±0.5V, Current: 200mA',
      notes: 'All units functioning correctly'
    },
    {
      id: 'QA-2504-005',
      batchId: 'BATCH-25045',
      material: 'Chemical Solvent',
      testType: 'Purity Analysis',
      testedBy: 'Linda Chen',
      testDate: '2025-03-05',
      result: 'Pass',
      parameters: 'Purity: 99.2% (Spec: >98.5%)',
      notes: 'Above minimum required purity'
    },
    {
      id: 'QA-2504-006',
      batchId: 'BATCH-25046',
      material: 'Packaging Materials',
      testType: 'Contamination Test',
      testedBy: 'Michael Brown',
      testDate: '2025-03-29',
      result: 'In Progress',
      parameters: 'Pending',
      notes: 'Analysis in progress'
    }
  ];
  
  const expiryTrackingData = [
    { name: '0-30 days', count: 0 },
    { name: '31-60 days', count: 1 },
    { name: '61-90 days', count: 0 },
    { name: '91-180 days', count: 1 },
    { name: '181-360 days', count: 0 },
    { name: '>360 days', count: 2 },
    { name: 'Non-expiring', count: 2 }
  ];
  
  // Render status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'In QA':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">In QA</Badge>;
      case 'Quarantine':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Quarantine</Badge>;
      case 'Consumed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Consumed</Badge>;
      case 'Expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Under Review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Under Review</Badge>;
      case 'Pass':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Pass</Badge>;
      case 'Fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render result icon
  const getResultIcon = (result) => {
    switch(result) {
      case 'Pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'In Progress':
        return <BarChartHorizontal className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Batch/Lot Control</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            Scan Batch
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddBatchOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SAP-level Batch/Lot Management</AlertTitle>
        <AlertDescription>
          Averox provides comprehensive batch/lot control with full traceability, quality inspection tracking,
          expiration management, and genealogy tracking. The system ensures regulatory compliance and supports
          industry-specific requirements for pharmaceuticals, food & beverage, and other regulated industries.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batches">Batches/Lots</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="expiry">Expiration Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Batch/Lot Registry</CardTitle>
                  <CardDescription>Track and manage material batches and lots</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search batches..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="qa">In QA</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                      <SelectItem value="consumed">Consumed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Mfg. Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.id}</TableCell>
                      <TableCell>{batch.material} <div className="text-xs text-muted-foreground">{batch.materialCode}</div></TableCell>
                      <TableCell>{batch.manufacturer}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>{batch.manufacturingDate}</TableCell>
                      <TableCell>{batch.expiryDate}</TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell>{batch.location}</TableCell>
                      <TableCell>{getStatusBadge(batch.qualityStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quality Control Tests</CardTitle>
                  <CardDescription>View batch quality inspection results</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search tests..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>{batch.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test ID</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Tester</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>{test.batchId}</TableCell>
                      <TableCell>{test.material}</TableCell>
                      <TableCell>{test.testType}</TableCell>
                      <TableCell>{test.testedBy}</TableCell>
                      <TableCell>{test.testDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getResultIcon(test.result)}
                          <span className="ml-2">{getStatusBadge(test.result)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{test.parameters}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{test.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiry" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Expiration Tracking</CardTitle>
                  <CardDescription>Monitor batch expiration dates and shelf life</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Expiring Batches Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={expiryTrackingData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" name="Number of Batches" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-4">Expiring Soon (Next 60 Days)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Filter batches expiring in next 60 days */}
                      {batches
                        .filter(batch => 
                          batch.expiryDate !== 'N/A' && 
                          new Date(batch.expiryDate) <= new Date('2025-07-01')
                        )
                        .map((batch) => {
                          const expiryDate = new Date(batch.expiryDate);
                          const today = new Date('2025-05-01'); // Using current date from context
                          const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <TableRow key={batch.id}>
                              <TableCell className="font-medium">{batch.id}</TableCell>
                              <TableCell>{batch.material}</TableCell>
                              <TableCell>{batch.expiryDate}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={daysLeft <= 30 ? "destructive" : "outline"}
                                  className={daysLeft <= 30 ? "" : "bg-yellow-100 text-yellow-800 border-yellow-300"}
                                >
                                  {daysLeft} days
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      }
                      {batches.filter(batch => 
                        batch.expiryDate !== 'N/A' && 
                        new Date(batch.expiryDate) <= new Date('2025-07-01')
                      ).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No batches expiring in the next 60 days
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Batch Dialog */}
      <Dialog open={addBatchOpen} onOpenChange={setAddBatchOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Register New Batch/Lot</DialogTitle>
            <DialogDescription>
              Enter batch details to register a new material batch or lot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Material
              </Label>
              <Select>
                <SelectTrigger id="material" className="col-span-3">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rm-102">RM-102: Aluminum Sheets</SelectItem>
                  <SelectItem value="rm-156">RM-156: Steel Rods</SelectItem>
                  <SelectItem value="cmp-2245">CMP-2245: Electronic Controller</SelectItem>
                  <SelectItem value="chm-5001">CHM-5001: Chemical Solvent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manufacturer" className="text-right">
                Manufacturer
              </Label>
              <Select>
                <SelectTrigger id="manufacturer" className="col-span-3">
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sup-rm">Superior Raw Materials Inc.</SelectItem>
                  <SelectItem value="global-comp">Global Components Ltd.</SelectItem>
                  <SelectItem value="chemsupply">ChemSupply Systems</SelectItem>
                  <SelectItem value="package-sol">Packaging Solutions Co.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input id="quantity" className="col-span-3" placeholder="e.g. 1000 kg" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mfg-date" className="text-right">
                Mfg. Date
              </Label>
              <Input id="mfg-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry-date" className="text-right">
                Expiry Date
              </Label>
              <Input id="expiry-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="received-date" className="text-right">
                Received
              </Label>
              <Input id="received-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Select>
                <SelectTrigger id="location" className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wa-za">Warehouse A, Zone A</SelectItem>
                  <SelectItem value="wa-zb">Warehouse A, Zone B</SelectItem>
                  <SelectItem value="wc-zc">Warehouse C, Zone C</SelectItem>
                  <SelectItem value="wd-zd">Warehouse D, Zone D</SelectItem>
                  <SelectItem value="qa-lab">QA Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select>
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in-qa">In QA</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBatchOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setAddBatchOpen(false)}>
              <QrCode className="h-4 w-4 mr-2" />
              Register Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}