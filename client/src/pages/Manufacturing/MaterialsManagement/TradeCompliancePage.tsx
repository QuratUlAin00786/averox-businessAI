import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TradeComplianceManagement from '../components/materials-management/TradeComplianceManagement';

export default function TradeCompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/manufacturing/materials">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Global Trade Compliance</h2>
        </div>
      </div>
      
      <TradeComplianceManagement />
    </div>
  );
}