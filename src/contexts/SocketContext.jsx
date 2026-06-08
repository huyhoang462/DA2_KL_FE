// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
// Giả sử bạn có hook hoặc logic lấy thông tin user đang đăng nhập
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth(); // Lấy user ID hiện tại

  useEffect(() => {
    // Chỉ kết nối khi user đã đăng nhập
    if (user && isAuthenticated) {
      const newSocket = io('http://localhost:3001', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      // Lắng nghe khi kết nối thành công rồi mới emit để đảm bảo không bị mất gói tin
      newSocket.on('connect', () => {
        console.log(
          '[SOCKET FE] Kết nối thành công với Server ID:',
          newSocket.id
        );

        // Đảm bảo lấy đúng ID (Kiểm tra xem user._id hay user.id)
        const userId = user._id || user.id;
        console.log('[SOCKET FE] Đang gửi ID định danh lên BE:', userId);

        newSocket.emit('addNewUser', userId);
      });

      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
