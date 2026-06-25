// src/services/chatService.js
import axios from 'axios';

// SỬA LẠI URL - dùng đúng port 5555
const API_BASE_URL = 'http://localhost:5555/api';  // Đã sửa từ 5000 -> 5555

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const chatService = {
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chat/send', { message });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error.response?.data || { error: 'Network error' };
    }
  },
  
  clearHistory: async () => {
    try {
      const response = await api.post('/chat/clear');
      return response.data;
    } catch (error) {
      console.error('Clear history error:', error);
      throw error;
    }
  },
  
//   getHistory: async () => {
//     try {
//       const response = await api.get('/chat/history');
//       return response.data;
//     } catch (error) {
//       console.error('Get history error:', error);
//       return { history: [] };
//     }
//   },
  
  healthCheck: async () => {
    try {
      const response = await api.get('/chat/health');
      return response.data;
    } catch (error) {
      return { status: 'error' };
    }
  }
};