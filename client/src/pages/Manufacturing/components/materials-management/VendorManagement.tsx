import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, FileText, PlusCircle, Search, Star, StarHalf, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function VendorManagement() {
  const [activeTab, setActiveTab] = useState('vendors');
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  
  // Sample data for demonstration
  const vendors = [
    {
      id: 'VEN-001',
      name: 'Superior Raw Materials Inc.',
      type: 'Raw Materials',
      contactPerson: 'John Smith',
      email: 'jsmith@superiorraw.com',
      phone: '(555) 123-4567',
      rating: 4.5,
      status: 'Approved',
      onboardingDate: '2024-01-15',
      lastOrderDate: '2025-04-01',
      certifications: ['ISO 9001', 'ISO 14001']
    },
    {
      id: 'VEN-002',
      name: 'Global Components Ltd.',
      type: 'Components',
      contactPerson: 'Sarah Johnson',
      email: 'sjohnson@globalcomp.com',
      phone: '(555) 234-5678',
      rating: 4.8,
      status: 'Approved',
      onboardingDate: '2023-11-20',
      lastOrderDate: '2025-04-10',
      certifications: ['ISO 9001']
    },
    {
      id: 'VEN-003',
      name: 'ChemSupply Systems',
      type: 'Chemicals',
      contactPerson: 'David Lee',
      email: 'dlee@chemsupply.com',
      phone: '(555) 345-6789',
      rating: 3.9,
      status: 'Under Review',
      onboardingDate: '2024-03-05',
      lastOrderDate: '2025-03-22',
      certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001']
    },
    {
      id: 'VEN-004',
      name: 'PrecisionParts Manufacturing',
      type: 'Machined Parts',
      contactPerson: 'Michael Chen',
      email: 'mchen@precisionparts.com',
      phone: '(555) 456-7890',
      rating: 4.2,
      status: 'Approved',
      onboardingDate: '2023-09-10',
      lastOrderDate: '2025-03-15',
      certifications: ['ISO 9001']
    },
    {
      id: 'VEN-005',
      name: 'Packaging Solutions Co.',
      type: 'Packaging',
      contactPerson: 'Jessica Williams',
      email: 'jwilliams@packagingsol.com',
      phone: '(555) 567-8901',
      rating: 4.0,
      status: 'Approved',
      onboardingDate: '2024-02-18',
      lastOrderDate: '2025-04-05',
      certifications: ['ISO 9001', 'FSC']
    }
  ];
  
  const contracts = [
    {
      id: 'CON-2025-0102',
      vendorId: 'VEN-001',
      vendorName: 'Superior Raw Materials Inc.',
      type: 'Annual Supply',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'Active',
      value: '$1,250,000',
      paymentTerms: 'Net 45',
      deliveryTerms: 'FOB Destination'
    },
    {
      id: 'CON-2025-0098',
      vendorId: 'VEN-002',
      vendorName: 'Global Components Ltd.',
      type: 'Quarterly Supply',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'Active',
      value: '$850,000',
      paymentTerms: 'Net 30',
      deliveryTerms: 'EXW'
    },
    {
      id: 'CON-2025-0118',
      vendorId: 'VEN-003',
      vendorName: 'ChemSupply Systems',
      type: 'Spot Purchase',
      startDate: '2025-03-01',
      endDate: '2025-06-30',
      status: 'Under Review',
      value: '$125,000',
      paymentTerms: 'Net 30',
      deliveryTerms: 'CIF'
    }
  ];
  
  const vendorProducts = [
    {
      id: 'VPROD-001',
      vendorId: 'VEN-001',
      vendorName: 'Superior Raw Materials Inc.',
      productCode: 'RM-10120',
      productName: 'High-Grade Aluminum',
      unitPrice: '$24.50',
      minimumOrder: 100,
      leadTime: '14 days',
      lastPriceUpdate: '2025-02-15'
    },
    {
      id: 'VPROD-002',
      vendorId: 'VEN-001',
      vendorName: 'Superior Raw Materials Inc.',
      productCode: 'RM-10135',
      productName: 'Carbon Steel Sheet',
      unitPrice: '$18.75',
      minimumOrder: 50,
      leadTime: '7 days',
      lastPriceUpdate: '2025-02-15'
    },
    {
      id: 'VPROD-003',
      vendorId: 'VEN-002',
      vendorName: 'Global Components Ltd.',
      productCode: 'CMP-2245',
      productName: 'Electronic Controller',
      unitPrice: '$125.00',
      minimumOrder: 25,
      leadTime: '21 days',
      lastPriceUpdate: '2025-03-01'
    },
    {
      id: 'VPROD-004',
      vendorId: 'VEN-002',
      vendorName: 'Global Components Ltd.',
      productCode: 'CMP-2312',
      productName: 'Sensor Assembly',
      unitPrice: '$45.80',
      minimumOrder: 20,
      leadTime: '14 days',
      lastPriceUpdate: '2025-03-01'
    },
    {
      id: 'VPROD-005',
      vendorId: 'VEN-003',
      vendorName: 'ChemSupply Systems',
      productCode: 'CHM-5001',
      productName: 'Industrial Solvent',
      unitPrice: '$75.20',
      minimumOrder: 10,
      leadTime: '5 days',
      lastPriceUpdate: '2025-03-10'
    }
  ];
  
  // Render star rating
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };
  
  // Render vendor status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Under Review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Under Review</Badge>;
      case 'Suspended':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Suspended</Badge>;
      case 'Active':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Active</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Vendor Management</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" onClick={() => setAddVendorOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SAP-level Vendor Management System</AlertTitle>
        <AlertDescription>
          Averox provides comprehensive vendor management capabilities with supplier performance tracking, 
          contract management, vendor scorecards, and integrated vendor catalogs. Our system
          enables strategic sourcing, compliance tracking, and efficient vendor collaboration.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="products">Vendor Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vendor Directory</CardTitle>
                  <CardDescription>Manage your material and component suppliers</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search vendors..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Certifications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.id}</TableCell>
                      <TableCell>{vendor.name}</TableCell>
                      <TableCell>{vendor.type}</TableCell>
                      <TableCell>
                        <div>{vendor.contactPerson}</div>
                        <div className="text-sm text-muted-foreground">{vendor.email}</div>
                      </TableCell>
                      <TableCell>{renderRating(vendor.rating)}</TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell>{vendor.lastOrderDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {vendor.certifications.map(cert => (
                            <Badge key={cert} variant="secondary" className="text-xs">{cert}</Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vendor Contracts</CardTitle>
                  <CardDescription>Manage vendor agreements and contracts</CardDescription>
                </div>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Contract
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Delivery Terms</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.id}</TableCell>
                      <TableCell>{contract.vendorName}</TableCell>
                      <TableCell>{contract.type}</TableCell>
                      <TableCell>
                        <div>{contract.startDate}</div>
                        <div className="text-sm text-muted-foreground">to {contract.endDate}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>{contract.value}</TableCell>
                      <TableCell>{contract.paymentTerms}</TableCell>
                      <TableCell>{contract.deliveryTerms}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vendor Products</CardTitle>
                  <CardDescription>Products and materials available from vendors</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendors</SelectItem>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
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
                    <TableHead>Product ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Min. Order</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.productCode}</TableCell>
                      <TableCell>{product.vendorName}</TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.unitPrice}</TableCell>
                      <TableCell>{product.minimumOrder}</TableCell>
                      <TableCell>{product.leadTime}</TableCell>
                      <TableCell>{product.lastPriceUpdate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Vendor Dialog */}
      <Dialog open={addVendorOpen} onOpenChange={setAddVendorOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Enter vendor details to add them to your supplier database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor-name" className="text-right">
                Name
              </Label>
              <Input id="vendor-name" className="col-span-3" placeholder="Company name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor-type" className="text-right">
                Type
              </Label>
              <Select>
                <SelectTrigger id="vendor-type" className="col-span-3">
                  <SelectValue placeholder="Select vendor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw">Raw Materials</SelectItem>
                  <SelectItem value="component">Components</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="chemical">Chemicals</SelectItem>
                  <SelectItem value="service">Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact-person" className="text-right">
                Contact Person
              </Label>
              <Input id="contact-person" className="col-span-3" placeholder="Full name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact-email" className="text-right">
                Email
              </Label>
              <Input id="contact-email" type="email" className="col-span-3" placeholder="email@example.com" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact-phone" className="text-right">
                Phone
              </Label>
              <Input id="contact-phone" className="col-span-3" placeholder="(555) 123-4567" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor-address" className="text-right">
                Address
              </Label>
              <Textarea id="vendor-address" className="col-span-3" placeholder="Full address" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="certifications" className="text-right">
                Certifications
              </Label>
              <Input id="certifications" className="col-span-3" placeholder="e.g. ISO 9001, ISO 14001" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddVendorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setAddVendorOpen(false)}>
              <Users className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}