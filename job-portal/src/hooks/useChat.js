import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export function useChat(conversationId) {
    const { socket } = useSocket();
    const queryClient = useQueryClient();
    const [typingUsers, setTypingUsers] = useState({});

    // 1. Fetch message history
    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            const res = await api.get(`/messages/${conversationId}`);
            return res.data.data;
        },
        enabled: !!conversationId
    });

    // 2. Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (content) => {
            const res = await api.post(`/messages/${conversationId}/send`, { content });
            return res.data.data;
        },
        onSuccess: (newMessage) => {
            // Optimistically update cache (optional) or just wait for socket
            queryClient.setQueryData(['messages', conversationId], (old) => [...old, newMessage]);
        }
    });

    // 3. Socket event handlers
    useEffect(() => {
        if (!socket || !conversationId) return;

        socket.emit('join_conversation', conversationId);

        const handleNewMessage = (message) => {
            if (message.conversationId === conversationId) {
                queryClient.setQueryData(['messages', conversationId], (old = []) => {
                    // Avoid duplicates
                    if (old.find(m => m._id === message._id)) return old;
                    return [...old, message];
                });
            }
        };

        const handleTyping = ({ userId, isTyping }) => {
            setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
        };
    }, [socket, conversationId, queryClient]);

    const sendTyping = useCallback((isTyping) => {
        if (socket && conversationId) {
            socket.emit('typing', { conversationId, isTyping });
        }
    }, [socket, conversationId]);

    return {
        messages,
        isLoading,
        sendMessage: sendMessageMutation.mutate,
        isSending: sendMessageMutation.isPending,
        typingUsers,
        sendTyping
    };
}
