import axios from 'axios';
import { courseService } from './courseService';

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
  // Lấy danh sách conversations cho instructor (nhóm theo student + course)
  getInstructorConversations: async (instructorId: string, token: string): Promise<Conversation[]> => {
    try {
      const response = await axios.get(`${API_URL}/chat-messages`, {
        params: {
          'filters[receiverId][$eq]': instructorId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'sort': 'createdAt:desc'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const messages = response.data.data;
      const conversationsMap = new Map<string, Conversation>();

      // Nhóm messages theo student + course
      messages
        .filter((message: any) => message && message.courseId && (message.sender || message.senderId)) // Filter out null/undefined messages
        .forEach((message: any) => {
          const conversationKey = `${message.senderId || message.sender?.id}-${message.courseId}`;
          if (!conversationsMap.has(conversationKey)) {
            conversationsMap.set(conversationKey, {
              id: conversationKey,
              courseId: message.courseId?.toString() || '',
              courseName: 'Loading...', // Sẽ được cập nhật sau
              studentId: message.senderId || message.sender?.id?.toString() || '',
              studentName: message.sender?.username || message.sender?.name || 'Unknown Student',
              lastMessage: message.content || '',
              lastMessageAt: message.createdAt || new Date().toISOString(),
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
        });

      // Lấy thông tin course cho tất cả conversations
      const conversations = Array.from(conversationsMap.values());
      const uniqueCourseIds = Array.from(new Set(conversations.map(conv => conv.courseId))) as string[];
      
      const courseNameMap = new Map<string, string>();
      for (const courseId of uniqueCourseIds) {
        if (courseId) {
          try {
            const courseData = await courseService.getCourseById(parseInt(courseId));
            courseNameMap.set(courseId, courseData.name || 'Unknown Course');
            console.log(`📚 Course ${courseId}: ${courseData.name}`);
          } catch (courseError) {
            console.error(`❌ Error fetching course ${courseId}:`, courseError);
            courseNameMap.set(courseId, 'Unknown Course');
          }
        }
      }

      // Cập nhật courseName cho tất cả conversations
      conversations.forEach(conversation => {
        if (conversation.courseId) {
          conversation.courseName = courseNameMap.get(conversation.courseId) || 'Unknown Course';
        }
      });

      return conversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching instructor conversations:', error);
      throw error;
    }
  },

  getStudentMessages: async (studentId: string, token: string) => {
    try {
      console.log('getStudentMessages called with:', { studentId, hasToken: !!token });
      const response = await axios.get(`${API_URL}/chat-messages`, {
        params: {
          'filters[receiver][id][$eq]': studentId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'sort': 'createdAt:desc'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        return [];
      }

      const validMessages = response.data.data.filter((message: any) => {
        const isValid = message && message.courseId && message.sender;
        if (!isValid) {
          console.warn('Filtering out invalid message:', message);
        }
        return isValid;
      });

      console.log('Valid messages after filtering:', validMessages.length);

      // Lấy danh sách unique courseIds
      const uniqueCourseIds = Array.from(new Set(validMessages.map((msg: any) => msg.courseId))) as string[];
      console.log('Unique course IDs:', uniqueCourseIds);

      // Lấy thông tin course cho tất cả courseIds
      const courseNameMap = new Map<string, string>();
      for (const courseId of uniqueCourseIds) {
        try {
          const courseData = await courseService.getCourseById(parseInt(courseId));
          courseNameMap.set(courseId, courseData.name || 'Unknown Course');
          console.log(`📚 Course ${courseId}: ${courseData.name}`);
        } catch (courseError) {
          console.error(`❌ Error fetching course ${courseId}:`, courseError);
          courseNameMap.set(courseId, 'Unknown Course');
        }
      }

      return validMessages.map((message: any) => {
        const courseId = message.courseId?.toString() || '';
        const courseName = courseNameMap.get(courseId) || 'Unknown Course';

        return {
          id: message.id?.toString() || '',
          content: message.content || '',
          courseId: courseId,
          courseName: courseName,
          studentId: message.sender?.id?.toString() || '',
          studentName: message.sender?.username || message.sender?.name || 'Unknown Student',
          createdAt: message.createdAt || new Date().toISOString(),
          isRead: message.isRead || false
        };
      });
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
          'sort': 'createdAt:desc'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const validMessages = response.data.data
        .filter((message: any) => message && message.courseId && message.sender); // Filter out null/undefined messages

      // Lấy danh sách unique courseIds
      const uniqueCourseIds = Array.from(new Set(validMessages.map((msg: any) => msg.courseId))) as string[];
      console.log('Unique course IDs for instructor messages:', uniqueCourseIds);

      // Lấy thông tin course cho tất cả courseIds
      const courseNameMap = new Map<string, string>();
      for (const courseId of uniqueCourseIds) {
        try {
          const courseData = await courseService.getCourseById(parseInt(courseId));
          courseNameMap.set(courseId, courseData.name || 'Unknown Course');
          console.log(`📚 Course ${courseId}: ${courseData.name}`);
        } catch (courseError) {
          console.error(`❌ Error fetching course ${courseId}:`, courseError);
          courseNameMap.set(courseId, 'Unknown Course');
        }
      }

      return validMessages.map((message: any) => {
        const courseId = message.courseId?.toString() || '';
        const courseName = courseNameMap.get(courseId) || 'Unknown Course';

        return {
          id: message.id?.toString() || '',
          content: message.content || '',
          courseId: courseId,
          courseName: courseName,
          studentId: message.sender?.id?.toString() || '',
          studentName: message.sender?.username || message.sender?.name || 'Unknown Student',
          createdAt: message.createdAt || new Date().toISOString(),
          isRead: message.isRead || false
        };
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Lấy toàn bộ cuộc trò chuyện giữa instructor và student cho một course
  getConversation: async (courseId: string, studentId: string, instructorId: string, token: string) => {
    try {
      console.log('🔍 Fetching conversation with params:', { courseId, studentId, instructorId });
      
      const response = await axios.get(`${API_URL}/chat-messages`, {
        params: {
          'filters[courseId][$eq]': courseId,
          'filters[$or][0][senderId][$eq]': studentId,
          'filters[$or][0][receiverId][$eq]': instructorId,
          'filters[$or][1][senderId][$eq]': instructorId,
          'filters[$or][1][receiverId][$eq]': studentId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'sort': 'createdAt:asc'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('📨 Raw response data:', response.data.data?.length, 'messages');

      // Lấy thông tin course từ courseService
      let courseName = 'Unknown Course';
      try {
        const courseData = await courseService.getCourseById(parseInt(courseId));
        courseName = courseData.name || 'Unknown Course';
        console.log('📚 Course data fetched:', { courseId, courseName });
      } catch (courseError) {
        console.error('❌ Error fetching course data:', courseError);
      }

      return response.data.data.map((message: any) => {
        return {
          id: message.id.toString(),
          content: message.content,
          courseId: message.courseId || courseId,
          courseName: courseName, // Sử dụng courseName từ API course
          studentId: message.senderId || message.sender?.id?.toString(),
          studentName: message.sender?.username || message.sender?.name || 'Unknown Student',
          createdAt: message.createdAt,
          isRead: message.isRead || false
        };
      });
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