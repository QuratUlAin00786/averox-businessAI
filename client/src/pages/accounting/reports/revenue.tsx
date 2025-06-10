import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function RevenueReport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Print Report button clicked");
            
            try {
              // Create a print-friendly version of the report
              const printWindow = window.open('', '_blank');
              if (!printWindow) {
                alert('Please allow popups to print the report');
                return;
              }
              
              const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>AVEROX CRM - Revenue Report</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 20px;
                      color: #333;
                    }
                    .header {
                      text-align: center;
                      margin-bottom: 30px;
                      border-bottom: 2px solid #0066cc;
                      padding-bottom: 20px;
                    }
                    .logo {
                      font-size: 24px;
                      font-weight: bold;
                      color: #0066cc;
                    }
                    .report-title {
                      font-size: 20px;
                      margin: 10px 0;
                    }
                    .report-subtitle {
                      color: #666;
                      margin-bottom: 10px;
                    }
                    .summary-section {
                      margin: 30px 0;
                    }
                    .section-title {
                      font-size: 18px;
                      font-weight: bold;
                      color: #0066cc;
                      margin-bottom: 15px;
                      border-bottom: 1px solid #ddd;
                      padding-bottom: 5px;
                    }
                    .data-grid {
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      gap: 30px;
                      margin: 20px 0;
                    }
                    .data-item {
                      display: flex;
                      justify-content: space-between;
                      padding: 8px 0;
                      border-bottom: 1px solid #eee;
                    }
                    .data-label {
                      font-weight: 500;
                    }
                    .data-value {
                      font-weight: bold;
                    }
                    .total-revenue {
                      font-size: 20px;
                      text-align: center;
                      padding: 20px;
                      background-color: #f8f9fa;
                      border: 2px solid #0066cc;
                      margin: 20px 0;
                    }
                    .monthly-section {
                      margin-top: 30px;
                    }
                    .monthly-item {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 12px;
                      border: 1px solid #ddd;
                      margin-bottom: 10px;
                    }
                    .month-info h4 {
                      margin: 0;
                      font-size: 16px;
                    }
                    .month-info p {
                      margin: 5px 0 0 0;
                      color: #666;
                      font-size: 14px;
                    }
                    .month-revenue {
                      text-align: right;
                    }
                    .month-revenue .amount {
                      font-size: 18px;
                      font-weight: bold;
                    }
                    .month-revenue .invoices {
                      font-size: 12px;
                      color: #666;
                    }
                    .footer {
                      margin-top: 40px;
                      text-align: center;
                      color: #666;
                      font-size: 12px;
                      border-top: 1px solid #ddd;
                      padding-top: 20px;
                    }
                    @media print {
                      body { margin: 0; }
                      .no-print { display: none; }
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div class="logo">AVEROX</div>
                    <div class="report-title">Revenue Report</div>
                    <div class="report-subtitle">Detailed revenue breakdown for current period</div>
                    <div class="report-subtitle">Generated on: ${new Date().toLocaleString()}</div>
                  </div>
                  
                  <div class="total-revenue">
                    <div>Total Revenue: <strong>$24,500</strong></div>
                  </div>
                  
                  <div class="summary-section">
                    <div class="section-title">Revenue Summary</div>
                    <div class="data-grid">
                      <div>
                        <div class="section-title" style="font-size: 16px;">Revenue by Category</div>
                        <div class="data-item">
                          <span class="data-label">Product Sales</span>
                          <span class="data-value">$16,800</span>
                        </div>
                        <div class="data-item">
                          <span class="data-label">Services</span>
                          <span class="data-value">$5,200</span>
                        </div>
                        <div class="data-item">
                          <span class="data-label">Subscriptions</span>
                          <span class="data-value">$2,500</span>
                        </div>
                      </div>
                      
                      <div>
                        <div class="section-title" style="font-size: 16px;">Revenue by Status</div>
                        <div class="data-item">
                          <span class="data-label">Collected</span>
                          <span class="data-value" style="color: #28a745;">$18,180</span>
                        </div>
                        <div class="data-item">
                          <span class="data-label">Outstanding</span>
                          <span class="data-value" style="color: #ffc107;">$5,070</span>
                        </div>
                        <div class="data-item">
                          <span class="data-label">Overdue</span>
                          <span class="data-value" style="color: #dc3545;">$1,250</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="monthly-section">
                    <div class="section-title">Monthly Revenue Breakdown</div>
                    
                    <div class="monthly-item">
                      <div class="month-info">
                        <h4>January 2025</h4>
                        <p>Closed</p>
                      </div>
                      <div class="month-revenue">
                        <div class="amount">$4,200</div>
                        <div class="invoices">15 invoices</div>
                      </div>
                    </div>
                    
                    <div class="monthly-item">
                      <div class="month-info">
                        <h4>February 2025</h4>
                        <p>Closed</p>
                      </div>
                      <div class="month-revenue">
                        <div class="amount">$4,850</div>
                        <div class="invoices">18 invoices</div>
                      </div>
                    </div>
                    
                    <div class="monthly-item">
                      <div class="month-info">
                        <h4>March 2025</h4>
                        <p>Closed</p>
                      </div>
                      <div class="month-revenue">
                        <div class="amount">$5,100</div>
                        <div class="invoices">19 invoices</div>
                      </div>
                    </div>
                    
                    <div class="monthly-item">
                      <div class="month-info">
                        <h4>April 2025</h4>
                        <p>Current</p>
                      </div>
                      <div class="month-revenue">
                        <div class="amount">$5,670</div>
                        <div class="invoices">21 invoices</div>
                      </div>
                    </div>
                    
                    <div class="monthly-item">
                      <div class="month-info">
                        <h4>May 2025</h4>
                        <p>Projected</p>
                      </div>
                      <div class="month-revenue">
                        <div class="amount">$4,680</div>
                        <div class="invoices">Estimated</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="footer">
                    <p>AVEROX CRM - Business Intelligence Platform</p>
                    <p>This report contains confidential business information</p>
                  </div>
                  
                  <script>
                    window.onload = function() {
                      window.print();
                      window.onafterprint = function() {
                        window.close();
                      };
                    };
                  </script>
                </body>
                </html>
              `;
              
              printWindow.document.write(printContent);
              printWindow.document.close();
              
              console.log("Print dialog opened successfully");
              
              // Show success message if toast is available
              if (toast) {
                toast({
                  title: "Print Ready",
                  description: "Print dialog has been opened",
                });
              }
            } catch (error) {
              console.error("Print failed:", error);
              
              // Show error message if toast is available
              if (toast) {
                toast({
                  title: "Print Failed", 
                  description: "Failed to open print dialog. Please try again.",
                  variant: "destructive",
                });
              } else {
                alert("Print failed: " + error.message);
              }
            }
          }}
        >
          <Printer size={16} /> Print Report
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Download CSV button clicked");
            
            try {
              // Generate comprehensive revenue report CSV
              const csvRows = [];
              
              // Header information
              csvRows.push(["AVEROX CRM - Revenue Report"]);
              csvRows.push([`Generated on: ${new Date().toLocaleString()}`]);
              csvRows.push([`Period: Current Fiscal Year`]);
              csvRows.push([""]);
              
              // Revenue Summary
              csvRows.push(["REVENUE SUMMARY"]);
              csvRows.push(["Metric", "Amount"]);
              csvRows.push(["Total Revenue", "$24,500.00"]);
              csvRows.push([""]);
              
              // Revenue by Category
              csvRows.push(["REVENUE BY CATEGORY"]);
              csvRows.push(["Category", "Amount"]);
              csvRows.push(["Product Sales", "$16,800.00"]);
              csvRows.push(["Services", "$5,200.00"]);
              csvRows.push(["Subscriptions", "$2,500.00"]);
              csvRows.push([""]);
              
              // Revenue by Status
              csvRows.push(["REVENUE BY STATUS"]);
              csvRows.push(["Status", "Amount"]);
              csvRows.push(["Collected", "$18,180.00"]);
              csvRows.push(["Outstanding", "$5,070.00"]);
              csvRows.push(["Overdue", "$1,250.00"]);
              csvRows.push([""]);
              
              // Monthly Breakdown
              csvRows.push(["MONTHLY BREAKDOWN"]);
              csvRows.push(["Month", "Revenue", "Status", "Invoices"]);
              csvRows.push(["January 2025", "$4,200.00", "Closed", "15 invoices"]);
              csvRows.push(["February 2025", "$4,850.00", "Closed", "18 invoices"]);
              csvRows.push(["March 2025", "$5,100.00", "Closed", "19 invoices"]);
              csvRows.push(["April 2025", "$5,670.00", "Current", "21 invoices"]);
              csvRows.push(["May 2025", "$4,680.00", "Projected", "Estimated"]);
              
              console.log("CSV data prepared:", csvRows.length, "rows");
              
              // Convert to CSV content
              const csvContent = csvRows.map(row => 
                row.map(cell => 
                  typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
                ).join(',')
              ).join('\n');
              
              console.log("CSV content generated, length:", csvContent.length);
              
              // Create and trigger download
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `averox_revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
              link.style.display = "none";
              
              // Append link, trigger download, then clean up
              document.body.appendChild(link);
              console.log("Triggering download...");
              link.click();
              
              // Clean up after a short delay
              setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log("Download cleanup completed");
              }, 100);
              
              // Show success message if toast is available
              if (toast) {
                toast({
                  title: "Download Successful",
                  description: "Revenue report has been downloaded",
                });
              } else {
                console.log("Toast not available, download should have started");
                alert("Revenue report download started!");
              }
            } catch (error) {
              console.error("Download failed:", error);
              
              // Show error message if toast is available
              if (toast) {
                toast({
                  title: "Download Failed", 
                  description: "Failed to download revenue report. Please try again.",
                  variant: "destructive",
                });
              } else {
                console.error("Toast not available, showing alert");
                alert("Download failed: " + error.message);
              }
            }
          }}
        >
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