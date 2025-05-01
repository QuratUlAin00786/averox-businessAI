import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Calendar, ChevronDown, ChevronsUpDown, Filter, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface ValuationMethod {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  defaultForMaterialTypes: string[];
  calculationLogic: string;
  lastCalculated: string;
}

interface MaterialValuation {
  id: number;
  materialId: number;
  materialName: string;
  materialCode: string;
  valuationMethod: string;
  valuationMethodName: string;
  valuationDate: string;
  unitValue: number;
  totalValue: number;
  quantity: number;
  currency: string;
  calculationDetails: any;
  periodId: number;
  isActive: boolean;
}

export default function ValuationsManagement() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  
  // Fetch valuation methods
  const { data: valuationMethods = [], isLoading: isMethodsLoading } = useQuery({
    queryKey: ['/api/manufacturing/valuation-methods'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/manufacturing/valuation-methods');
      return await res.json() as ValuationMethod[];
    }
  });
  
  // Fetch valuations
  const { data: valuations = [], isLoading: isValuationsLoading, refetch } = useQuery({
    queryKey: ['/api/manufacturing/valuations', selectedMethod],
    queryFn: async () => {
      const url = selectedMethod 
        ? `/api/manufacturing/valuations?method=${selectedMethod}`
        : '/api/manufacturing/valuations';
      const res = await apiRequest('GET', url);
      return await res.json() as MaterialValuation[];
    }
  });
  
  // Set first method as default when data loads
  useEffect(() => {
    if (valuationMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(valuationMethods[0].name);
    }
  }, [valuationMethods]);
  
  // Calculate totals
  const totalValue = valuations.reduce((sum, v) => sum + v.totalValue, 0);
  const uniqueMaterials = new Set(valuations.map(v => v.materialId)).size;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Material Valuation Methods</CardTitle>
              <CardDescription>Configure how materials are valued in your system</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {valuationMethods.map((method) => (
              <Card key={method.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMethod(method.name)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    {method.isDefault && <Badge className="ml-2">Default</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Last calculated: {formatDate(method.lastCalculated)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Material Valuations</CardTitle>
              <CardDescription>
                Showing {valuations.length} valuations for {uniqueMaterials} materials
                {selectedMethod && ` using ${selectedMethod}`}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  {valuationMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      {method.name}
                    </SelectItem>
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
                <TableHead>Material</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Unit Value</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isValuationsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading valuations...
                  </TableCell>
                </TableRow>
              ) : valuations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No valuations found
                  </TableCell>
                </TableRow>
              ) : (
                valuations.map((valuation) => (
                  <TableRow key={valuation.id}>
                    <TableCell className="font-medium">{valuation.materialName}</TableCell>
                    <TableCell>{valuation.materialCode}</TableCell>
                    <TableCell>{valuation.valuationMethodName || valuation.valuationMethod}</TableCell>
                    <TableCell>{valuation.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(valuation.unitValue, valuation.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(valuation.totalValue, valuation.currency)}
                    </TableCell>
                    <TableCell>{formatDate(valuation.valuationDate)}</TableCell>
                  </TableRow>
                ))
              )}
              {valuations.length > 0 && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="font-medium text-right">
                    Total Value:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totalValue, valuations[0]?.currency || 'USD')}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}