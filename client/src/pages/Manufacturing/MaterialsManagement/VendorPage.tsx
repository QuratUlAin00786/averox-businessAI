import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import VendorManagement from '../components/materials-management/VendorManagement';

export default function VendorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/manufacturing/materials">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Vendor Management</h2>
        </div>
      </div>
      
      <VendorManagement />
    </div>
  );
}