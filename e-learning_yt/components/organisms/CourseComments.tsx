"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaRegStar, FaReply } from 'react-icons/fa';

interface Reply {
  id: number;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  date: string;
}

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  rating: number;
  content: string;
  date: string;
  replies: Reply[];
}

interface CourseCommentsProps {
  courseId: string;
}

const CourseComments = ({ courseId }: CourseCommentsProps) => {
  const [newComment, setNewComment] = useState({
    rating: 0,
    content: '',
  });
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: '/images/testimonials/student-1.jpg',
        role: 'Student',
      },
      rating: 5,
      content: 'This course was excellent! The instructor explained everything clearly and the content was well-structured.',
      date: '2024-03-15',
      replies: [
        {
          id: 1,
          user: {
            name: 'Jane Smith',
            avatar: '/images/testimonials/student-2.jpg',
            role: 'Student',
          },
          content: 'I agree! The practical examples were particularly helpful.',
          date: '2024-03-16',
        },
      ],
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: '/images/testimonials/student-2.jpg',
        role: 'Professional',
      },
      rating: 4,
      content: 'Great course overall. The practical examples were very helpful in understanding the concepts.',
      date: '2024-03-10',
      replies: [],
    },
  ]);

  const handleRatingClick = (rating: number) => {
    setNewComment(prev => ({ ...prev, rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.content.trim() || newComment.rating === 0) return;

    const comment: Comment = {
      id: comments.length + 1,
      user: {
        name: 'Current User',
        avatar: '/images/testimonials/student-3.jpg',
        role: 'Student',
      },
      rating: newComment.rating,
      content: newComment.content,
      date: new Date().toISOString().split('T')[0],
      replies: [],
    };

    setComments(prev => [comment, ...prev]);
    setNewComment({ rating: 0, content: '' });
  };

  const handleReply = (commentId: number) => {
    if (!replyContent.trim()) return;

    const newReply: Reply = {
      id: Date.now(),
      user: {
        name: 'Current User',
        avatar: '/images/testimonials/student-3.jpg',
        role: 'Student',
      },
      content: replyContent,
      date: new Date().toISOString().split('T')[0],
    };

    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment
      )
    );

    setReplyContent('');
    setReplyingTo(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold mb-6">Course Reviews</h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="text-2xl focus:outline-none"
              >
                {star <= newComment.rating ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar className="text-gray-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            value={newComment.content}
            onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Share your thoughts about this course..."
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
        >
          Submit Review
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-start space-x-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{comment.user.name}</h4>
                    <p className="text-sm text-gray-600">{comment.user.role}</p>
                  </div>
                  <span className="text-sm text-gray-500">{comment.date}</span>
                </div>
                <div className="flex items-center mt-2 mb-2">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`w-4 h-4 ${
                        index < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{comment.content}</p>
                
                {/* Reply Button */}
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 mt-2"
                >
                  <FaReply className="mr-1" />
                  {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                </button>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="mt-4">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="Write your reply..."
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
                    >
                      Submit Reply
                    </button>
                  </div>
                )}

                {/* Replies List */}
                {comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="ml-8 border-l-2 border-gray-200 pl-4">
                        <div className="flex items-start space-x-4">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={reply.user.avatar}
                              alt={reply.user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-sm">{reply.user.name}</h4>
                                <p className="text-xs text-gray-600">{reply.user.role}</p>
                              </div>
                              <span className="text-xs text-gray-500">{reply.date}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseComments; 