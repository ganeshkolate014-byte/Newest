
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { subscribeToChat, sendMessage, User } from '../utils/firebase';

interface ChatTabProps {
    user: User | null;
    isGuest: boolean;
    onRequireLogin: () => void;
}

interface MessageBubbleProps {
    message: ChatMessage;
    isMe: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
        >
            {!isMe && (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden mr-2 shrink-0 border border-zinc-300 dark:border-zinc-700">
                    {message.senderPhoto ? (
                        <img src={message.senderPhoto} alt={message.senderName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-zinc-500">{message.senderName[0]?.toUpperCase() || '?'}</span>
                    )}
                </div>
            )}
            
            <div className={`
                max-w-[75%] px-4 py-3 rounded-2xl relative shadow-sm
                ${isMe 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-[#2c2c2e] text-zinc-900 dark:text-white rounded-tl-sm border border-zinc-200 dark:border-zinc-700'}
            `}>
                {!isMe && (
                    <div className="text-[10px] font-bold opacity-50 mb-1">{message.senderName}</div>
                )}
                <div className="text-[15px] leading-relaxed break-words">{message.text}</div>
                <div className={`text-[9px] mt-1 font-medium ${isMe ? 'text-blue-200' : 'text-zinc-400'}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </motion.div>
    );
};

export const ChatTab: React.FC<ChatTabProps> = ({ user, isGuest, onRequireLogin }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        if (!user || isGuest) return;

        const unsubscribe = subscribeToChat((newMessages) => {
            setMessages(newMessages);
            if (!hasScrolled) {
                // First load scroll
                setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
                setHasScrolled(true);
            } else {
                // Check if user is near bottom, if so, auto scroll
                // Simple version: always scroll on new message for now
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        });
        return () => unsubscribe();
    }, [user, isGuest, hasScrolled]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || sending || !user) return;

        setSending(true);
        try {
            await sendMessage(inputText, user);
            setInputText('');
            // Focus is kept
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setSending(false);
        }
    };

    if (isGuest || !user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-[60vh]">
                <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6">
                    <UserIcon size={40} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Community Chat</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs">
                    Join the conversation. You need to sign in to chat with other users.
                </p>
                <button
                    onClick={onRequireLogin}
                    className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-transform"
                >
                    Sign In / Register
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] relative">
            {/* Header */}
            <div className="px-1 mb-2 shrink-0">
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">Community</p>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Live Chat</h1>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-1 py-4 no-scrollbar mask-linear-fade-vertical">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === user?.uid} />
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="shrink-0 pt-2 pb-20">
                <form 
                    onSubmit={handleSend}
                    className="relative flex items-center gap-2 bg-white dark:bg-[#1c1c1e] p-2 rounded-[1.5rem] shadow-xl border border-zinc-200 dark:border-zinc-800"
                >
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-12 bg-transparent pl-4 pr-2 outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || sending}
                        className="w-12 h-12 rounded-full bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 flex items-center justify-center text-white transition-all shadow-md active:scale-90"
                    >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};
