import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar'

const Messages = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);

    // Fetch all conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/messages/conversations');
            setConversations(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages when conversation changes
    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation);
            markAsRead(activeConversation);
        }
    }, [activeConversation]);

    const fetchMessages = async (convId) => {
        setMessagesLoading(true);
        try {
            const response = await api.get(`/messages/${convId}`);
            setMessages(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setMessagesLoading(false);
        }
    };

    const markAsRead = async (convId) => {
        try {
            await api.post(`/messages/${convId}/mark-read`);
            // Refresh conversations to update unread counts
            fetchConversations();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Socket.IO real-time message receiving
    useEffect(() => {
        if (!socket || !activeConversation) return;

        socket.emit('join_conversation', activeConversation);

        const handleNewMessage = (message) => {
            if (message.conversationId === activeConversation) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
            // Refresh conversation list to update lastMessage
            fetchConversations();
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, activeConversation]);

    // Send a message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        setSending(true);
        const messageContent = newMessage;
        setNewMessage(''); // Clear input immediately for better UX

        try {
            await api.post(`/messages/${activeConversation}/send`, {
                content: messageContent
            });
            // Don't add to local state - socket will handle it to avoid duplicates
        } catch (error) {
            toast.error('Failed to send message');
            setNewMessage(messageContent); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    // Get the other participant in the conversation
    const getOtherParticipant = (conv) => {
        return conv.participants?.find(p => p._id !== user?._id);
    };

    // Handle delete conversation
    const handleDeleteConversation = async () => {
        if (!conversationToDelete) return;

        try {
            await api.delete(`/messages/${conversationToDelete}`);
            fetchConversations();
            if (activeConversation === conversationToDelete) {
                setActiveConversation(null);
            }
            setShowDeleteModal(false);
            setConversationToDelete(null);
            toast.success("Conversation deleted");
        } catch (err) {
            console.error("Error deleting conversation:", err);
            toast.error("Failed to delete conversation");
            setShowDeleteModal(false);
            setConversationToDelete(null);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="mb-8 flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Go back"
                        >
                            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
                            <p className="text-slate-600 mt-1">Your conversations with recruiters and applicants</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                        {/* Conversations List */}
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-100">
                                <h2 className="font-semibold text-slate-800">Conversations</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-medium text-slate-800 mb-1">No conversations yet</h3>
                                        <p className="text-sm text-slate-500 mb-4">
                                            {user?.role === 'applicant'
                                                ? 'Go to "My Applications" and click "Message"'
                                                : 'Go to job applications and click "Message"'
                                            }
                                        </p>
                                        <Link
                                            to={user?.role === 'applicant' ? '/employee/my-applications' : '/employee/jobs'}
                                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            {user?.role === 'applicant' ? 'My Applications' : 'My Jobs'}
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {conversations.map((conv) => {
                                            const other = getOtherParticipant(conv);
                                            const unreadCount = conv.unreadCount?.get?.(user?._id) || conv.unreadCount?.[user?._id] || 0;
                                            const hasUnread = unreadCount > 0;

                                            return (
                                                <div key={conv._id} className="relative">
                                                    <div
                                                        onClick={() => setActiveConversation(conv._id)}
                                                        className={`w-full p-4 cursor-pointer hover:bg-slate-50 transition-colors relative ${activeConversation === conv._id
                                                            ? 'bg-blue-50 border-l-4 border-blue-600'
                                                            : hasUnread
                                                                ? 'bg-blue-50/50 border-l-4 border-blue-400'
                                                                : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold relative">
                                                                {other?.fullname?.[0]?.toUpperCase() || '?'}
                                                                {hasUnread && (
                                                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium truncate ${hasUnread ? 'text-slate-900' : 'text-slate-800'}`}>
                                                                    {other?.fullname || 'Unknown'}
                                                                </p>
                                                                <p className={`text-xs truncate ${hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                                                                    {conv.lastMessage?.content || 'Start chatting...'}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setConversationToDelete(conv._id);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete conversation"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                            {activeConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {getOtherParticipant(conversations.find(c => c._id === activeConversation))?.fullname?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {getOtherParticipant(conversations.find(c => c._id === activeConversation))?.fullname || 'Chat'}
                                                </p>
                                                <p className="text-xs text-green-600">● Online</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Container */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                        {messagesLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                No messages yet. Send the first message!
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                                                return (
                                                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[70%] p-3 rounded-2xl ${isOwn
                                                            ? 'bg-blue-600 text-white rounded-br-none'
                                                            : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-none'
                                                            }`}>
                                                            <p className="text-sm">{msg.content}</p>
                                                            <p className={`text-[10px] mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            {sending ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <>
                                                    Send
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-800 mb-1">Select a conversation</h3>
                                        <p className="text-sm text-slate-500">Choose from the list on the left to start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Conversation Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Conversation?</h3>
                            <p className="text-slate-600 mb-6">
                                Are you sure you want to delete this conversation? All messages will be permanently removed. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setConversationToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConversation}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Messages;
