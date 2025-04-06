import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ExpensesReport() {
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
          <h1 className="text-3xl font-bold">Expenses Report</h1>
          <p className="text-muted-foreground">
            Detailed expense breakdown for current period
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
          <CardTitle>Expenses Summary</CardTitle>
          <CardDescription>Overview of expenses for the current fiscal period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">Total Expenses</span>
              <span className="text-lg font-bold">{formatCurrency(18750)}</span>
            </div>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expenses by Category</CardTitle>
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
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expenses by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Paid</span>
                      <span className="font-medium text-green-600">{formatCurrency(15300)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pending</span>
                      <span className="font-medium text-amber-600">{formatCurrency(2900)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overdue</span>
                      <span className="font-medium text-red-600">{formatCurrency(550)}</span>
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
          <CardTitle>Monthly Expense Breakdown</CardTitle>
          <CardDescription>Expense details for each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: 'January', expense: 3600, status: 'Closed' },
              { month: 'February', expense: 3950, status: 'Closed' },
              { month: 'March', expense: 3800, status: 'Closed' },
              { month: 'April', expense: 4100, status: 'Current' },
              { month: 'May', expense: 3300, status: 'Projected' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{item.month} 2025</h3>
                  <p className="text-sm text-muted-foreground">{item.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(item.expense)}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.status === 'Projected' ? 'Estimated' : `${Math.floor(Math.random() * 6) + 5} bills`}
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