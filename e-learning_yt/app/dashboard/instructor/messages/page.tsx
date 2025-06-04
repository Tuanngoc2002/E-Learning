"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCommentDots, FaUser, FaBook, FaReply } from 'react-icons/fa';
import { messageService, Message, Conversation } from '@/services/messageService';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const InstructorMessagesPage = () => {
  const { user, jwt, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!jwt || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching conversations for instructor:', user.id);
        const fetchedConversations = await messageService.getInstructorConversations(user.id, jwt);
        console.log('📚 Fetched conversations:', fetchedConversations);
        setConversations(fetchedConversations);
      } catch (err) {
        console.error('❌ Error fetching conversations:', err);
        setError('Không thể tải cuộc trò chuyện. Vui lòng thử lại sau.');
        toast.error('Không thể tải cuộc trò chuyện. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Socket.IO setup
    socket.on('connect', () => {
      console.log('🔌 Connected to socket server');
      // Join all course channels for this instructor
      conversations.forEach(conv => {
        socket.emit('join_course', conv.courseId);
        console.log(`📚 Joined course channel: course_${conv.courseId}`);
      });
    });

    socket.on('receive_message', (newMessage: any) => {
      console.log('📩 Received new message:', newMessage);
      
      // Nếu đang xem conversation này, thêm message vào conversation
      if (selectedConversation && 
          newMessage.senderId === selectedConversation.studentId &&
          newMessage.courseId === selectedConversation.courseId) {
        setConversationMessages(prev => [...prev, {
          id: newMessage.id || Date.now().toString(),
          content: newMessage.content,
          courseId: newMessage.courseId,
          courseName: selectedConversation.courseName,
          studentId: newMessage.senderId,
          studentName: selectedConversation.studentName,
          createdAt: newMessage.createdAt || new Date().toISOString(),
          isRead: false
        }]);
      }
      
      // Cập nhật conversation list
      setConversations(prev => {
        const conversationKey = `${newMessage.senderId}-${newMessage.courseId}`;
        const existingIndex = prev.findIndex(conv => conv.id === conversationKey);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: newMessage.content,
            lastMessageAt: newMessage.createdAt || new Date().toISOString(),
            unreadCount: updated[existingIndex].unreadCount + 1,
            isRead: false
          };
          // Move to top
          return [updated[existingIndex], ...updated.filter((_, i) => i !== existingIndex)];
        } else {
          // New conversation - join this course channel
          socket.emit('join_course', newMessage.courseId);
          return [{
            id: conversationKey,
            courseId: newMessage.courseId,
            courseName: 'Unknown Course', // Sẽ được cập nhật khi fetch lại
            studentId: newMessage.senderId,
            studentName: 'Unknown Student', // Sẽ được cập nhật khi fetch lại
            lastMessage: newMessage.content,
            lastMessageAt: newMessage.createdAt || new Date().toISOString(),
            unreadCount: 1,
            isRead: false
          }, ...prev];
        }
      });
    });

    return () => {
      socket.off('connect');
      socket.off('receive_message');
    };
  }, [user?.id, jwt, selectedConversation, conversations]);

  // Hiển thị màn hình loading khi đang tải thông tin xác thực
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Kiểm tra nếu người dùng chưa đăng nhập sau khi đã tải xong thông tin xác thực
  if (!jwt || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Bạn cần đăng nhập để xem tin nhắn</h2>
          <button 
            onClick={() => router.push('/login')}
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const handleConversationSelect = async (conversation: Conversation) => {
    if (!jwt) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }

    console.log('🔍 Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    
    // Join this course channel for real-time updates
    socket.emit('join_course', conversation.courseId);
    console.log(`📚 Joined course channel: course_${conversation.courseId}`);
    
    // Fetch conversation messages
    try {
      const messages = await messageService.getConversation(
        conversation.courseId,
        conversation.studentId,
        user.id,
        jwt
      );
      console.log('📚 Loaded conversation messages:', messages);
      setConversationMessages(messages);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Không thể tải cuộc trò chuyện');
    }

    // Mark as read
    if (!conversation.isRead) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, isRead: true, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  const handleReply = async () => {
    if (!selectedConversation || !replyContent.trim() || !jwt || !user) {
      toast.error('Vui lòng đăng nhập và nhập nội dung phản hồi');
      return;
    }

    try {
      console.log('📤 Sending reply:', {
        content: replyContent,
        senderId: user.id,
        receiverId: selectedConversation.studentId,
        courseId: selectedConversation.courseId
      });

      const response = await messageService.sendReply(
        '', // messageId không cần thiết
        replyContent,
        user.id,
        selectedConversation.studentId,
        selectedConversation.courseId,
        jwt
      );

      const newMessage: Message = {
        id: response.data?.id?.toString() || Date.now().toString(),
        content: replyContent,
        courseId: selectedConversation.courseId,
        courseName: selectedConversation.courseName,
        studentId: user.id,
        studentName: user.username || 'Bạn',
        createdAt: new Date().toISOString(),
        isRead: true
      };

      // Emit message through Socket.IO
      socket.emit('send_message', {
        content: replyContent,
        senderId: user.id,
        receiverId: selectedConversation.studentId,
        courseId: selectedConversation.courseId,
        createdAt: new Date().toISOString(),
      });

      // Add to conversation
      setConversationMessages(prev => [...prev, newMessage]);
      setReplyContent('');
      toast.success('Phản hồi đã được gửi thành công');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Không thể gửi phản hồi. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Lỗi</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tin nhắn từ học viên</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Danh sách cuộc trò chuyện</h2>
              <p className="text-sm text-gray-500 mt-1">
                {conversations.length} cuộc hội thoại
              </p>
            </div>
            <div className="divide-y">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaCommentDots className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                    } ${!conversation.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-semibold">
                            {conversation.studentName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{conversation.studentName}</span>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FaBook className="mr-2" />
                      <span>{conversation.courseName}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{conversation.lastMessage}</p>
                    <div className="text-xs text-gray-400">
                      {new Date(conversation.lastMessageAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {selectedConversation.studentName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedConversation.studentName}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaBook className="mr-1" />
                          <span>{selectedConversation.courseName}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-4 h-[500px] overflow-y-auto">
                  {conversationMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <FaCommentDots className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có tin nhắn nào</p>
                      </div>
                    </div>
                  ) : (
                    conversationMessages
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 ${
                            message.studentId === user?.id ? 'flex justify-end' : 'flex justify-start'
                          }`}
                        >
                          <div className={`max-w-[70%] ${
                            message.studentId === user?.id 
                              ? 'bg-indigo-600 text-white rounded-br-sm' 
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          } rounded-lg p-3`}>
                            <p className="text-sm break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.studentId === user?.id ? 'text-indigo-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex space-x-3">
                    <textarea
                      className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Nhập phản hồi của bạn..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                    />
                    <button 
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      <FaReply className="mr-2" />
                      Gửi
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaCommentDots className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Chọn cuộc trò chuyện</h3>
                  <p>Chọn một cuộc trò chuyện để xem chi tiết và phản hồi</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorMessagesPage;