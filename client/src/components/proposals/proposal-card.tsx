import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Calendar,
  CheckCircle, 
  ClipboardEdit, 
  Download, 
  ExternalLink, 
  MoreHorizontal, 
  RotateCcw, 
  Send, 
  Trash, 
  XCircle,
  Eye
} from 'lucide-react';
import { Proposal, InsertProposal } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProposalCardProps {
  proposal: Proposal;
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onEditContent: (proposal: Proposal) => void;
  onDelete: (id: number) => void;
  onSend: (proposal: Proposal) => void;
  onUpdateStatus: (id: number, data: Partial<InsertProposal>) => void;
}

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case 'Draft':
      return <Badge variant="outline" className="bg-neutral-100">Draft</Badge>;
    case 'Sent':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Sent</Badge>;
    case 'Accepted':
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Accepted</Badge>;
    case 'Rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
    case 'Expired':
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Expired</Badge>;
    case 'Revoked':
      return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Revoked</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onView,
  onEdit,
  onEditContent,
  onDelete,
  onSend,
  onUpdateStatus
}) => {
  return (
    <div 
      className="border border-solid border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ display: 'block', width: '100%' }}
      onClick={() => onView(proposal)}
    >
      <div style={{ padding: '16px 16px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontWeight: 500, fontSize: '16px', marginBottom: '4px', color: '#333' }}>{proposal.name}</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Last edited: {
              proposal.updatedAt 
                ? formatDistanceToNow(new Date(proposal.updatedAt), { addSuffix: true })
                : formatDistanceToNow(new Date(proposal.createdAt || new Date()), { addSuffix: true })
            }
          </p>
        </div>
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ marginLeft: '16px' }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEditContent(proposal)}>
                <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(proposal)}>
                <Eye className="h-4 w-4 mr-2" /> Edit Details
              </DropdownMenuItem>
              {proposal.status === 'Draft' && (
                <DropdownMenuItem onClick={() => onSend(proposal)}>
                  <Send className="h-4 w-4 mr-2" /> Send to Client
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" /> Share Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(proposal.id)}
              >
                <Trash className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div style={{ padding: '0 16px 8px 16px' }}>
        {proposal.expiresAt && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#666' }}>
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>
              Expires: {format(new Date(proposal.expiresAt), 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </div>
      
      <div style={{ padding: '0 16px 12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {getStatusBadge(proposal.status)}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {proposal.status === 'Draft' && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSend(proposal);
              }}
            >
              <Send className="h-3 w-3 mr-1" /> Send
            </Button>
          )}
          
          {proposal.status === 'Sent' && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs border-green-600 text-green-600 hover:bg-green-50"
                onClick={(e) => {
                  e.stopPropagation();
                  const acceptedData: Partial<InsertProposal> = {
                    status: 'Accepted',
                    metadata: {}
                  };
                  (acceptedData.metadata as Record<string, any>).acceptedAt = new Date().toISOString();
                  onUpdateStatus(proposal.id, acceptedData);
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Mark Accepted
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs border-red-600 text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  const rejectedData: Partial<InsertProposal> = {
                    status: 'Rejected',
                    metadata: {}
                  };
                  (rejectedData.metadata as Record<string, any>).rejectedAt = new Date().toISOString();
                  onUpdateStatus(proposal.id, rejectedData);
                }}
              >
                <XCircle className="h-3 w-3 mr-1" /> Mark Rejected
              </Button>
            </>
          )}
          
          {(proposal.status === 'Accepted' || proposal.status === 'Rejected') && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(proposal.id, { status: 'Draft' });
              }}
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Reopen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};