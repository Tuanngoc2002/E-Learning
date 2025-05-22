import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

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

export const messageService = {
  getStudentMessages: async (studentId: string, token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat-messages`, {
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

      return response.data.data.map((message: any) => ({
        id: message.id.toString(),
        content: message.content,
        courseId: message.course.id.toString(),
        courseName: message.course.name,
        studentId: message.sender.id.toString(),
        studentName: message.sender.username,
        createdAt: message.createdAt,
        isRead: message.isRead || false
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  // Lấy danh sách tin nhắn của giảng viên
  getInstructorMessages: async (instructorId: string, token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat-messages`, {
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

      return response.data.data.map((message: any) => ({
        id: message.id.toString(),
        content: message.content,
        courseId: message.course.id.toString(),
        courseName: message.course.name,
        studentId: message.sender.id.toString(),
        studentName: message.sender.username,
        createdAt: message.createdAt,
        isRead: message.isRead || false
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Lấy toàn bộ cuộc trò chuyện giữa instructor và student
  getConversation: async (courseId: string, studentId: string, instructorId: string, token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat-messages`, {
        params: {
          'filters[course][id][$eq]': courseId,
          'filters[$or][0][sender][id][$eq]': studentId,
          'filters[$or][0][receiver][id][$eq]': instructorId,
          'filters[$or][1][sender][id][$eq]': instructorId,
          'filters[$or][1][receiver][id][$eq]': studentId,
          'populate[sender]': true,
          'populate[receiver]': true,
          'populate[course]': true,
          'sort': 'createdAt:asc'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.data.map((message: any) => ({
        id: message.id.toString(),
        content: message.content,
        courseId: message.course.id.toString(),
        courseName: message.course.name,
        studentId: message.sender.id.toString(),
        studentName: message.sender.username,
        createdAt: message.createdAt,
        isRead: message.isRead || false
      }));
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Gửi phản hồi cho tin nhắn
  sendReply: async (messageId: string, content: string, senderId: string, receiverId: string, courseId: string, token: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/chat-messages`,
        {
          data: {
            content,
            sender: senderId,
            receiver: receiverId,
            course: courseId
          }
        },
        {
          headers: {
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