import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, ArrowLeftRight, ChevronDown, ClipboardList, Download, FileText, PlusCircle, Printer, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function ReturnsManagement() {
  const [activeTab, setActiveTab] = useState('returns');
  const [addReturnOpen, setAddReturnOpen] = useState(false);
  
  // Sample data for demonstration
  const returnsList = [
    {
      id: 'RET-2025-0032',
      type: 'Customer Return',
      customer: 'Acme Industries',
      orderReference: 'SO-20250115',
      returnDate: '2025-04-10',
      status: 'In Process',
      reason: 'Product Defect',
      items: 2,
      totalValue: '$5,250.00',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 'RET-2025-0031',
      type: 'Customer Return',
      customer: 'Global Manufacturing Ltd.',
      orderReference: 'SO-20250098',
      returnDate: '2025-04-05',
      status: 'Inspection',
      reason: 'Wrong Item',
      items: 1,
      totalValue: '$1,850.00',
      assignedTo: 'David Lee'
    },
    {
      id: 'RET-2025-0030',
      type: 'Vendor Return',
      customer: 'Superior Raw Materials Inc.',
      orderReference: 'PO-20250220',
      returnDate: '2025-04-02',
      status: 'Approved',
      reason: 'Quality Issue',
      items: 3,
      totalValue: '$12,500.00',
      assignedTo: 'John Smith'
    },
    {
      id: 'RET-2025-0029',
      type: 'Vendor Return',
      customer: 'ChemSupply Systems',
      orderReference: 'PO-20250198',
      returnDate: '2025-03-28',
      status: 'Completed',
      reason: 'Quality Issue',
      items: 1,
      totalValue: '$4,350.00',
      assignedTo: 'John Smith'
    },
    {
      id: 'RET-2025-0028',
      type: 'Customer Return',
      customer: 'TechSolutions Inc.',
      orderReference: 'SO-20250072',
      returnDate: '2025-03-25',
      status: 'Completed',
      reason: 'Customer Dissatisfaction',
      items: 2,
      totalValue: '$3,200.00',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 'RET-2025-0027',
      type: 'Internal Return',
      customer: 'Production Department',
      orderReference: 'WO-20250145',
      returnDate: '2025-03-20',
      status: 'Completed',
      reason: 'Excess Material',
      items: 4,
      totalValue: '$1,580.00',
      assignedTo: 'Michael Chen'
    }
  ];
  
  const returnItems = [
    {
      returnId: 'RET-2025-0032',
      itemId: 'ITEM-0032-001',
      itemCode: 'FG-5001',
      description: 'Industrial Control Panel',
      quantity: 1,
      unitPrice: '$4,250.00',
      subtotal: '$4,250.00',
      condition: 'Defective',
      disposition: 'Repair',
      location: 'QA Lab'
    },
    {
      returnId: 'RET-2025-0032',
      itemId: 'ITEM-0032-002',
      itemCode: 'FG-3022',
      description: 'Sensor Module',
      quantity: 1,
      unitPrice: '$1,000.00',
      subtotal: '$1,000.00',
      condition: 'Defective',
      disposition: 'Replace',
      location: 'Returns Warehouse'
    },
    {
      returnId: 'RET-2025-0031',
      itemId: 'ITEM-0031-001',
      itemCode: 'FG-4025',
      description: 'Electrical Actuator',
      quantity: 1,
      unitPrice: '$1,850.00',
      subtotal: '$1,850.00',
      condition: 'Good',
      disposition: 'Restock',
      location: 'Inspection Area'
    },
    {
      returnId: 'RET-2025-0030',
      itemId: 'ITEM-0030-001',
      itemCode: 'RM-102',
      description: 'Aluminum Sheets',
      quantity: 500,
      unitPrice: '$21.50',
      subtotal: '$10,750.00',
      condition: 'Unacceptable',
      disposition: 'Return to Vendor',
      location: 'Returns Warehouse'
    },
    {
      returnId: 'RET-2025-0030',
      itemId: 'ITEM-0030-002',
      itemCode: 'RM-156',
      description: 'Steel Rods',
      quantity: 50,
      unitPrice: '$18.75',
      subtotal: '$937.50',
      condition: 'Unacceptable',
      disposition: 'Return to Vendor',
      location: 'Returns Warehouse'
    },
    {
      returnId: 'RET-2025-0030',
      itemId: 'ITEM-0030-003',
      itemCode: 'PKG-3001',
      description: 'Packaging Materials',
      quantity: 650,
      unitPrice: '$1.25',
      subtotal: '$812.50',
      condition: 'Unacceptable',
      disposition: 'Return to Vendor',
      location: 'Returns Warehouse'
    }
  ];
  
  const qaWorkflow = [
    {
      id: 'QA-2025-0042',
      returnId: 'RET-2025-0032',
      item: 'Industrial Control Panel (FG-5001)',
      initiatedDate: '2025-04-10',
      status: 'In Process',
      inspector: 'Jessica Williams',
      tests: [
        { name: 'Visual Inspection', status: 'Completed', result: 'Failed' },
        { name: 'Electrical Test', status: 'In Progress', result: 'Pending' },
        { name: 'Functional Test', status: 'Scheduled', result: 'Pending' }
      ],
      disposition: 'Pending',
      notes: 'Identifying component that failed in the control panel'
    },
    {
      id: 'QA-2025-0041',
      returnId: 'RET-2025-0032',
      item: 'Sensor Module (FG-3022)',
      initiatedDate: '2025-04-10',
      status: 'In Process',
      inspector: 'Jessica Williams',
      tests: [
        { name: 'Visual Inspection', status: 'Completed', result: 'Passed' },
        { name: 'Calibration Test', status: 'Completed', result: 'Failed' },
        { name: 'Response Time Test', status: 'Scheduled', result: 'Pending' }
      ],
      disposition: 'Pending',
      notes: 'Sensor module failed calibration tests'
    },
    {
      id: 'QA-2025-0040',
      returnId: 'RET-2025-0031',
      item: 'Electrical Actuator (FG-4025)',
      initiatedDate: '2025-04-05',
      status: 'Inspection',
      inspector: 'Robert Johnson',
      tests: [
        { name: 'Visual Inspection', status: 'Completed', result: 'Passed' },
        { name: 'Dimensional Check', status: 'Completed', result: 'Passed' },
        { name: 'Operational Test', status: 'In Progress', result: 'Pending' }
      ],
      disposition: 'Pending',
      notes: 'Initial inspection indicates product is in good condition'
    },
    {
      id: 'QA-2025-0039',
      returnId: 'RET-2025-0030',
      item: 'Aluminum Sheets (RM-102)',
      initiatedDate: '2025-04-02',
      status: 'Completed',
      inspector: 'Mark Thompson',
      tests: [
        { name: 'Visual Inspection', status: 'Completed', result: 'Failed' },
        { name: 'Dimensional Check', status: 'Completed', result: 'Failed' },
        { name: 'Material Analysis', status: 'Completed', result: 'Failed' }
      ],
      disposition: 'Return to Vendor',
      notes: 'Material does not meet quality specifications, shows signs of oxidation'
    }
  ];
  
  // Render status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'In Process':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Process</Badge>;
      case 'Inspection':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Inspection</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Completed</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Pending</Badge>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'Passed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Passed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Render type badge
  const getTypeBadge = (type) => {
    switch(type) {
      case 'Customer Return':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">Customer Return</Badge>;
      case 'Vendor Return':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Vendor Return</Badge>;
      case 'Internal Return':
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">Internal Return</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  // Filter return items by return ID
  const getItemsForReturn = (returnId) => {
    return returnItems.filter(item => item.returnId === returnId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Returns Management</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button size="sm" onClick={() => setAddReturnOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Return
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>SAP-level Returns Management</AlertTitle>
        <AlertDescription>
          Averox provides comprehensive returns management capabilities for customer returns, vendor returns,
          and internal material returns. The system includes quality inspection workflows, disposition management,
          and full integration with inventory and financial systems.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="returns">Return Orders</TabsTrigger>
          <TabsTrigger value="items">Return Items</TabsTrigger>
          <TabsTrigger value="qa">QA Workflow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Return Orders</CardTitle>
                  <CardDescription>Manage returns from customers, vendors, and internal departments</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search returns..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="customer">Customer Returns</SelectItem>
                      <SelectItem value="vendor">Vendor Returns</SelectItem>
                      <SelectItem value="internal">Internal Returns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer/Vendor</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsList.map((returnOrder) => (
                    <TableRow key={returnOrder.id}>
                      <TableCell className="font-medium">{returnOrder.id}</TableCell>
                      <TableCell>{getTypeBadge(returnOrder.type)}</TableCell>
                      <TableCell>{returnOrder.customer}</TableCell>
                      <TableCell>{returnOrder.orderReference}</TableCell>
                      <TableCell>{returnOrder.returnDate}</TableCell>
                      <TableCell>{getStatusBadge(returnOrder.status)}</TableCell>
                      <TableCell>{returnOrder.reason}</TableCell>
                      <TableCell>{returnOrder.items}</TableCell>
                      <TableCell>{returnOrder.totalValue}</TableCell>
                      <TableCell>{returnOrder.assignedTo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Return Items</CardTitle>
                  <CardDescription>Detailed list of items included in returns</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search items..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by return" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Returns</SelectItem>
                      {returnsList.map(returnOrder => (
                        <SelectItem key={returnOrder.id} value={returnOrder.id}>{returnOrder.id}</SelectItem>
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
                    <TableHead>Return ID</TableHead>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Disposition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnItems.map((item) => (
                    <TableRow key={item.itemId}>
                      <TableCell>{item.returnId}</TableCell>
                      <TableCell className="font-medium">{item.itemCode}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitPrice}</TableCell>
                      <TableCell>{item.subtotal}</TableCell>
                      <TableCell>
                        <Badge variant={item.condition === 'Good' ? 'outline' : (item.condition === 'Defective' ? 'secondary' : 'destructive')}>
                          {item.condition}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.disposition}</TableCell>
                      <TableCell>{item.location}</TableCell>
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
        
        <TabsContent value="qa" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quality Inspection Workflow</CardTitle>
                  <CardDescription>Track quality inspection processes for returned items</CardDescription>
                </div>
                <div className="flex">
                  <div className="relative mr-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search QA processes..."
                      className="w-[200px] pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-process">In Process</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QA ID</TableHead>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Initiated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Disposition</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qaWorkflow.map((qa) => (
                    <TableRow key={qa.id}>
                      <TableCell className="font-medium">{qa.id}</TableCell>
                      <TableCell>{qa.returnId}</TableCell>
                      <TableCell>{qa.item}</TableCell>
                      <TableCell>{qa.initiatedDate}</TableCell>
                      <TableCell>{getStatusBadge(qa.status)}</TableCell>
                      <TableCell>{qa.inspector}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {qa.tests.map((test, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span>{test.name}:</span>
                              <span className={
                                test.result === 'Passed' ? 'text-green-600' : 
                                test.result === 'Failed' ? 'text-red-600' : 'text-yellow-600'
                              }>
                                {test.result}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{qa.disposition}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{qa.notes}</TableCell>
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
      </Tabs>
      
      {/* Add Return Dialog */}
      <Dialog open={addReturnOpen} onOpenChange={setAddReturnOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Return</DialogTitle>
            <DialogDescription>
              Enter return details to process a new return order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Return Type</Label>
              <RadioGroup defaultValue="customer" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customer" id="customer" />
                  <Label htmlFor="customer">Customer Return</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vendor" id="vendor" />
                  <Label htmlFor="vendor">Vendor Return</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <Label htmlFor="internal">Internal Return</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer/Vendor</Label>
                <Select>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer/vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acme">Acme Industries</SelectItem>
                    <SelectItem value="global">Global Manufacturing Ltd.</SelectItem>
                    <SelectItem value="tech">TechSolutions Inc.</SelectItem>
                    <SelectItem value="superior">Superior Raw Materials Inc.</SelectItem>
                    <SelectItem value="chemsupply">ChemSupply Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reference">Order Reference</Label>
                <Input id="reference" placeholder="e.g. SO-20250115" />
              </div>
              <div>
                <Label htmlFor="return-date">Return Date</Label>
                <Input id="return-date" type="date" />
              </div>
              <div>
                <Label htmlFor="reason">Return Reason</Label>
                <Select>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defect">Product Defect</SelectItem>
                    <SelectItem value="wrong">Wrong Item</SelectItem>
                    <SelectItem value="quality">Quality Issue</SelectItem>
                    <SelectItem value="dissatisfaction">Customer Dissatisfaction</SelectItem>
                    <SelectItem value="excess">Excess Material</SelectItem>
                    <SelectItem value="damaged">Damaged in Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Enter additional details about the return" />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Items to Return</h4>
              <div className="border rounded-md p-3 space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor="item-code">Item Code/Description</Label>
                    <Select>
                      <SelectTrigger id="item-code">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fg-5001">FG-5001: Industrial Control Panel</SelectItem>
                        <SelectItem value="fg-3022">FG-3022: Sensor Module</SelectItem>
                        <SelectItem value="fg-4025">FG-4025: Electrical Actuator</SelectItem>
                        <SelectItem value="rm-102">RM-102: Aluminum Sheets</SelectItem>
                        <SelectItem value="rm-156">RM-156: Steel Rods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" min="1" placeholder="1" />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select>
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="defective">Defective</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="unacceptable">Unacceptable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="item-notes">Item Notes</Label>
                    <Input id="item-notes" placeholder="Details about condition" />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Another Item
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Processing Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="qa-required" />
                  <Label htmlFor="qa-required">Require QA Inspection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="refund" />
                  <Label htmlFor="refund">Process Refund/Credit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="restock" />
                  <Label htmlFor="restock">Return to Inventory</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddReturnOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setAddReturnOpen(false)}>
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Create Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}