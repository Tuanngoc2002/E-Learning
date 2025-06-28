"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { FiSend, FiUser } from "react-icons/fi";

interface Message {
  id?: number;
  content: string;
  senderId: string;
  receiverId: string;
  courseId: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
  };
}

interface ChatBoxProps {
  courseId: string;
  instructorId: string;
  currentUserId: string;
}

const socket = io('http://localhost:4000'); // URL server websocket

const ChatBox = ({ courseId, instructorId, currentUserId }: ChatBoxProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { jwt } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch tin nhắn cũ khi component load
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!courseId || !jwt) return;

      try {
        setIsLoading(true);
        console.log('🔍 Fetching chat history for course:', courseId);
        const response = await fetch(
          `https://e-learning-smbe.onrender.com/api/chat-messages?filters[course][id][$eq]=${courseId}&populate=sender&sort=createdAt:asc`,
          {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('📚 Loaded chat history:', data.data);
          setMessages(data.data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId || msg.sender?.id?.toString(),
            receiverId: msg.receiverId,
            courseId: msg.courseId || courseId,
            createdAt: msg.createdAt,
            sender: msg.sender
          })));
        } else {
          console.error('❌ Failed to fetch chat history:', response.status);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [courseId, jwt]);

  useEffect(() => {
    if (!courseId) return;

    // Khi mở, join vào course
    socket.emit('join_course', courseId);

    // Lắng nghe message mới
    socket.on('receive_message', (data) => {
      console.log('📩 Received new message:', data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [courseId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      console.log('📤 Sending message:', { content: message, senderId: currentUserId, receiverId: instructorId, courseId });
      
      // Save message to Strapi
      const response = await fetch('https://e-learning-smbe.onrender.com/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: {
            content: message,
            senderId: currentUserId,
            receiverId: instructorId,
            courseId: courseId,
            // Also include relation format for backward compatibility
            sender: currentUserId,
            receiver: instructorId,
            course: courseId
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to save message:', errorData);
        throw new Error('Failed to save message');
      }

      const savedMessage = await response.json();
      console.log('✅ Message saved:', savedMessage.data);

      // Emit message through Socket.IO
      socket.emit('send_message', {
        content: message,
        senderId: currentUserId,
        receiverId: instructorId,
        courseId: courseId,
        createdAt: new Date().toISOString(),
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMyMessage = (senderId: string) => senderId === currentUserId;

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <FiUser className="w-5 h-5 mr-2" />
        <div>
          <h4 className="font-semibold text-sm">Course Chat</h4>
          <p className="text-xs opacity-90">Ask questions to instructor</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FiUser className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={msg.id || index} className={`flex ${isMyMessage(msg.senderId) ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  isMyMessage(msg.senderId)
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    isMyMessage(msg.senderId) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{ minHeight: '36px', maxHeight: '80px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
