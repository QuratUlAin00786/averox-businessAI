import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RevenueReport() {
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
          <h1 className="text-3xl font-bold">Revenue Report</h1>
          <p className="text-muted-foreground">
            Detailed revenue breakdown for current period
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
          <CardTitle>Revenue Summary</CardTitle>
          <CardDescription>Overview of revenue for the current fiscal period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">Total Revenue</span>
              <span className="text-lg font-bold">{formatCurrency(24500)}</span>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue by Category</CardTitle>
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
                  <CardTitle className="text-base">Revenue by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Collected</span>
                      <span className="font-medium text-green-600">{formatCurrency(18180)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Outstanding</span>
                      <span className="font-medium text-amber-600">{formatCurrency(5070)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overdue</span>
                      <span className="font-medium text-red-600">{formatCurrency(1250)}</span>
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
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
          <CardDescription>Revenue details for each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: 'January', revenue: 4200, status: 'Closed' },
              { month: 'February', revenue: 4850, status: 'Closed' },
              { month: 'March', revenue: 5100, status: 'Closed' },
              { month: 'April', revenue: 5670, status: 'Current' },
              { month: 'May', revenue: 4680, status: 'Projected' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{item.month} 2025</h3>
                  <p className="text-sm text-muted-foreground">{item.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(item.revenue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.status === 'Projected' ? 'Estimated' : `${Math.floor(Math.random() * 10) + 10} invoices`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}