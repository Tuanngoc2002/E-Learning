import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
  parent?: number;
  replies?: Comment[];
}

export const useComments = (courseId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const { isAuthenticated, user, jwt } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/comments?` + 
          `filters[course][id][$eq]=${courseId}&` +
          `filters[parent][null]=true&` +
          `populate[user]=true&` +
          `populate[replies][populate][user]=true&` +
          `sort=createdAt:desc`,
          {
            headers: {
              'Authorization': `Bearer ${jwt}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }

        const data = await response.json();
        
        // Transform the response data to match our Comment interface
        const commentsData = data.data.map((comment: any) => ({
          id: comment.id,
          content: comment.content || '',
          createdAt: comment.createdAt || '',
          user: {
            id: comment.user?.id || 0,
            username: comment.user?.username || ''
          },
          replies: (comment.replies || []).map((reply: any) => ({
            id: reply.id,
            content: reply.content || '',
            createdAt: reply.createdAt || '',
            user: {
              id: reply.user?.id || 0,
              username: reply.user?.username || ''
            }
          }))
        }));
        
        setComments(commentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && jwt) {
      fetchComments();
    }
  }, [courseId, jwt]);

  const addComment = async (parentId?: number) => {
    if (!newComment.trim() || !jwt) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            content: newComment,
            course: courseId,
            parent: parentId || null
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      console.log('New comment data:', data);

      const newCommentData = {
        id: data.data.id,
        content: data.data.attributes?.content || newComment,
        createdAt: data.data.attributes?.createdAt || new Date().toISOString(),
        user: {
          id: data.data.attributes?.user?.data?.id || user?.id || 0,
          username: data.data.attributes?.user?.data?.attributes?.username || user?.username || ''
        }
      };

      if (parentId) {
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newCommentData],
            };
          }
          return comment;
        }));
      } else {
        setComments([newCommentData, ...comments]);
      }

      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!jwt) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove comment from state
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return null;
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== commentId),
          };
        }
        return comment;
      }).filter(Boolean) as Comment[]);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const updateComment = async (commentId: number, content: string) => {
    if (!jwt) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            content,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      // Update comment in state
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  content,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      }));
    } catch (err) {
      console.error('Error updating comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update comment');
    }
  };

  return {
    comments,
    loading,
    error,
    newComment,
    setNewComment,
    addComment,
    deleteComment,
    updateComment,
  };
}; 