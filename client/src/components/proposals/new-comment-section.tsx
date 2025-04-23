import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ProposalComment, User } from '@shared/schema';
import { apiRequestJson } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentSectionProps {
  proposalId: number;
  isReadOnly: boolean;
}

export function CommentSection({ proposalId, isReadOnly }: CommentSectionProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');

  // Fetch proposal comments
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery<(ProposalComment & { user?: User })[]>({
    queryKey: ['/api/proposals', proposalId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/proposals/${proposalId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch proposal comments');
      }
      
      const result = await response.json();
      console.log('Fetched proposal comments:', result);
      
      // Handle both standardized and legacy response formats
      return result.data || result;
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const response = await apiRequestJson<ProposalComment>(
        'POST', 
        `/api/proposals/${proposalId}/comments`, 
        { 
          content: comment,
          proposalId: proposalId,
        }
      );
      console.log("Received comment from server:", response);
      return response;
    },
    onSuccess: () => {
      setNewComment('');
      refetchComments();
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add comment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim() || isReadOnly) return;
    
    console.log("Adding new comment:", newComment.trim());
    addCommentMutation.mutate(newComment.trim());
  };

  return (
    <div className="p-6 max-h-[calc(90vh-180px)] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Comments</h3>
      </div>

      {/* Simple comment entry form */}
      {!isReadOnly && (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Add Comment</CardTitle>
            <CardDescription>
              Share your thoughts about this proposal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Post Comment
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {isLoadingComments ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
        </div>
      ) : comments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-16 w-16 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No comments yet</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              Be the first to start the discussion on this proposal. Comments help keep track of important feedback and decisions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h4 className="font-medium text-lg mb-3">Discussion Thread</h4>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {comment.user?.avatar ? (
                      <AvatarImage src={comment.user.avatar} alt={comment.user.username || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {comment.user?.firstName?.[0] || '?'}{comment.user?.lastName?.[0] || ''}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-medium">
                          {comment.user ? 
                            `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim() || comment.user.username 
                            : 'Unknown User'
                          }
                        </div>
                        <div className="text-xs text-neutral-500">
                          {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-neutral-700 whitespace-pre-wrap">{comment.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}