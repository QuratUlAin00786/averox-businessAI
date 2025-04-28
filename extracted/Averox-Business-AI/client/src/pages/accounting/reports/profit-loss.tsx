import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProfitLossReport() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setLocation('/accounting')}
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss Report</h1>
          <p className="text-muted-foreground">
            Financial performance overview for current period
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Printer size={16} /> Print Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} /> Download CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Summary</CardTitle>
          <CardDescription>Financial overview for the current fiscal period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{formatCurrency(24500)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{formatCurrency(18750)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Net Profit</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{formatCurrency(5750)}</p>
                  <p className="text-sm text-muted-foreground">Profit Margin: 23.5%</p>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Product Sales</span>
                      <span className="font-medium">{formatCurrency(16800)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Services</span>
                      <span className="font-medium">{formatCurrency(5200)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subscriptions</span>
                      <span className="font-medium">{formatCurrency(2500)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Inventory Purchases</span>
                      <span className="font-medium">{formatCurrency(9800)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Operating Expenses</span>
                      <span className="font-medium">{formatCurrency(4200)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Salaries</span>
                      <span className="font-medium">{formatCurrency(3500)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Marketing</span>
                      <span className="font-medium">{formatCurrency(1250)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit & Loss</CardTitle>
          <CardDescription>Financial performance trend by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: 'January', revenue: 4200, expenses: 3600, profit: 600, margin: 14.3 },
              { month: 'February', revenue: 4850, expenses: 3950, profit: 900, margin: 18.6 },
              { month: 'March', revenue: 5100, expenses: 3800, profit: 1300, margin: 25.5 },
              { month: 'April', revenue: 5670, expenses: 4100, profit: 1570, margin: 27.7 },
              { month: 'May', revenue: 4680, expenses: 3300, profit: 1380, margin: 29.5 },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-5 items-center p-4 border rounded-lg">
                <div className="col-span-1">
                  <h3 className="font-medium">{item.month}</h3>
                </div>
                <div className="col-span-1 text-right">
                  <p className="font-medium text-blue-600">{formatCurrency(item.revenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="col-span-1 text-right">
                  <p className="font-medium text-red-600">{formatCurrency(item.expenses)}</p>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                </div>
                <div className="col-span-1 text-right">
                  <p className="font-medium text-green-600">{formatCurrency(item.profit)}</p>
                  <p className="text-xs text-muted-foreground">Profit</p>
                </div>
                <div className="col-span-1 text-right">
                  <p className="font-medium">{item.margin.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Margin</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}