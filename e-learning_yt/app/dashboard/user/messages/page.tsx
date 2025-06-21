"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCommentDots, FaUser, FaBook, FaReply } from 'react-icons/fa';
import { messageService, Message } from '@/services/messageService';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const UserMessagesPage = () => {
  const { user, jwt, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!jwt || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('User ID:', user.id);
        console.log('User role:', user.role);
        
        // Determine if user is instructor or student based on role or other criteria
        // For now, let's assume if user has instructor role, show instructor messages
        // Otherwise show student messages
        let fetchedMessages;
        
        if (user.role === 'instructor' || user.role === 'admin') {
          // User is instructor - get messages sent to them
          fetchedMessages = await messageService.getInstructorMessages(user.id, jwt);
        } else {
          // User is student - get messages sent to them
          fetchedMessages = await messageService.getStudentMessages(user.id, jwt);
        }
        
        setMessages(fetchedMessages);
      } catch (err) {
        console.log('Error fetching messages:', err);
        setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
        toast.error('Không thể tải tin nhắn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Socket.IO setup
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('receive_message', (newMessage: Message) => {
      // Check if the new message belongs to the current conversation
      if (selectedMessage && 
          newMessage.courseId === selectedMessage.courseId &&
          ((user?.role === 'instructor' || user?.role === 'admin') 
            ? (newMessage.studentId === selectedMessage.studentId || newMessage.studentId === user?.id)
            : (newMessage.studentId === selectedMessage.studentId || newMessage.studentId === user?.id)
          )) {
        setConversationMessages(prev => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('receive_message');
    };
  }, [user?.id, jwt, selectedMessage]);

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

  const handleMessageSelect = async (message: Message) => {
    if (!jwt) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }

    setSelectedMessage(message);
    
    // Fetch conversation messages
    try {
      // Determine the correct parameters based on user role
      let conversation;
      
      if (user?.role === 'instructor' || user?.role === 'admin') {
        // For instructor, get conversation between instructor and student
        conversation = await messageService.getConversation(
          message.courseId,
          message.studentId,
          user.id,
          jwt
        );
      } else {
        // For student, get conversation between student and instructor
        // We need to determine the instructor ID from the message
        conversation = await messageService.getConversation(
          message.courseId,
          user.id,
          message.studentId, // This should be instructor ID for student view
          jwt
        );
      }
      
      setConversationMessages(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Không thể tải cuộc trò chuyện');
    }

    if (!message.isRead) {
      try {
        await messageService.markAsRead(message.id, jwt);
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === message.id ? { ...msg, isRead: true } : msg
          )
        );
      } catch (error) {
        console.error('Error marking message as read:', error);
        toast.error('Không thể đánh dấu tin nhắn đã đọc');
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim() || !jwt || !user) {
      toast.error('Vui lòng đăng nhập và nhập nội dung phản hồi');
      return;
    }

    try {
      // Determine receiver ID based on user role
      let receiverId;
      
      if (user.role === 'instructor' || user.role === 'admin') {
        // Instructor is replying to student
        receiverId = selectedMessage.studentId;
      } else {
        // Student is replying to instructor
        receiverId = selectedMessage.studentId; // This should be instructor ID for student view
      }

      const response = await messageService.sendReply(
        selectedMessage.id,
        replyContent,
        user.id,
        receiverId,
        selectedMessage.courseId,
        jwt
      );

      const newMessage: Message = {
        id: response.data.id.toString(),
        content: replyContent,
        courseId: selectedMessage.courseId,
        courseName: selectedMessage.courseName,
        studentId: user.id,
        studentName: user.username || 'Bạn',
        createdAt: new Date().toISOString(),
        isRead: true
      };

      // Emit message through Socket.IO
      socket.emit('send_message', newMessage);

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
        <h1 className="text-3xl font-bold mb-8">
          {user?.role === 'instructor' || user?.role === 'admin' 
            ? 'Tin nhắn từ học viên' 
            : 'Tin nhắn từ giảng viên'}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Danh sách cuộc trò chuyện</h2>
            </div>
            <div className="divide-y">
              {messages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FaCommentDots className="w-8 h-8 mx-auto mb-2" />
                  <p>Chưa có tin nhắn nào</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageSelect(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-indigo-50' : ''
                    } ${!message.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FaUser className="text-indigo-600 mr-2" />
                        <span className="font-medium">
                          {user?.role === 'instructor' || user?.role === 'admin' 
                            ? message.studentName 
                            : message.studentName}
                        </span>
                      </div>
                      {!message.isRead && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Mới
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FaBook className="mr-2" />
                      <span>{message.courseName}</span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{message.content}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md">
            {selectedMessage ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedMessage.studentName}</h2>
                      <p className="text-sm text-gray-500">{selectedMessage.courseName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-4 h-[500px] overflow-y-auto">
                  {conversationMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <FaCommentDots className="w-8 h-8 mx-auto mb-2" />
                      <p>Chưa có tin nhắn nào trong cuộc trò chuyện này</p>
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
                            message.studentId === user?.id ? 'bg-indigo-100' : 'bg-gray-100'
                          } rounded-lg p-3`}>
                            <p className="text-gray-700">{message.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                
                <div className="p-4 border-t">
                  <textarea
                    className="w-full p-3 border rounded-lg mb-4"
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                  ></textarea>
                  <button 
                    onClick={handleReply}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center"
                  >
                    <FaReply className="mr-2" />
                    Gửi phản hồi
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaCommentDots className="w-12 h-12 mx-auto mb-4" />
                  <p>Chọn một cuộc trò chuyện để xem chi tiết</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMessagesPage;