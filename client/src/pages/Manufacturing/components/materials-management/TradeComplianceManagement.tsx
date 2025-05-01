import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  Check,
  ClipboardList,
  FileText,
  Globe,
  Plus,
  RefreshCw, 
  Search, 
  Shield
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/formatters';

interface ComplianceDocument {
  id: number;
  documentType: string;
  documentNumber: string;
  country: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  attachmentUrl: string;
  notes: string;
  product?: {
    id: number;
    name: string;
    code: string;
  };
  vendor?: {
    id: number;
    name: string;
    code: string;
  };
}

export default function TradeComplianceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Simulate fetching compliance data from API
  const { data: complianceDocuments = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/manufacturing/trade-compliance'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/manufacturing/trade-compliance');
        return await res.json() as ComplianceDocument[];
      } catch (error) {
        console.error('Failed to fetch compliance documents:', error);
        return [];
      }
    }
  });

  // Filter documents based on tab and search term
  const filteredDocuments = complianceDocuments.filter(doc => {
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'valid' && doc.status === 'Valid') ||
      (activeTab === 'expiring' && doc.status === 'Expiring Soon') ||
      (activeTab === 'expired' && doc.status === 'Expired');
      
    const matchesSearch = 
      searchTerm === '' || 
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (doc.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
    return matchesTab && matchesSearch;
  });
  
  // Calculate summary statistics
  const validCount = complianceDocuments.filter(d => d.status === 'Valid').length;
  const expiringCount = complianceDocuments.filter(d => d.status === 'Expiring Soon').length;
  const expiredCount = complianceDocuments.filter(d => d.status === 'Expired').length;
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid': return 'bg-green-100 text-green-800';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Global Trade Compliance</CardTitle>
              <CardDescription>Manage international trade compliance documentation and regulations</CardDescription>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valid Documents</p>
                    <p className="text-3xl font-bold">{validCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Check className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                    <p className="text-3xl font-bold">{expiringCount}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expired Documents</p>
                    <p className="text-3xl font-bold">{expiredCount}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Shield className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="valid">Valid</TabsTrigger>
                <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Document #</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading compliance documents...
                  </TableCell>
                </TableRow>
              ) : filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No compliance documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{doc.documentType}</TableCell>
                    <TableCell>{doc.documentNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        {doc.country}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(doc.issueDate)}</TableCell>
                    <TableCell>{formatDate(doc.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.product ? (
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-xs">{doc.product.name}</span>
                        </div>
                      ) : doc.vendor ? (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-xs">{doc.vendor.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}