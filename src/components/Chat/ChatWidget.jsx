// // frontend/src/components/Chat/ChatWidget.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import { useChat } from '../../hooks/useChat';
// import './ChatWidget.css';

// const ChatWidget = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [inputMessage, setInputMessage] = useState('');
//   const { messages, isLoading, error, isConnected, sendMessage, clearHistory } = useChat();
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
  
//   // Auto-scroll khi có tin nhắn mới
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);
  
//   // Focus input khi mở chat
//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isOpen]);
  
//   const handleSend = async () => {
//     if (!inputMessage.trim() || isLoading) return;
//     const message = inputMessage;
//     setInputMessage('');
//     await sendMessage(message);
//   };
  
//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };
  
//   const formatTime = (timestamp) => {
//     if (!timestamp) return '';
//     return new Date(timestamp).toLocaleTimeString('vi-VN', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };
  
//   return (
//     <div className="chat-widget-container">
//       {/* Nút mở chat */}
//       {!isOpen && (
//         <button 
//           className="chat-toggle-btn"
//           onClick={() => setIsOpen(true)}
//           aria-label="Open chat"
//         >
//           <div className="chat-toggle-icon">💬</div>
//           {!isConnected && <div className="offline-badge">!</div>}
//         </button>
//       )}
      
//       {/* Cửa sổ chat */}
//       {isOpen && (
//         <div className="chat-window">
//           {/* Header */}
//           <div className="chat-header">
//             <div className="chat-header-info">
//               <span className="chat-header-icon">🤖</span>
//               <div>
//                 <h3>Hỗ trợ khách hàng</h3>
//                 <p className="chat-status">
//                   {isConnected ? '🟢 Đang hoạt động' : '🔴 Mất kết nối'}
//                 </p>
//               </div>
//             </div>
//             <div className="chat-header-actions">
//               <button 
//                 className="chat-clear-btn"
//                 onClick={clearHistory}
//                 title="Xóa lịch sử"
//               >
//                 🗑️
//               </button>
//               <button 
//                 className="chat-close-btn"
//                 onClick={() => setIsOpen(false)}
//                 title="Đóng"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>
          
//           {/* Danh sách tin nhắn */}
//           <div className="chat-messages">
//             {messages.map((msg, idx) => (
//               <div 
//                 key={idx} 
//                 className={`chat-message ${msg.role}`}
//               >
//                 <div className="message-avatar">
//                   {msg.role === 'user' ? '👤' : '🤖'}
//                 </div>
//                 <div className="message-bubble">
//                   <div className="message-text">{msg.content}</div>
//                   {msg.timestamp && (
//                     <div className="message-time">{formatTime(msg.timestamp)}</div>
//                   )}
//                 </div>
//               </div>
//             ))}
            
//             {/* Loading indicator */}
//             {isLoading && (
//               <div className="chat-message assistant">
//                 <div className="message-avatar">🤖</div>
//                 <div className="message-bubble typing-indicator">
//                   <span></span>
//                   <span></span>
//                   <span></span>
//                 </div>
//               </div>
//             )}
            
//             {/* Error message */}
//             {error && (
//               <div className="chat-error">
//                 ⚠️ {error}
//               </div>
//             )}
            
//             <div ref={messagesEndRef} />
//           </div>
          
//           {/* Input area */}
//           <div className="chat-input-area">
//             <textarea
//               ref={inputRef}
//               className="chat-input"
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Nhập tin nhắn..."
//               rows="1"
//               disabled={isLoading || !isConnected}
//             />
//             <button 
//               className="chat-send-btn"
//               onClick={handleSend}
//               disabled={isLoading || !inputMessage.trim() || !isConnected}
//             >
//               {isLoading ? '...' : 'Gửi'}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWidget;