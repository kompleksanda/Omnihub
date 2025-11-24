'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { Conversation, Message } from '@/types';
import { useRouter } from 'next/navigation';

export default function InboxPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    useEffect(() => {
        if (!token) {
            router.push('/');
            return;
        }

        // Fetch conversations
        fetch('http://localhost:5000/api/messages/conversations', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/');
                    throw new Error('Unauthorized');
                }
                return res.json();
            })
            .then(data => setConversations(data))
            .catch(err => console.error(err));

        // Connect socket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token, router]);

    useEffect(() => {
        if (selectedId && token) {
            // Fetch messages
            fetch(`http://localhost:5000/api/messages/${selectedId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(err => console.error(err));

            // Join socket room
            socket?.emit('joinConversation', selectedId);
        }
    }, [selectedId, token, socket]);

    useEffect(() => {
        if (socket) {
            socket.on('newMessage', (message: Message) => {
                if (selectedId === message.conversationId) { // @ts-ignore
                    setMessages(prev => [...prev, message]);
                }

                // Update conversation list preview
                setConversations(prev => prev.map(conv => {
                    // @ts-ignore
                    if (conv.id === message.conversationId) {
                        return {
                            ...conv,
                            lastMessage: message.content,
                            lastMessageAt: message.createdAt
                        };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()));
            });
        }
    }, [socket, selectedId]);

    const handleSendMessage = (content: string) => {
        if (!selectedId || !token) return;

        fetch('http://localhost:5000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ conversationId: selectedId, content })
        })
            .then(res => res.json())
            .catch(err => console.error(err));
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
            <ChatWindow
                conversation={conversations.find(c => c.id === selectedId)}
                messages={messages}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}
