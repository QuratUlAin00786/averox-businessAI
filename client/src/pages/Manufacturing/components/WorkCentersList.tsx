import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pencil, Plus, Trash, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define the schema for work center data
const workCenterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  status: z.string().min(1, "Status is required"),
  warehouse_id: z.coerce.number().positive("Warehouse is required"),
  capacity: z.coerce.number().positive("Capacity must be positive"),
  description: z.string().optional(),
});

type WorkCenterFormValues = z.infer<typeof workCenterSchema>;

type WorkCenter = {
  id: number;
  name: string;
  type: string;
  status: string;
  warehouse_id: number;
  warehouse_name?: string;
  capacity: number;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  is_active: boolean;
};

type Warehouse = {
  id: number;
  name: string;
};

export default function WorkCentersList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWorkCenter, setEditingWorkCenter] = useState<WorkCenter | null>(null);
  const [deleteWorkCenterId, setDeleteWorkCenterId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch work centers data
  const { data: workCenters, isLoading, error } = useQuery<WorkCenter[]>({
    queryKey: ['/api/manufacturing/work-centers'],
  });

  // Fetch warehouses for the dropdown
  const { data: warehouses } = useQuery<Warehouse[]>({
    queryKey: ['/api/manufacturing/warehouses'],
  });

  // Create form
  const form = useForm<WorkCenterFormValues>({
    resolver: zodResolver(workCenterSchema),
    defaultValues: {
      name: "",
      type: "",
      status: "Active",
      warehouse_id: 0,
      capacity: 0,
      description: "",
    },
  });

  // Create work center mutation
  const createWorkCenterMutation = useMutation({
    mutationFn: (newWorkCenter: WorkCenterFormValues) => {
      return apiRequest('/api/manufacturing/work-centers', {
        method: 'POST',
        data: newWorkCenter,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/work-centers'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Work center created",
        description: "The work center has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating work center",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Update work center mutation
  const updateWorkCenterMutation = useMutation({
    mutationFn: (updatedWorkCenter: WorkCenterFormValues & { id: number }) => {
      const { id, ...data } = updatedWorkCenter;
      return apiRequest(`/api/manufacturing/work-centers/${id}`, {
        method: 'PUT',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/work-centers'] });
      setEditingWorkCenter(null);
      form.reset();
      toast({
        title: "Work center updated",
        description: "The work center has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating work center",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Delete work center mutation
  const deleteWorkCenterMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/manufacturing/work-centers/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/work-centers'] });
      setDeleteWorkCenterId(null);
      toast({
        title: "Work center deleted",
        description: "The work center has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting work center",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const onSubmit = (values: WorkCenterFormValues) => {
    if (editingWorkCenter) {
      updateWorkCenterMutation.mutate({ ...values, id: editingWorkCenter.id });
    } else {
      createWorkCenterMutation.mutate(values);
    }
  };

  const handleEditWorkCenter = (workCenter: WorkCenter) => {
    setEditingWorkCenter(workCenter);
    form.reset({
      name: workCenter.name,
      type: workCenter.type,
      status: workCenter.status,
      warehouse_id: workCenter.warehouse_id,
      capacity: workCenter.capacity,
      description: workCenter.description || undefined,
    });
  };

  const handleCancelEdit = () => {
    setEditingWorkCenter(null);
    form.reset();
  };

  // Get warehouse name by ID
  const getWarehouseName = (warehouseId: number) => {
    if (!warehouses) return "Unknown";
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Work Centers</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Work Center
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Work Center</DialogTitle>
              <DialogDescription>
                Fill in the details for the new work center
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Work center name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Assembly">Assembly</SelectItem>
                            <SelectItem value="Fabrication">Fabrication</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Packaging">Packaging</SelectItem>
                            <SelectItem value="Testing">Testing</SelectItem>
                            <SelectItem value="Quality Control">Quality Control</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Setup">Setup</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="warehouse_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value ? field.value.toString() : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {warehouses?.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (units/day)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Capacity" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Work center description (optional)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createWorkCenterMutation.isPending}
                  >
                    {createWorkCenterMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading work centers...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load work centers. Please try again.
          </AlertDescription>
        </Alert>
      ) : workCenters && workCenters.length > 0 ? (
        <Table>
          <TableCaption>List of all work centers in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Capacity (units/day)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workCenters.map((workCenter) => (
              <TableRow key={workCenter.id}>
                <TableCell className="font-medium">{workCenter.name}</TableCell>
                <TableCell>{workCenter.type}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                    ${workCenter.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : workCenter.status === 'Maintenance' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : workCenter.status === 'Inactive' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'}`}>
                    {workCenter.status}
                  </span>
                </TableCell>
                <TableCell>
                  {workCenter.warehouse_name || getWarehouseName(workCenter.warehouse_id)}
                </TableCell>
                <TableCell>{workCenter.capacity}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditWorkCenter(workCenter)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500"
                      onClick={() => setDeleteWorkCenterId(workCenter.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-4">No work centers found</p>
          <p className="text-sm text-muted-foreground">
            Create your first work center to start managing production.
          </p>
        </div>
      )}

      {/* Edit Work Center Dialog */}
      {editingWorkCenter && (
        <Dialog open={!!editingWorkCenter} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Work Center</DialogTitle>
              <DialogDescription>
                Update the work center details
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Work center name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Assembly">Assembly</SelectItem>
                            <SelectItem value="Fabrication">Fabrication</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Packaging">Packaging</SelectItem>
                            <SelectItem value="Testing">Testing</SelectItem>
                            <SelectItem value="Quality Control">Quality Control</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Setup">Setup</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="warehouse_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value ? field.value.toString() : undefined}
                          value={field.value ? field.value.toString() : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {warehouses?.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (units/day)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Capacity" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Work center description (optional)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateWorkCenterMutation.isPending}
                  >
                    {updateWorkCenterMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteWorkCenterId && (
        <Dialog
          open={!!deleteWorkCenterId}
          onOpenChange={(open) => !open && setDeleteWorkCenterId(null)}
        >
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Delete Work Center</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this work center? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteWorkCenterId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteWorkCenterMutation.isPending}
                onClick={() => deleteWorkCenterId && deleteWorkCenterMutation.mutate(deleteWorkCenterId)}
              >
                {deleteWorkCenterMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}