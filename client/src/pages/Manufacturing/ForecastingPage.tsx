import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Calendar, Briefcase, TrendingUp } from 'lucide-react';
import { useParams, useLocation } from 'wouter';
import { z } from 'zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define validation schema
const forecastFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  end_date: z.date({
    required_error: 'End date is required',
  }).refine((date) => date > new Date(), {
    message: 'End date must be in the future',
  }),
  product_id: z.number().min(1, 'Product selection is required'),
  forecast_period: z.enum(['Monthly', 'Quarterly', 'Yearly'], {
    required_error: 'Period is required',
  }),
  forecast_type: z.enum(['Statistical', 'Manual', 'Combined'], {
    required_error: 'Forecast type is required',
  }),
  confidence_level: z.number().min(0).max(1).default(0.8),
  unit_of_measure: z.enum(['Each', 'Kilogram', 'Liter', 'Meter', 'Pound', 'Gallon'], {
    required_error: 'Unit of measure is required',
  }),
});

export default function ForecastingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Products query for dropdown
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/manufacturing/products'],
    queryFn: async () => {
      const response = await fetch('/api/manufacturing/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });
  
  // Form setup with validation
  const form = useForm<z.infer<typeof forecastFormSchema>>({
    resolver: zodResolver(forecastFormSchema),
    defaultValues: {
      name: '',
      description: '',
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      product_id: 0,
      forecast_period: 'Monthly',
      forecast_type: 'Statistical',
      confidence_level: 0.8,
      unit_of_measure: 'Each'
    }
  });
  
  // Create forecast mutation
  const createForecastMutation = useMutation({
    mutationFn: async (data: z.infer<typeof forecastFormSchema>) => {
      // Transform the form data to match server expectations
      const transformedData = {
        name: data.name,
        description: data.description,
        startDate: data.start_date.toISOString(),
        endDate: data.end_date.toISOString(),
        items: [{
          productId: data.product_id,
          quantity: 100 // Default quantity, could be made configurable
        }]
      };
      return apiRequest('POST', '/api/manufacturing/forecasts', transformedData);
    },
    onSuccess: () => {
      toast({
        title: 'Forecast Created',
        description: 'The forecast has been created successfully. Use "View All Forecasts" to see your forecasts in the MRP Dashboard.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/mrp/dashboard'] });
      // Reset the form instead of redirecting
      form.reset({
        name: '',
        description: '',
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        product_id: 0,
        forecast_period: 'Monthly',
        forecast_type: 'Statistical',
        confidence_level: 0.8,
        unit_of_measure: 'Each'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Creating Forecast',
        description: error.message || 'Failed to create forecast',
        variant: 'destructive',
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof forecastFormSchema>) => {
    createForecastMutation.mutate(data);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Forecast</h1>
          <p className="text-muted-foreground">Create demand forecasts for production planning</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setLocation('/manufacturing/materials/mrp?tab=forecasts')}
          >
            View All Forecasts
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/manufacturing')}
          >
            Back to Manufacturing
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Forecast Details</CardTitle>
          <CardDescription>
            Provide the necessary information to generate a material forecast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Q3 2025 Forecast" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="forecast_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select forecast type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Statistical">Statistical</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Combined">Combined</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="forecast_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forecast Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productsLoading ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading products...</span>
                            </div>
                          ) : products?.map((product: any) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
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
                  name="unit_of_measure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Each">Each</SelectItem>
                          <SelectItem value="Kilogram">Kilogram</SelectItem>
                          <SelectItem value="Liter">Liter</SelectItem>
                          <SelectItem value="Meter">Meter</SelectItem>
                          <SelectItem value="Pound">Pound</SelectItem>
                          <SelectItem value="Gallon">Gallon</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confidence_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confidence Level (0-1)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          placeholder="0.8" 
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
                      <Input placeholder="Forecast description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end mt-6 space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation('/manufacturing')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createForecastMutation.isPending}
                >
                  {createForecastMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Forecast
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}