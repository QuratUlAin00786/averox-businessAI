import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, DownloadCloud, Eye, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const SAMPLE_TRANSACTIONS = [
  {
    id: 'TRX-001',
    date: new Date('2025-04-01'),
    type: 'Invoice Payment',
    description: 'Payment received for INV-2158',
    amount: 1250,
    reference: 'INV-2158',
    status: 'Completed',
  },
  {
    id: 'TRX-002',
    date: new Date('2025-04-02'),
    type: 'Purchase Payment',
    description: 'Payment for office supplies',
    amount: -350,
    reference: 'PO-1089',
    status: 'Completed',
  },
  {
    id: 'TRX-003',
    date: new Date('2025-04-03'),
    type: 'Expense',
    description: 'Monthly rent payment',
    amount: -1800,
    reference: 'EXP-2203',
    status: 'Completed',
  },
  {
    id: 'TRX-004',
    date: new Date('2025-04-04'),
    type: 'Invoice Payment',
    description: 'Payment received for INV-2159',
    amount: 2750,
    reference: 'INV-2159',
    status: 'Completed',
  },
  {
    id: 'TRX-005',
    date: new Date('2025-04-05'),
    type: 'Refund',
    description: 'Customer refund for damaged product',
    amount: -450,
    reference: 'RF-0112',
    status: 'Completed',
  },
  {
    id: 'TRX-006',
    date: new Date('2025-04-06'),
    type: 'Expense',
    description: 'Utility bills payment',
    amount: -320,
    reference: 'EXP-2204',
    status: 'Pending',
  },
  {
    id: 'TRX-007',
    date: new Date('2025-04-07'),
    type: 'Invoice Payment',
    description: 'Partial payment received for INV-2160',
    amount: 1500,
    reference: 'INV-2160',
    status: 'Completed',
  },
  {
    id: 'TRX-008',
    date: new Date('2025-04-08'),
    type: 'Payroll',
    description: 'Staff salary payments',
    amount: -3500,
    reference: 'PR-0402',
    status: 'Completed',
  },
  {
    id: 'TRX-009',
    date: new Date('2025-04-09'),
    type: 'Purchase Payment',
    description: 'Inventory restocking',
    amount: -1850,
    reference: 'PO-1090',
    status: 'Pending',
  },
  {
    id: 'TRX-010',
    date: new Date('2025-04-10'),
    type: 'Invoice Payment',
    description: 'Payment received for INV-2161',
    amount: 3200,
    reference: 'INV-2161',
    status: 'Completed',
  },
];

export default function TransactionsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDownloadCSV = () => {
    try {
      console.log("Download CSV button clicked");
      
      // Generate CSV content from filtered transactions
      const csvRows = [];
      
      // Header
      csvRows.push(["AVEROX CRM - Transactions Report"]);
      csvRows.push([`Generated on: ${new Date().toLocaleString()}`]);
      csvRows.push([`Total Transactions: ${filteredTransactions.length}`]);
      csvRows.push([""]);
      
      // Column headers
      csvRows.push(["Transaction ID", "Date", "Type", "Description", "Amount", "Reference", "Status"]);
      
      // Transaction data
      filteredTransactions.forEach(transaction => {
        csvRows.push([
          transaction.id,
          formatDate(transaction.date),
          transaction.type,
          transaction.description,
          formatCurrency(transaction.amount),
          transaction.reference,
          transaction.status
        ]);
      });
      
      // Convert to CSV format
      const csvContent = csvRows.map(row => 
        row.map(cell => 
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(',')
      ).join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Download Successful",
        description: "Transactions report has been downloaded",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download transactions report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewTransaction = (transactionId: string) => {
    const transaction = filteredTransactions.find(t => t.id === transactionId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDialogOpen(true);
    }
  };

  // Filter transactions based on search query and filters
  const filteredTransactions = SAMPLE_TRANSACTIONS.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = transactionType === 'all' || 
      transaction.type.toLowerCase().includes(transactionType.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      transaction.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all financial transactions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDownloadCSV}
              >
                <DownloadCloud size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                    <TableCell className={`text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewTransaction(transaction.id)}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {SAMPLE_TRANSACTIONS.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View complete details for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="text-lg font-semibold">{selectedTransaction.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedTransaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    selectedTransaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedTransaction.status}
                  </p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                  <p className="text-lg">{selectedTransaction.type}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-base">{selectedTransaction.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-base">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference</label>
                    <p className="text-base font-mono">{selectedTransaction.reference}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Transaction Updated",
                    description: `Transaction ${selectedTransaction.id} has been processed`,
                  });
                  setIsDialogOpen(false);
                }}>
                  Process Transaction
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}