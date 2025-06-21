import axios from 'axios';

// Ensure API URL always includes /api prefix
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export interface Message {
  id: string;
  content: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string; // unique identifier for the conversation
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isRead: boolean;
}

export const messageService = {
  // Helper function to get course name by courseId
  getCourseName: async (courseId: string, token: string): Promise<string> => {
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data?.name || 'Unknown Course';
    } catch (error) {
      console.error('Error fetching course name:', error);
      return 'Unknown Course';
    }
  },

  // Lấy danh sách conversations cho instructor (nhóm theo student + course)
  getInstructorConversations: async (instructorId: string, token: string): Promise<Conversation[]> => {
    try {
      const response = await axios.get(`${API_URL}/chat-messages`, {
        params: {
          'filters[receiverId][$eq]': instructorId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'populate[course]': true,
          'sort': 'createdAt:desc'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const messages = response.data.data;
      const conversationsMap = new Map<string, Conversation>();

      // Nhóm messages theo student + course
      for (const message of messages) {
        const conversationKey = `${message.senderId}-${message.courseId}`;
        
        let courseName = message.course?.name || 'Unknown Course';
        
        // If course object is null but we have courseId, fetch course name
        if (!message.course && message.courseId) {
          courseName = await messageService.getCourseName(message.courseId, token);
        }
        
        if (!conversationsMap.has(conversationKey)) {
          conversationsMap.set(conversationKey, {
            id: conversationKey,
            courseId: message.courseId || message.course?.id?.toString() || 'unknown',
            courseName: courseName,
            studentId: message.senderId || message.sender?.id?.toString() || 'unknown',
            studentName: message.sender?.username || 'Unknown User',
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount: message.isRead ? 0 : 1,
            isRead: message.isRead || false
          });
        } else {
          // Update unread count cho conversation này
          const conversation = conversationsMap.get(conversationKey)!;
          if (!message.isRead) {
            conversation.unreadCount += 1;
          }
          if (!conversation.isRead && !message.isRead) {
            conversation.isRead = false;
          }
        }
      }

      return Array.from(conversationsMap.values()).sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching instructor conversations:', error);
      throw error;
    }
  },

  getStudentMessages: async (studentId: string, token: string) => {
    try {
      const response = await axios.get(`${API_URL}/chat-messages`, {
        params: {
          'filters[receiver][id][$eq]': studentId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'populate[course]': true
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const messages = response.data.data;
      const processedMessages = [];

      for (const message of messages) {
        let courseName = message.course?.name || 'Unknown Course';
        
        // If course object is null but we have courseId, fetch course name
        if (!message.course && message.courseId) {
          courseName = await messageService.getCourseName(message.courseId, token);
        }

        processedMessages.push({
          id: message.id.toString(),
          content: message.content,
          courseId: message.courseId || message.course?.id?.toString() || 'unknown',
          courseName: courseName,
          studentId: message.senderId || message.sender?.id?.toString() || 'unknown',
          studentName: message.sender?.username || 'Unknown User',
          createdAt: message.createdAt,
          isRead: message.isRead || false
        });
      }

      return processedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Lấy danh sách tin nhắn của giảng viên (deprecated - dùng getInstructorConversations thay thế)
  getInstructorMessages: async (instructorId: string, token: string) => {
    try {
      const response = await axios.get(`${API_URL}/chat-messages`, {
        params: {
          'filters[receiver][id][$eq]': instructorId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'populate[course]': true
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const messages = response.data.data;
      const processedMessages = [];

      for (const message of messages) {
        let courseName = message.course?.name || 'Unknown Course';
        
        // If course object is null but we have courseId, fetch course name
        if (!message.course && message.courseId) {
          courseName = await messageService.getCourseName(message.courseId, token);
        }

        processedMessages.push({
          id: message.id.toString(),
          content: message.content,
          courseId: message.courseId || message.course?.id?.toString() || 'unknown',
          courseName: courseName,
          studentId: message.senderId || message.sender?.id?.toString() || 'unknown',
          studentName: message.sender?.username || 'Unknown User',
          createdAt: message.createdAt,
          isRead: message.isRead || false
        });
      }

      return processedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Lấy toàn bộ cuộc trò chuyện giữa instructor và student cho một course
  getConversation: async (courseId: string, studentId: string, instructorId: string, token: string) => {
    try {
      const response = await axios.get(`${API_URL}/chat-messages`, {
        params: {
          'filters[courseId][$eq]': courseId,
          'filters[$or][0][senderId][$eq]': studentId,
          'filters[$or][0][receiverId][$eq]': instructorId,
          'filters[$or][1][senderId][$eq]': instructorId,
          'filters[$or][1][receiverId][$eq]': studentId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'populate[course]': true,
          'sort': 'createdAt:asc'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const messages = response.data.data;
      const processedMessages = [];

      for (const message of messages) {
        let courseName = message.course?.name || 'Unknown Course';
        
        // If course object is null but we have courseId, fetch course name
        if (!message.course && message.courseId) {
          courseName = await messageService.getCourseName(message.courseId, token);
        }

        processedMessages.push({
          id: message.id.toString(),
          content: message.content,
          courseId: message.courseId || message.course?.id?.toString() || 'unknown',
          courseName: courseName,
          studentId: message.senderId || message.sender?.id?.toString() || 'unknown',
          studentName: message.sender?.username || 'Unknown User',
          createdAt: message.createdAt,
          isRead: message.isRead || false
        });
      }

      return processedMessages;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Gửi phản hồi cho tin nhắn
  sendReply: async (messageId: string, content: string, senderId: string, receiverId: string, courseId: string, token: string) => {
    try {
      console.log('🔗 Sending to URL:', `${API_URL}/chat-messages`);
      const response = await axios.post(
        `${API_URL}/chat-messages`,
        {
          data: {
            content,
            senderId,
            receiverId,
            courseId,
            sender: senderId,
            receiver: receiverId,
            course: courseId
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (messageId: string, token: string) => {
    try {
      const response = await axios.put(
        `${API_URL}/chat-messages/${messageId}`,
        {
          data: {
            isRead: true
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
}; 