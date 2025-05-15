import React, { useState } from 'react';
import { ProposalManager } from '@/components/proposals/proposal-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export default function ProposalsPage() {
  const [managerVisible, setManagerVisible] = useState(true);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">
            Create, manage, and track business proposals for your clients
          </p>
        </div>
        <Button onClick={() => setManagerVisible(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      {/* Proposals manager dialog */}
      <ProposalManager 
        isVisible={managerVisible}
        onClose={() => setManagerVisible(false)}
      />
    </div>
  );
}