import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, Download, FileCheck, FileText, Globe, PlusCircle, Search, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function TradeComplianceList() {
  const [activeTab, setActiveTab] = useState('compliance');
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  
  // Sample data for demonstration
  const complianceItems = [
    {
      id: 'COMP-25-0012',
      materialCode: 'RM-102',
      materialName: 'Aluminum Sheets',
      type: 'Raw Material',
      country: 'United States',
      harmonizedCode: '7606.11.3060',
      complianceStatus: 'Compliant',
      restrictions: 'None',
      lastUpdated: '2025-03-15',
      certifications: ['REACH', 'RoHS'],
      notes: 'Standard aluminum sheets for industrial use'
    },
    {
      id: 'COMP-25-0013',
      materialCode: 'RM-156',
      materialName: 'Steel Rods',
      type: 'Raw Material',
      country: 'Germany',
      harmonizedCode: '7215.50.0090',
      complianceStatus: 'Compliant',
      restrictions: 'None',
      lastUpdated: '2025-03-18',
      certifications: ['REACH', 'RoHS', 'CE'],
      notes: 'Cold-finished carbon steel rods'
    },
    {
      id: 'COMP-25-0014',
      materialCode: 'CMP-2245',
      materialName: 'Electronic Controller',
      type: 'Component',
      country: 'China',
      harmonizedCode: '8537.10.9170',
      complianceStatus: 'Pending Review',
      restrictions: 'Import Licensing Required',
      lastUpdated: '2025-04-02',
      certifications: ['CE', 'FCC'],
      notes: 'Electronic controller for manufacturing equipment, needs additional documentation'
    },
    {
      id: 'COMP-25-0015',
      materialCode: 'CHM-5001',
      materialName: 'Industrial Solvent',
      type: 'Chemical',
      country: 'Canada',
      harmonizedCode: '3814.00.5090',
      complianceStatus: 'Restricted',
      restrictions: 'Hazardous Material, Special Permits Required',
      lastUpdated: '2025-03-25',
      certifications: ['REACH'],
      notes: 'Chemical solvent with restrictions on shipping and handling'
    },
    {
      id: 'COMP-25-0016',
      materialCode: 'FG-5001',
      materialName: 'Industrial Control Panel',
      type: 'Finished Good',
      country: 'United States',
      harmonizedCode: '8537.10.9150',
      complianceStatus: 'Compliant',
      restrictions: 'Export License Required for Certain Countries',
      lastUpdated: '2025-04-10',
      certifications: ['UL', 'CE', 'RoHS', 'FCC'],
      notes: 'Control panel for industrial machinery'
    },
    {
      id: 'COMP-25-0017',
      materialCode: 'PKG-3001',
      materialName: 'Packaging Materials',
      type: 'Packaging',
      country: 'Mexico',
      harmonizedCode: '4819.10.0040',
      complianceStatus: 'Compliant',
      restrictions: 'None',
      lastUpdated: '2025-03-20',
      certifications: ['FSC', 'Recycling Compliance'],
      notes: 'Corrugated boxes and packaging materials'
    }
  ];
  
  const tradeDocuments = [
    {
      id: 'DOC-2025-0145',
      type: 'Certificate of Origin',
      relatedItem: 'RM-102: Aluminum Sheets',
      issueDate: '2025-01-15',
      expiryDate: '2026-01-15',
      issuingAuthority: 'US Chamber of Commerce',
      status: 'Valid',
      notes: 'Certificate confirms USA origin'
    },
    {
      id: 'DOC-2025-0146',
      type: 'Certificate of Origin',
      relatedItem: 'RM-156: Steel Rods',
      issueDate: '2025-02-05',
      expiryDate: '2026-02-05',
      issuingAuthority: 'German Chamber of Industry and Commerce',
      status: 'Valid',
      notes: 'Certificate confirms German origin'
    },
    {
      id: 'DOC-2025-0147',
      type: 'Import License',
      relatedItem: 'CMP-2245: Electronic Controller',
      issueDate: '2025-03-10',
      expiryDate: '2025-09-10',
      issuingAuthority: 'Department of Commerce',
      status: 'Valid',
      notes: 'License for importing electronics components'
    },
    {
      id: 'DOC-2025-0148',
      type: 'Hazardous Materials Certificate',
      relatedItem: 'CHM-5001: Industrial Solvent',
      issueDate: '2025-02-20',
      expiryDate: '2025-08-20',
      issuingAuthority: 'Environmental Protection Agency',
      status: 'Valid',
      notes: 'Certification for handling and shipping hazardous materials'
    },
    {
      id: 'DOC-2025-0149',
      type: 'Export License',
      relatedItem: 'FG-5001: Industrial Control Panel',
      issueDate: '2025-03-25',
      expiryDate: '2026-03-25',
      issuingAuthority: 'Bureau of Industry and Security',
      status: 'Valid',
      notes: 'License for exporting control systems to specific countries'
    },
    {
      id: 'DOC-2025-0150',
      type: 'REACH Compliance Certificate',
      relatedItem: 'RM-102: Aluminum Sheets',
      issueDate: '2025-01-20',
      expiryDate: '2026-01-20',
      issuingAuthority: 'European Chemicals Agency',
      status: 'Valid',
      notes: 'Certification of compliance with REACH regulations'
    },
    {
      id: 'DOC-2025-0151',
      type: 'RoHS Compliance Certificate',
      relatedItem: 'CMP-2245: Electronic Controller',
      issueDate: '2025-03-12',
      expiryDate: '2026-03-12',
      issuingAuthority: 'Compliance Testing Laboratory',
      status: 'Valid',
      notes: 'Certification of compliance with RoHS regulations'
    }
  ];
  
  const shipmentCompliance = [
    {
      id: 'SHP-2025-0098',
      shipmentNumber: 'SHP-20250325-001',
      type: 'Export',
      origin: 'United States',
      destination: 'Germany',
      departureDate: '2025-03-25',
      items: [
        { code: 'FG-5001', name: 'Industrial Control Panel', quantity: 5 }
      ],
      documentStatus: 'Complete',
      customsClearance: 'Approved',
      notes: 'All export documentation complete and approved'
    },
    {
      id: 'SHP-2025-0097',
      shipmentNumber: 'SHP-20250320-002',
      type: 'Import',
      origin: 'China',
      destination: 'United States',
      departureDate: '2025-03-20',
      items: [
        { code: 'CMP-2245', name: 'Electronic Controller', quantity: 100 }
      ],
      documentStatus: 'Incomplete',
      customsClearance: 'Pending',
      notes: 'Waiting for import license approval'
    },
    {
      id: 'SHP-2025-0096',
      shipmentNumber: 'SHP-20250315-001',
      type: 'Import',
      origin: 'Germany',
      destination: 'United States',
      departureDate: '2025-03-15',
      items: [
        { code: 'RM-156', name: 'Steel Rods', quantity: 1500 }
      ],
      documentStatus: 'Complete',
      customsClearance: 'Approved',
      notes: 'All import documentation complete and approved'
    },
    {
      id: 'SHP-2025-0095',
      shipmentNumber: 'SHP-20250310-002',
      type: 'Export',
      origin: 'United States',
      destination: 'Mexico',
      departureDate: '2025-03-10',
      items: [
        { code: 'FG-5001', name: 'Industrial Control Panel', quantity: 3 },
        { code: 'CMP-2245', name: 'Electronic Controller', quantity: 15 }
      ],
      documentStatus: 'Complete',
      customsClearance: 'Approved',
      notes: 'NAFTA documentation included'
    },
    {
      id: 'SHP-2025-0094',
      shipmentNumber: 'SHP-20250305-001',
      type: 'Export',
      origin: 'United States',
      destination: 'Japan',
      departureDate: '2025-03-05',
      items: [
        { code: 'FG-5001', name: 'Industrial Control Panel', quantity: 2 }
      ],
      documentStatus: 'Incomplete',
      customsClearance: 'Pending',
      notes: 'Waiting for Japanese import approval'
    }
  ];
  
  // Render status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Compliant':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Compliant</Badge>;
      case 'Pending Review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Review</Badge>;
      case 'Restricted':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Restricted</Badge>;
      case 'Non-Compliant':
        return <Badge variant="destructive">Non-Compliant</Badge>;
      case 'Valid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Valid</Badge>;
      case 'Complete':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Complete</Badge>;
      case 'Incomplete':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Incomplete</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Compliant':
      case 'Valid':
      case 'Complete':
      case 'Approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Pending Review':
      case 'Incomplete':
      case 'Pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'Restricted':
      case 'Non-Compliant':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Global Trade Compliance</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setAddDocumentOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SAP-level Global Trade Compliance</AlertTitle>
        <AlertDescription>
          Averox provides comprehensive global trade compliance management with customs document handling,
          international shipping management, and regulatory compliance tracking. This system helps
          organizations comply with export/import regulations and streamlines cross-border operations.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Material Compliance</TabsTrigger>
          <TabsTrigger value="documents">Trade Documents</TabsTrigger>
          <TabsTrigger value="shipments">Shipment Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Material Compliance Registry</CardTitle>
                  <CardDescription>Track regulatory compliance for materials and products</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search materials..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="non-compliant">Non-Compliant</SelectItem>
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
                    <TableHead>Material</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country of Origin</TableHead>
                    <TableHead>HS Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Restrictions</TableHead>
                    <TableHead>Certifications</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <div>{item.materialName}</div>
                        <div className="text-xs text-muted-foreground">{item.materialCode}</div>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.country}</TableCell>
                      <TableCell>{item.harmonizedCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(item.complianceStatus)}
                          <span className="ml-2">{getStatusBadge(item.complianceStatus)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{item.restrictions}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.certifications.map(cert => (
                            <Badge key={cert} variant="secondary" className="text-xs">{cert}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
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
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Trade Documents</CardTitle>
                  <CardDescription>Manage certificates, licenses, and compliance documents</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search documents..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="origin">Certificate of Origin</SelectItem>
                      <SelectItem value="import">Import License</SelectItem>
                      <SelectItem value="export">Export License</SelectItem>
                      <SelectItem value="compliance">Compliance Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Related Item</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Issuing Authority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradeDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.id}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{doc.relatedItem}</TableCell>
                      <TableCell>{doc.issueDate}</TableCell>
                      <TableCell>{doc.expiryDate}</TableCell>
                      <TableCell>{doc.issuingAuthority}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{doc.notes}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shipment Compliance</CardTitle>
                  <CardDescription>Track cross-border shipment compliance status</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search shipments..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {shipmentCompliance.map((shipment) => (
                  <AccordionItem key={shipment.id} value={shipment.id}>
                    <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Badge variant={shipment.type === 'Export' ? 'outline' : 'secondary'} className="mr-2">
                            {shipment.type}
                          </Badge>
                          <span className="font-medium">{shipment.shipmentNumber}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{shipment.origin} → {shipment.destination}</span>
                          </div>
                          <div>
                            {getStatusBadge(shipment.documentStatus)}
                          </div>
                          <div>
                            {getStatusBadge(shipment.customsClearance)}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Shipment Details</h4>
                            <div className="space-y-1">
                              <div className="grid grid-cols-3 text-sm">
                                <span className="text-muted-foreground">Shipment ID:</span>
                                <span className="col-span-2">{shipment.id}</span>
                              </div>
                              <div className="grid grid-cols-3 text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="col-span-2">{shipment.type}</span>
                              </div>
                              <div className="grid grid-cols-3 text-sm">
                                <span className="text-muted-foreground">Origin:</span>
                                <span className="col-span-2">{shipment.origin}</span>
                              </div>
                              <div className="grid grid-cols-3 text-sm">
                                <span className="text-muted-foreground">Destination:</span>
                                <span className="col-span-2">{shipment.destination}</span>
                              </div>
                              <div className="grid grid-cols-3 text-sm">
                                <span className="text-muted-foreground">Departure Date:</span>
                                <span className="col-span-2">{shipment.departureDate}</span>
                              </div>
                              <div className="grid grid-cols-3 text-sm">
                                <span className="text-muted-foreground">Notes:</span>
                                <span className="col-span-2">{shipment.notes}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Compliance Status</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Document Status:</span>
                                {getStatusBadge(shipment.documentStatus)}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Customs Clearance:</span>
                                {getStatusBadge(shipment.customsClearance)}
                              </div>
                              <div className="mt-4">
                                <h5 className="text-xs font-medium mb-1">Required Documents</h5>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Commercial Invoice</span>
                                    <FileCheck className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Packing List</span>
                                    <FileCheck className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Certificate of Origin</span>
                                    <FileCheck className="h-4 w-4 text-green-500" />
                                  </div>
                                  {shipment.documentStatus === 'Incomplete' && (
                                    <div className="flex justify-between text-sm">
                                      <span>{shipment.type === 'Import' ? 'Import License' : 'Export License'}</span>
                                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Shipment Items</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>HS Code</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {shipment.items.map((item, index) => {
                                // Find the item in the compliance items
                                const complianceItem = complianceItems.find(ci => ci.materialCode === item.code);
                                
                                return (
                                  <TableRow key={`${shipment.id}-item-${index}`}>
                                    <TableCell className="font-medium">{item.code}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{complianceItem?.harmonizedCode || 'N/A'}</TableCell>
                                    <TableCell>
                                      {complianceItem ? getStatusBadge(complianceItem.complianceStatus) : 'N/A'}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Document Dialog */}
      <Dialog open={addDocumentOpen} onOpenChange={setAddDocumentOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Trade Document</DialogTitle>
            <DialogDescription>
              Upload or register a new trade compliance document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc-type" className="text-right">
                Document Type
              </Label>
              <Select>
                <SelectTrigger id="doc-type" className="col-span-3">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coo">Certificate of Origin</SelectItem>
                  <SelectItem value="import">Import License</SelectItem>
                  <SelectItem value="export">Export License</SelectItem>
                  <SelectItem value="reach">REACH Compliance</SelectItem>
                  <SelectItem value="rohs">RoHS Compliance</SelectItem>
                  <SelectItem value="hazmat">Hazardous Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="related-item" className="text-right">
                Related Item
              </Label>
              <Select>
                <SelectTrigger id="related-item" className="col-span-3">
                  <SelectValue placeholder="Select related item" />
                </SelectTrigger>
                <SelectContent>
                  {complianceItems.map(item => (
                    <SelectItem key={item.id} value={item.materialCode}>
                      {item.materialCode}: {item.materialName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issue-date" className="text-right">
                Issue Date
              </Label>
              <Input id="issue-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry-date" className="text-right">
                Expiry Date
              </Label>
              <Input id="expiry-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="authority" className="text-right">
                Issuing Authority
              </Label>
              <Input id="authority" className="col-span-3" placeholder="e.g. US Chamber of Commerce" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document-notes" className="text-right">
                Notes
              </Label>
              <Textarea id="document-notes" className="col-span-3" placeholder="Additional information about the document" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document-file" className="text-right">
                Upload File
              </Label>
              <Input id="document-file" type="file" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDocumentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setAddDocumentOpen(false)}>
              <Globe className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}