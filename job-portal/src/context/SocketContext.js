import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const newSocket = io('http://localhost:8000', {
                auth: { token: localStorage.getItem('accessToken') },
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
                transports: ['websocket', 'polling'] // Fallback to polling if websocket fails
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
            });

            newSocket.on('connect_error', (error) => {
                // Silently handle connection errors - socket.io will retry automatically
                console.warn('Socket connection error (will retry):', error.message);
            });

            newSocket.on('online_users', (users) => {
                setOnlineUsers(users);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

            setSocket(newSocket);

            return () => {
                newSocket.off('connect');
                newSocket.off('connect_error');
                newSocket.off('online_users');
                newSocket.off('disconnect');
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    const value = {
        socket,
        onlineUsers,
        isConnected: !!socket?.connected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
