import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { SubscriptionPackage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// Package form type
type PackageFormData = {
  name: string;
  description: string;
  price: string;
  interval: string;
  maxUsers: number;
  maxContacts: number;
  maxStorage: number;
  stripePriceId: string;
  features: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminSubscriptionPackagesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<SubscriptionPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    price: '',
    interval: 'monthly',
    maxUsers: 1,
    maxContacts: 500,
    maxStorage: 5,
    stripePriceId: '',
    features: '',
    isActive: true,
    displayOrder: 1
  });
  
  // Load packages
  const { data: packages, isLoading } = useQuery({
    queryKey: ['/api/subscription-packages'],
    select: (data: SubscriptionPackage[]) => 
      // Sort by display order
      [...data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const featuresArray = data.features.split('\n').map(f => f.trim()).filter(Boolean);
      
      const response = await apiRequest('POST', '/api/subscription-packages', {
        ...data,
        features: featuresArray
      });
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-packages'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Package created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: PackageFormData & { id: number }) => {
      const featuresArray = data.features.split('\n').map(f => f.trim()).filter(Boolean);
      
      const response = await apiRequest('PATCH', `/api/subscription-packages/${data.id}`, {
        ...data,
        features: featuresArray
      });
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-packages'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/subscription-packages/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-packages'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };
  
  const handleSubmit = () => {
    if (currentPackage?.id) {
      updateMutation.mutate({ ...formData, id: currentPackage.id });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const openEditDialog = (pkg: SubscriptionPackage) => {
    setCurrentPackage(pkg);
    
    // Convert features array to string with line breaks
    const features = Array.isArray(pkg.features) 
      ? pkg.features.join('\n') 
      : typeof pkg.features === 'string'
        ? pkg.features
        : '';
        
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      interval: pkg.interval,
      maxUsers: pkg.maxUsers,
      maxContacts: pkg.maxContacts,
      maxStorage: pkg.maxStorage,
      stripePriceId: pkg.stripePriceId || '',
      features: features,
      isActive: pkg.isActive === true,
      displayOrder: pkg.displayOrder || 1
    });
    
    setIsDialogOpen(true);
  };
  
  const openCreateDialog = () => {
    setCurrentPackage(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      interval: 'monthly',
      maxUsers: 1,
      maxContacts: 500,
      maxStorage: 5,
      stripePriceId: '',
      features: '',
      isActive: true,
      displayOrder: packages ? packages.length + 1 : 1
    });
    setIsDialogOpen(true);
  };
  
  const confirmDelete = (pkg: SubscriptionPackage) => {
    setCurrentPackage(pkg);
    setIsDeleteDialogOpen(true);
  };
  
  // Check if user is admin
  if (user?.role !== 'Admin') {
    return (
      <div className="container max-w-6xl py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground">
          You need administrator privileges to access this page.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Packages Management</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center my-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          packages?.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(pkg)}
                      className="h-8 px-2"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="ml-2">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => confirmDelete(pkg)}
                      className="h-8 px-2 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <div className="font-medium">${pkg.price} / {pkg.interval}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="font-medium flex items-center">
                      {pkg.isActive 
                        ? <><Check className="w-4 h-4 mr-1 text-green-500" /> Active</>
                        : <><X className="w-4 h-4 mr-1 text-red-500" /> Inactive</>
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Limits:</span>
                    <div className="font-medium">{pkg.maxUsers} users, {pkg.maxContacts.toLocaleString()} contacts, {pkg.maxStorage}GB storage</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Display Order:</span>
                    <div className="font-medium">{pkg.displayOrder}</div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Features:</span>
                  <ul className="list-disc list-inside font-medium mt-1">
                    {Array.isArray(pkg.features) 
                      ? pkg.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))
                      : typeof pkg.features === 'string' && pkg.features.length > 0
                        ? <li>{pkg.features}</li>
                        : <li className="text-muted-foreground">No features listed</li>
                    }
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentPackage ? 'Edit Package' : 'Create New Package'}</DialogTitle>
            <DialogDescription>
              {currentPackage 
                ? 'Update the subscription package details below' 
                : 'Fill in the details for the new subscription package'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Package Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="e.g. Basic Plan"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Brief description of the package"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="e.g. 19.99"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interval">Billing Interval</Label>
              <Input 
                id="interval" 
                name="interval" 
                value={formData.interval} 
                onChange={handleInputChange} 
                placeholder="e.g. monthly, yearly"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input 
                id="maxUsers" 
                name="maxUsers" 
                type="number" 
                value={formData.maxUsers} 
                onChange={handleNumberChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxContacts">Max Contacts</Label>
              <Input 
                id="maxContacts" 
                name="maxContacts" 
                type="number" 
                value={formData.maxContacts} 
                onChange={handleNumberChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxStorage">Max Storage (GB)</Label>
              <Input 
                id="maxStorage" 
                name="maxStorage" 
                type="number" 
                value={formData.maxStorage} 
                onChange={handleNumberChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input 
                id="displayOrder" 
                name="displayOrder" 
                type="number" 
                value={formData.displayOrder} 
                onChange={handleNumberChange} 
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="stripePriceId">Stripe Price ID</Label>
              <Input 
                id="stripePriceId" 
                name="stripePriceId" 
                value={formData.stripePriceId} 
                onChange={handleInputChange} 
                placeholder="e.g. price_1234567890"
              />
              <p className="text-xs text-muted-foreground">
                The price ID from your Stripe dashboard for this subscription plan
              </p>
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea 
                id="features" 
                name="features" 
                value={formData.features} 
                onChange={handleInputChange} 
                placeholder="Enter features, one per line"
                rows={5}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentPackage ? 'Update Package' : 'Create Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentPackage?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => currentPackage?.id && deleteMutation.mutate(currentPackage.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}