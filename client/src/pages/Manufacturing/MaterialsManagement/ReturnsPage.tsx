import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ReturnsManagement from '../components/materials-management/ReturnsManagement';

export default function ReturnsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/manufacturing/materials">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Returns Management</h2>
        </div>
      </div>
      
      <ReturnsManagement />
    </div>
  );
}