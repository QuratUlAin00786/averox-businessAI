import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Loader2, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ProposalComment, User } from '@shared/schema';
import { apiRequestJson } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CommentSectionProps {
  proposalId: number;
  isReadOnly: boolean;
}

export function CommentSection({ proposalId, isReadOnly }: CommentSectionProps) {
  console.log("CommentSection rendering with proposalId:", proposalId, "isReadOnly:", isReadOnly);
  
  // Force render debugging output to console
  useEffect(() => {
    console.log("CommentSection useEffect running for proposalId:", proposalId);
  }, [proposalId]);
  
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
    <div className="p-3 h-full overflow-auto bg-white border-t">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-medium">Comments</h3>
      </div>

      {/* Simple comment entry form */}
      {!isReadOnly && (
        <Card className="mb-4">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-base">Add Comment</CardTitle>
            <CardDescription className="text-sm">
              Share your thoughts about this proposal
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <Textarea
              placeholder="Type your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
              id="comment-textarea"
            />
          </CardContent>
          <CardFooter className="flex justify-end py-2">
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" /> Post Comment
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {isLoadingComments ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : comments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <MessageSquare className="h-12 w-12 text-neutral-300 mb-2" />
            <h3 className="text-base font-medium mb-1">No comments yet</h3>
            <p className="text-neutral-500 max-w-md mx-auto text-sm">
              Add comments to track feedback and decisions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h4 className="font-medium text-base mb-2">Discussion Thread</h4>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-md p-3 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {comment.user?.avatar ? (
                      <AvatarImage src={comment.user.avatar} alt={comment.user.username || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {comment.user?.firstName?.[0] || '?'}{comment.user?.lastName?.[0] || ''}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-medium text-sm">
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
                    <div className="mt-1 text-neutral-700 whitespace-pre-wrap text-sm">{comment.content}</div>
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