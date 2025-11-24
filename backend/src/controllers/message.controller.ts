import { Request, Response } from 'express';
import prisma from '../prisma';
import { io } from '../server';

export const getConversations = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { assigneeId: userId },
                    // In a real app, we might check if the user has access to the social account
                ]
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        // For MVP, if no conversations found, let's return all conversations for the demo
        // In production, strictly filter by user access
        if (conversations.length === 0) {
            const allConversations = await prisma.conversation.findMany({
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { lastMessageAt: 'desc' }
            });
            return res.json(allConversations);
        }

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    try {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    const { conversationId, content } = req.body;
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        const message = await prisma.message.create({
            data: {
                conversationId,
                content,
                senderId: userId,
                isFromCustomer: false
            }
        });

        // Update conversation last message
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: content,
                lastMessageAt: new Date()
            }
        });

        // Emit to socket room
        io.to(conversationId).emit('newMessage', message);

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message' });
    }
};
