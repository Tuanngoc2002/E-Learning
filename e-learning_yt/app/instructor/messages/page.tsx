"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCommentDots, FaUser, FaBook } from 'react-icons/fa';

interface Message {
  id: string;
  content: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  createdAt: string;
}

const InstructorMessagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // TODO: Replace with actual API call to fetch messages
    const fetchMessages = async () => {
      try {
        // Simulated data - replace with actual API call
        const mockMessages: Message[] = [
          {
            id: '1',
            content: 'Xin chào, tôi có câu hỏi về bài học số 3',
            courseId: '1',
            courseName: 'Khóa học React cơ bản',
            studentId: '1',
            studentName: 'Nguyễn Văn A',
            createdAt: '2024-03-20T10:00:00Z'
          },
          // Add more mock messages as needed
        ];
        setMessages(mockMessages);
      } catch (err) {
        setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isAuthenticated, user, router]);

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
    <div className="min-h-screen pt-[66px] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tin nhắn từ học viên</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Messages List */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Danh sách tin nhắn</h2>
            </div>
            <div className="divide-y">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <FaUser className="text-indigo-600 mr-2" />
                    <span className="font-medium">{message.studentName}</span>
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
              ))}
            </div>
          </div>

          {/* Message Detail */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            {selectedMessage ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Chi tiết tin nhắn</h2>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <FaUser className="text-indigo-600 mr-2" />
                      <span className="font-medium">{selectedMessage.studentName}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <FaBook className="text-indigo-600 mr-2" />
                      <span>{selectedMessage.courseName}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedMessage.content}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <textarea
                      className="w-full p-3 border rounded-lg mb-4"
                      rows={4}
                      placeholder="Nhập phản hồi của bạn..."
                    ></textarea>
                    <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaCommentDots className="w-12 h-12 mx-auto mb-4" />
                  <p>Chọn một tin nhắn để xem chi tiết</p>
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