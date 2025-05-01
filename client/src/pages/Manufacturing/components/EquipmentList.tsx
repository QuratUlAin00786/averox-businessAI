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
import { Pencil, Plus, Trash, AlertCircle, Settings, Wrench } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Define the schema for equipment data
const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  model: z.string().min(1, "Model is required"),
  serial_number: z.string().min(1, "Serial number is required"),
  status: z.string().min(1, "Status is required"),
  work_center_id: z.coerce.number().positive("Work center is required"),
  acquisition_date: z.date({
    required_error: "Acquisition date is required",
  }),
  purchase_cost: z.coerce.number().min(0, "Cost must be non-negative"),
  warranty_expiry: z.date().optional(),
  maintenance_interval: z.coerce.number().min(0, "Maintenance interval must be non-negative"),
  last_maintenance_date: z.date().optional(),
  next_maintenance_date: z.date().optional(),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

type Equipment = {
  id: number;
  name: string;
  type: string;
  model: string;
  serial_number: string;
  status: string;
  work_center_id: number;
  work_center_name?: string;
  acquisition_date: string;
  purchase_cost: number;
  warranty_expiry: string | null;
  maintenance_interval: number;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  description: string | null;
  manufacturer: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number;
};

type WorkCenter = {
  id: number;
  name: string;
  type: string;
};

type MaintenanceRequest = {
  id: number;
  equipment_id: number;
  request_date: string;
  type: string;
  status: string;
  description: string;
  requested_by: number;
  assigned_to: number | null;
  scheduled_date: string | null;
  completion_date: string | null;
  notes: string | null;
};

