// frontend/src/hooks/useChat.js
import { useState, useCallback, useEffect } from 'react';
import { chatService } from '../services/chatService';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // Load welcome message khi component mount (KHÔNG gọi getHistory)
  useEffect(() => {
    // Đặt tin nhắn chào mừng mặc định
    setMessages([
      {
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý hỗ trợ của cửa hàng LEGO và mô hình xe 1:64. Tôi có thể giúp gì cho bạn hôm nay? 😊'
      }
    ]);
    
    // Kiểm tra kết nối
    const checkConnection = async () => {
      try {
        const health = await chatService.healthCheck();
        setIsConnected(health.status === 'ok');
      } catch (err) {
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);
  
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;
    
    const userMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatService.sendMessage(content.trim());
      
      if (response.success) {
        const botMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setError(response.error || 'Không thể gửi tin nhắn');
      }
    } catch (err) {
      setError(err.error || 'Mất kết nối đến server');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  
  const clearHistory = useCallback(async () => {
    try {
      await chatService.clearHistory();
      setMessages([
        {
          role: 'assistant',
          content: 'Đã xóa lịch sử. Tôi có thể giúp gì cho bạn hôm nay? 😊'
        }
      ]);
      setError(null);
    } catch (err) {
      setError('Không thể xóa lịch sử');
    }
  }, []);
  
  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    clearHistory
  };
};