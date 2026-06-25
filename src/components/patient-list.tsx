"use client"

import React, { useState } from 'react';
import { Search, Stethoscope } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Chat } from '@/lib/data';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat;
  onSelectChat: (chat: Chat) => void;
}

export default function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full bg-card h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">Medagram</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                selectedChat.id === chat.id ? "bg-secondary" : "hover:bg-muted"
              )}
            >
              <Avatar>
                <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint="logo" />
                <AvatarFallback>{chat.name.substring(0,2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{chat.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.messages[chat.messages.length - 1]?.content || 'No messages yet'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