export default function EquipmentList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<number | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch equipment data
  const { data: equipment, isLoading, error } = useQuery<Equipment[]>({
    queryKey: ['/api/manufacturing/equipment'],
  });

  // Fetch equipment details when an equipment is selected
  const { 
    data: equipmentDetails, 
    isLoading: isLoadingDetails 
  } = useQuery<{
    equipment: Equipment;
    maintenanceRequests: MaintenanceRequest[];
  }>({
    queryKey: ['/api/manufacturing/equipment', selectedEquipmentId],
    enabled: !!selectedEquipmentId,
    queryFn: () => 
      apiRequest(`/api/manufacturing/equipment/${selectedEquipmentId}`),
  });

  // Fetch work centers for the dropdown
  const { data: workCenters } = useQuery<WorkCenter[]>({
    queryKey: ['/api/manufacturing/work-centers'],
  });

  // Create form
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      type: "",
      model: "",
      serial_number: "",
      status: "Operational",
      work_center_id: 0,
      acquisition_date: new Date(),
      purchase_cost: 0,
      maintenance_interval: 90, // Default to 90 days
      description: "",
      manufacturer: "",
    },
  });

  // Create equipment mutation
  const createEquipmentMutation = useMutation({
    mutationFn: (newEquipment: EquipmentFormValues) => {
      // Convert dates to ISO strings
      const equipmentData = {
        ...newEquipment,
        acquisition_date: newEquipment.acquisition_date.toISOString(),
        warranty_expiry: newEquipment.warranty_expiry ? newEquipment.warranty_expiry.toISOString() : null,
        last_maintenance_date: newEquipment.last_maintenance_date ? newEquipment.last_maintenance_date.toISOString() : null,
        next_maintenance_date: newEquipment.next_maintenance_date ? newEquipment.next_maintenance_date.toISOString() : null,
      };
      
      return apiRequest('/api/manufacturing/equipment', {
        method: 'POST',
        data: equipmentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/equipment'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Equipment created",
        description: "The equipment has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating equipment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: (updatedEquipment: EquipmentFormValues & { id: number }) => {
      const { id, ...data } = updatedEquipment;
      
      // Convert dates to ISO strings
      const equipmentData = {
        ...data,
        acquisition_date: data.acquisition_date.toISOString(),
        warranty_expiry: data.warranty_expiry ? data.warranty_expiry.toISOString() : null,
        last_maintenance_date: data.last_maintenance_date ? data.last_maintenance_date.toISOString() : null,
        next_maintenance_date: data.next_maintenance_date ? data.next_maintenance_date.toISOString() : null,
      };
      
      return apiRequest(`/api/manufacturing/equipment/${id}`, {
        method: 'PUT',
        data: equipmentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/equipment'] });
      setEditingEquipment(null);
      form.reset();
      toast({
        title: "Equipment updated",
        description: "The equipment has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating equipment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Delete equipment mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/manufacturing/equipment/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/equipment'] });
      setDeleteEquipmentId(null);
      if (selectedEquipmentId === deleteEquipmentId) {
        setSelectedEquipmentId(null);
      }
      toast({
        title: "Equipment deleted",
        description: "The equipment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting equipment",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const onSubmit = (values: EquipmentFormValues) => {
    // Calculate next maintenance date if last maintenance date is set
    if (values.last_maintenance_date && values.maintenance_interval > 0) {
      const nextDate = new Date(values.last_maintenance_date);
      nextDate.setDate(nextDate.getDate() + values.maintenance_interval);
      values.next_maintenance_date = nextDate;
    }

    if (editingEquipment) {
      updateEquipmentMutation.mutate({ ...values, id: editingEquipment.id });
    } else {
      createEquipmentMutation.mutate(values);
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    
    form.reset({
      name: equipment.name,
      type: equipment.type,
      model: equipment.model,
      serial_number: equipment.serial_number,
      status: equipment.status,
      work_center_id: equipment.work_center_id,
      acquisition_date: new Date(equipment.acquisition_date),
      purchase_cost: equipment.purchase_cost,
      warranty_expiry: equipment.warranty_expiry ? new Date(equipment.warranty_expiry) : undefined,
      maintenance_interval: equipment.maintenance_interval,
      last_maintenance_date: equipment.last_maintenance_date ? new Date(equipment.last_maintenance_date) : undefined,
      next_maintenance_date: equipment.next_maintenance_date ? new Date(equipment.next_maintenance_date) : undefined,
      description: equipment.description || undefined,
      manufacturer: equipment.manufacturer || undefined,
    });
    
    setIsAddDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingEquipment(null);
    form.reset();
  };

  const handleViewDetails = (equipmentId: number) => {
    setSelectedEquipmentId(selectedEquipmentId === equipmentId ? null : equipmentId);
  };

  const getWorkCenterName = (workCenterId: number) => {
    if (!workCenters) return "Unknown";
    const workCenter = workCenters.find(w => w.id === workCenterId);
    return workCenter ? workCenter.name : "Unknown";
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Service':
        return 'bg-red-100 text-red-800';
      case 'Standby':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatusClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMaintenanceStatus = (nextMaintenanceDate: string | null) => {
    if (!nextMaintenanceDate) return { status: 'Not Scheduled', className: 'bg-gray-100 text-gray-800' };
    
    const today = new Date();
    const nextDate = new Date(nextMaintenanceDate);
    const daysDiff = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { status: 'Overdue', className: 'bg-red-100 text-red-800' };
    } else if (daysDiff <= 7) {
      return { status: 'Due Soon', className: 'bg-yellow-100 text-yellow-800' };
    } else if (daysDiff <= 30) {
      return { status: 'Upcoming', className: 'bg-blue-100 text-blue-800' };
    } else {
      return { status: 'Scheduled', className: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Equipment</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? "Edit Equipment" : "Add New Equipment"}
              </DialogTitle>
              <DialogDescription>
                {editingEquipment 
                  ? "Update equipment details" 
                  : "Add details for the new equipment"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Equipment name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="work_center_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Center</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value ? field.value.toString() : undefined}
                          value={field.value ? field.value.toString() : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work center" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workCenters?.map((workCenter) => (
                              <SelectItem key={workCenter.id} value={workCenter.id.toString()}>
                                {workCenter.name} ({workCenter.type})
                              </SelectItem>
                            ))}
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Type</FormLabel>
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
                            <SelectItem value="Machine">Machine</SelectItem>
                            <SelectItem value="Tool">Tool</SelectItem>
                            <SelectItem value="Vehicle">Vehicle</SelectItem>
                            <SelectItem value="Computer">Computer</SelectItem>
                            <SelectItem value="Robotics">Robotics</SelectItem>
                            <SelectItem value="Testing Equipment">Testing Equipment</SelectItem>
                            <SelectItem value="Measurement Device">Measurement Device</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
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
                            <SelectItem value="Operational">Operational</SelectItem>
                            <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                            <SelectItem value="Out of Service">Out of Service</SelectItem>
                            <SelectItem value="Standby">Standby</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Model number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serial_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Serial number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Manufacturer (optional)" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="acquisition_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Acquisition Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchase_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Cost</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Cost" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="warranty_expiry"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Warranty Expiry Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date (optional)</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="maintenance_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Interval (days)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Interval" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_maintenance_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Last Maintenance Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date (optional)</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                          placeholder="Equipment description (optional)"
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
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      handleCancelEdit();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEquipmentMutation.isPending || updateEquipmentMutation.isPending}
                  >
                    {editingEquipment 
                      ? (updateEquipmentMutation.isPending ? "Updating..." : "Update") 
                      : (createEquipmentMutation.isPending ? "Saving..." : "Save")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading equipment...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load equipment. Please try again.
          </AlertDescription>
        </Alert>
      ) : equipment && equipment.length > 0 ? (
        <div className="space-y-6">
          <Table>
            <TableCaption>List of all equipment</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Work Center</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => {
                const maintenanceStatus = calculateMaintenanceStatus(item.next_maintenance_date);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>{item.work_center_name || getWorkCenterName(item.work_center_id)}</TableCell>
                    <TableCell>
                      {item.next_maintenance_date ? (
                        <div className="flex flex-col">
                          <span>{new Date(item.next_maintenance_date).toLocaleDateString()}</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${maintenanceStatus.className}`}>
                            {maintenanceStatus.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(item.id)}
                        >
                          <Tool className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditEquipment(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => setDeleteEquipmentId(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Equipment Details */}
          {selectedEquipmentId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  {isLoadingDetails ? 
                    "Loading equipment details..." : 
                    equipmentDetails?.equipment?.name || "Equipment Details"
                  }
                </CardTitle>
                <CardDescription>
                  {!isLoadingDetails && equipmentDetails?.equipment?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <div className="flex justify-center py-4">Loading equipment details...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">General Information</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Model:</span>
                            <span className="text-sm">{equipmentDetails?.equipment?.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Serial Number:</span>
                            <span className="text-sm">{equipmentDetails?.equipment?.serial_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Manufacturer:</span>
                            <span className="text-sm">{equipmentDetails?.equipment?.manufacturer || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Work Center:</span>
                            <span className="text-sm">
                              {equipmentDetails?.equipment?.work_center_name || 
                                getWorkCenterName(equipmentDetails?.equipment?.work_center_id || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Financial Information</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Acquisition Date:</span>
                            <span className="text-sm">
                              {new Date(equipmentDetails?.equipment?.acquisition_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Purchase Cost:</span>
                            <span className="text-sm">${equipmentDetails?.equipment?.purchase_cost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Warranty Expiry:</span>
                            <span className="text-sm">
                              {equipmentDetails?.equipment?.warranty_expiry ? 
                                new Date(equipmentDetails?.equipment?.warranty_expiry).toLocaleDateString() : 
                                "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Maintenance Information</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(equipmentDetails?.equipment?.status || "")}`}>
                              {equipmentDetails?.equipment?.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Last Maintenance:</span>
                            <span className="text-sm">
                              {equipmentDetails?.equipment?.last_maintenance_date ? 
                                new Date(equipmentDetails?.equipment?.last_maintenance_date).toLocaleDateString() : 
                                "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Next Maintenance:</span>
                            <span className="text-sm">
                              {equipmentDetails?.equipment?.next_maintenance_date ? 
                                new Date(equipmentDetails?.equipment?.next_maintenance_date).toLocaleDateString() : 
                                "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Maintenance Interval:</span>
                            <span className="text-sm">{equipmentDetails?.equipment?.maintenance_interval} days</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="maintenance-history">
                        <AccordionTrigger>
                          <span className="text-base font-medium">Maintenance History</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          {!equipmentDetails?.maintenanceRequests || equipmentDetails.maintenanceRequests.length === 0 ? (
                            <div className="py-4 text-center text-muted-foreground">No maintenance history found</div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {equipmentDetails.maintenanceRequests.map((request) => (
                                  <TableRow key={request.id}>
                                    <TableCell>{new Date(request.request_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{request.type}</TableCell>
                                    <TableCell>
                                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getMaintenanceStatusClass(request.status)}`}>
                                        {request.status}
                                      </span>
                                    </TableCell>
                                    <TableCell>{request.description}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-4">No equipment found</p>
          <p className="text-sm text-muted-foreground">
            Add your first equipment to start tracking machinery and tools.
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteEquipmentId && (
        <Dialog
          open={!!deleteEquipmentId}
          onOpenChange={(open) => !open && setDeleteEquipmentId(null)}
        >
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Delete Equipment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this equipment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteEquipmentId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteEquipmentMutation.isPending}
                onClick={() => deleteEquipmentId && deleteEquipmentMutation.mutate(deleteEquipmentId)}
              >
                {deleteEquipmentMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}