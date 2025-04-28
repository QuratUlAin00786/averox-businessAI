import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, EyeIcon, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ProposalCollaborator, User } from '@shared/schema';
import { apiRequestJson } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

interface CollaboratorSectionProps {
  proposalId: number;
  isReadOnly: boolean;
}

export function CollaboratorSection({ proposalId, isReadOnly }: CollaboratorSectionProps) {
  console.log("CollaboratorSection rendering with proposalId:", proposalId, "isReadOnly:", isReadOnly);
  
  // Force render debugging output to console
  useEffect(() => {
    console.log("CollaboratorSection useEffect running for proposalId:", proposalId);
  }, [proposalId]);
  
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Viewer');

  // Fetch proposal collaborators
  const {
    data: collaborators = [],
    isLoading: isLoadingCollaborators,
    refetch: refetchCollaborators,
  } = useQuery<(ProposalCollaborator & { user?: User })[]>({
    queryKey: ['/api/proposals', proposalId, 'collaborators'],
    queryFn: async () => {
      const response = await fetch(`/api/proposals/${proposalId}/collaborators`);
      if (!response.ok) {
        throw new Error('Failed to fetch proposal collaborators');
      }
      
      const result = await response.json();
      console.log('Fetched proposal collaborators:', result);
      
      // Handle both standardized and legacy response formats
      return result.data || result;
    },
  });

  // Fetch users for collaborator selection
  const {
    data: users = [],
    isLoading: isLoadingUsers,
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const result = await response.json();
      console.log("Raw users API response:", result);
      
      // If the response already has a data property, use it, otherwise use the result itself
      const usersData = result.data || result;
      console.log("Processed users data:", usersData);
      
      return usersData;
    },
    staleTime: 60000, // Keep data fresh for 1 minute
    enabled: true, // Always fetch users regardless of readOnly status
  });

  // Add collaborator mutation
  const addCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorData: { userId: number; role: string }) => {
      const response = await apiRequestJson<ProposalCollaborator>(
        'POST', 
        `/api/proposals/${proposalId}/collaborators`, 
        { 
          userId: collaboratorData.userId,
          role: collaboratorData.role,
          proposalId: proposalId
        }
      );
      console.log("Received collaborator from server:", response);
      return response;
    },
    onSuccess: () => {
      setSelectedUserId(null);
      setSelectedRole('Viewer');
      refetchCollaborators();
      toast({
        title: 'Success',
        description: 'Collaborator added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add collaborator: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="h-full flex flex-col">
      {/* Collaborators list */}
      {isLoadingCollaborators ? (
        <div className="flex items-center justify-center p-4 h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
        </div>
      ) : collaborators.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 p-4 text-center border-2 border-dashed rounded-md m-2">
          <Users className="h-10 w-10 text-neutral-300 mb-2" />
          <h3 className="text-sm font-medium mb-1">No collaborators yet</h3>
          <p className="text-xs text-neutral-500 max-w-full mx-auto">
            {!isReadOnly ? 'Add team members below' : 'This proposal has no collaborators'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {collaborators.map((collaborator) => (
            <div key={collaborator.id} className="border rounded-md p-2 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  {collaborator.user?.avatar ? (
                    <AvatarImage src={collaborator.user.avatar} alt={collaborator.user.username || 'User'} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {collaborator.user?.firstName?.[0] || '?'}{collaborator.user?.lastName?.[0] || ''}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {collaborator.user ? 
                      `${collaborator.user.firstName || ''} ${collaborator.user.lastName || ''}`.trim() || collaborator.user.username 
                      : 'Unknown User'
                    }
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100">
                      {collaborator.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add collaborator section */}
      {!isReadOnly && (
        <div className="mt-auto pt-2 border-t">
          <h4 className="text-xs font-medium mb-2 text-gray-500">ADD COLLABORATOR</h4>
          
          {/* User selection */}
          <div className="mb-2">
            <Label className="mb-1 block text-xs">Select User</Label>
            {isLoadingUsers ? (
              <div className="flex justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <div 
                      key={user.id}
                      className={`flex items-center p-1.5 rounded-md cursor-pointer hover:bg-gray-100 ${
                        selectedUserId === user.id ? 'bg-primary/10 border border-primary/30' : 'border border-transparent'
                      }`}
                      onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary font-medium text-xs">
                        {user.firstName?.[0] || ''}
                        {user.lastName?.[0] || ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{user.firstName || ''} {user.lastName || ''}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 border border-dashed rounded-md text-center text-xs">
                    <p>No users available</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Role selection - only show if a user is selected */}
          {selectedUserId && (
            <div className="mb-3">
              <Label className="mb-1 block text-xs">Select Role</Label>
              <div className="grid grid-cols-3 gap-1">
                <div 
                  className={`p-1 border rounded-md cursor-pointer text-center ${
                    selectedRole === 'Viewer' ? 'bg-primary/10 border-primary/50' : ''
                  }`}
                  onClick={() => setSelectedRole('Viewer')}
                >
                  <EyeIcon className="h-3 w-3 mx-auto mb-1" />
                  <div className="font-medium text-xs">Viewer</div>
                </div>
                <div 
                  className={`p-1 border rounded-md cursor-pointer text-center ${
                    selectedRole === 'Editor' ? 'bg-primary/10 border-primary/50' : ''
                  }`}
                  onClick={() => setSelectedRole('Editor')}
                >
                  <FileIcon className="h-3 w-3 mx-auto mb-1" />
                  <div className="font-medium text-xs">Editor</div>
                </div>
                <div 
                  className={`p-1 border rounded-md cursor-pointer text-center ${
                    selectedRole === 'Manager' ? 'bg-primary/10 border-primary/50' : ''
                  }`}
                  onClick={() => setSelectedRole('Manager')}
                >
                  <Users className="h-3 w-3 mx-auto mb-1" />
                  <div className="font-medium text-xs">Manager</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Add button */}
          <Button
            size="sm"
            className="w-full mt-1"
            onClick={() => {
              if (selectedUserId) {
                addCollaboratorMutation.mutate({
                  userId: selectedUserId,
                  role: selectedRole
                });
              }
            }}
            disabled={!selectedUserId || addCollaboratorMutation.isPending}
          >
            {addCollaboratorMutation.isPending ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" /> Add Collaborator
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}