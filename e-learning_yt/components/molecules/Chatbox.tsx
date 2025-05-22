"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface Message {
  content: string;
  senderId: string;
  receiverId: string;
  courseId: string;
  createdAt: string;
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
  const {jwt} = useAuth();

  useEffect(() => {
    if (!courseId) return;

    // Khi mở, join vào course
    socket.emit('join_course', courseId);

    // Lắng nghe message mới
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [courseId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      // Save message to Strapi
      const response = await fetch('http://localhost:1337/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: {
            content: message,
            sender: {
              id: currentUserId
            },
            receiver: {
              id: instructorId
            },
            course: {
              id: courseId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save message');
      }

      const savedMessage = await response.json();

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

  return (
    <div className="border p-4 rounded shadow w-full max-w-md">
      <div className="h-64 overflow-y-auto border-b mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 ${msg.senderId === currentUserId ? 'text-right' : 'text-left'}`}>
            <span className="inline-block bg-blue-200 p-2 rounded">{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          className="border rounded p-2 flex-grow"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
