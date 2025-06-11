import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Building,
  ChevronRight, 
  ExternalLink,
  Phone,
  Plus,
  RefreshCw, 
  Search, 
  Star, 
  Mail
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/formatters';

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  code: z.string().min(1, 'Vendor code is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  taxId: z.string().optional(),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  deliveryTerms: z.string().min(1, 'Delivery terms are required'),
  website: z.string().optional(),
  qualityRating: z.number().min(0).max(5).default(0),
  deliveryRating: z.number().min(0).max(5).default(0),
  priceRating: z.number().min(0).max(5).default(0),
  isActive: z.boolean().default(true),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface Vendor {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  status: string;
  paymentTerms: string;
  deliveryTerms: string;
  website: string;
  qualityRating: number;
  deliveryRating: number;
  priceRating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      code: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentTerms: 'Net 30',
      deliveryTerms: 'FOB',
      website: '',
      qualityRating: 0,
      deliveryRating: 0,
      priceRating: 0,
      isActive: true,
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      const response = await apiRequest('POST', '/api/manufacturing/vendors', data);
      if (!response.ok) {
        throw new Error('Failed to create vendor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/vendors'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create vendor",
        variant: "destructive",
      });
    },
  });
  
  // Fetch vendors from API
  const { data: rawVendorData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['/api/manufacturing/vendors'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/manufacturing/vendors');
        return await res.json();
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
        return { rows: [] };
      }
    }
  });

  // Extract vendors from the API response
  const vendors: Vendor[] = Array.isArray(rawVendorData) ? rawVendorData : (rawVendorData?.rows || []);
  
  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor => 
    searchTerm === '' || 
    (vendor.name && vendor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vendor.code && vendor.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Summary stats
  const activeVendors = vendors.filter(v => v.isActive).length;
  const inactiveVendors = vendors.length - activeVendors;
  
  // Calculate average ratings with safe type conversion
  const avgQualityRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + (parseFloat(v.qualityRating as any) || 0), 0) / vendors.length
    : 0;
    
  const avgDeliveryRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + (parseFloat(v.deliveryRating as any) || 0), 0) / vendors.length
    : 0;
    
  const avgPriceRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + (parseInt(v.priceRating as any) || 0), 0) / vendors.length
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendor Management</CardTitle>
              <CardDescription>Manage suppliers and track vendor performance</CardDescription>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Vendor</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createVendorMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter vendor name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter vendor code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactPerson"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter contact person" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="Enter email address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter phone number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter website URL" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter full address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="paymentTerms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Terms</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Net 30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="deliveryTerms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Terms</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., FOB" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter tax identification number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createVendorMutation.isPending}>
                          {createVendorMutation.isPending ? 'Creating...' : 'Create Vendor'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Active Vendors</h3>
                    <p className="text-3xl font-bold">{activeVendors}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {inactiveVendors} inactive
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Building className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Average Quality Rating</h3>
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-2" />
                  <p className="text-2xl font-bold">{avgQualityRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground ml-2">/ 5.0</p>
                </div>
                <Progress value={avgQualityRating * 20} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Average Delivery Rating</h3>
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-2" />
                  <p className="text-2xl font-bold">{avgDeliveryRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground ml-2">/ 5.0</p>
                </div>
                <Progress value={avgDeliveryRating * 20} className="h-2" />
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between mb-6">
            <div className="relative w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search vendors by name, code or contact..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Export</Button>
              <Button variant="outline" size="sm">Import</Button>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading vendors...
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{vendor.code}</TableCell>
                    <TableCell>
                      {vendor.name}
                      {vendor.website && (
                        <a 
                          href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center ml-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-3 w-3 inline ml-1" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{vendor.contactPerson}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {vendor.email && (
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={vendor.isActive ? "default" : "secondary"}
                        className={vendor.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-800"}
                      >
                        {vendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>Payment: {vendor.paymentTerms}</div>
                        <div>Delivery: {vendor.deliveryTerms}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">{parseFloat(vendor.qualityRating as any || 0).toFixed(1)}</span>
                        <Star className={`h-4 w-4 ${parseFloat(vendor.qualityRating as any || 0) >= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">{parseFloat(vendor.deliveryRating as any || 0).toFixed(1)}</span>
                        <Star className={`h-4 w-4 ${parseFloat(vendor.deliveryRating as any || 0) >= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
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