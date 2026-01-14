import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';

const Messenger = ({ conversationId, onClose }) => {
    const { user } = useAuth();
    const { messages, sendMessage, isSending, typingUsers, sendTyping } = useChat(conversationId);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        sendMessage(newMessage);
        setNewMessage('');
        sendTyping(false);
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        sendTyping(e.target.value.length > 0);
    };

    return (
        <div className="flex flex-col h-[500px] w-96 bg-white shadow-2xl rounded-2xl border border-slate-200 fixed bottom-6 right-6 z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                        💬
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Messenger</h3>
                        <p className="text-[10px] text-slate-400">Online</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded">
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.senderId._id === user._id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId._id === user._id
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-tl-none'
                            }`}>
                            {msg.content}
                            <div className={`text-[9px] mt-1 ${msg.senderId._id === user._id ? 'text-blue-200' : 'text-slate-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {Object.values(typingUsers).some(Boolean) && (
                <div className="px-4 py-1 text-[10px] text-slate-500 italic">
                    Someone is typing...
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                    disabled={isSending || !newMessage.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Messenger;
