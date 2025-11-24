export interface Message {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    isFromCustomer: boolean;
    createdAt: string;
}

export interface Conversation {
    id: string;
    platform: string;
    customerName?: string;
    lastMessage?: string;
    lastMessageAt: string;
    messages: Message[];
}
