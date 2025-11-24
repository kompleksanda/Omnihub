import React from 'react';
import { Conversation } from '../types';

interface SidebarProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ conversations, selectedId, onSelect }) => {
    return (
        <div className="w-1/3 border-r border-gray-200 h-full overflow-y-auto bg-white">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Inbox</h2>
            </div>
            <ul>
                {conversations.map((conv) => (
                    <li
                        key={conv.id}
                        onClick={() => onSelect(conv.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${selectedId === conv.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                    >
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="font-semibold text-gray-900">{conv.customerName || 'Unknown Customer'}</span>
                            <span className="text-xs text-gray-500">
                                {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className={`px-2 py-0.5 rounded text-xs mr-2 ${conv.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                                    conv.platform === 'whatsapp' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {conv.platform}
                            </span>
                            <p className="truncate">{conv.lastMessage || 'No messages'}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
