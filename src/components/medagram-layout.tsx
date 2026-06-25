"use client"

import React, { useState } from 'react';
import ChatList from './patient-list';
import ChatView from './chat-view';
import { chats, patients, type Chat } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function MedagramLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat>(chats[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'chat'>('list');

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setActiveView('chat');
  };

  const handleBack = () => {
    setActiveView('list');
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className={cn(
        "w-full h-full md:w-80 md:flex md:flex-col md:flex-shrink-0 border-r",
        activeView === 'chat' && 'hidden md:flex'
      )}>
        <ChatList 
          chats={chats} 
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
        />
      </aside>

      <main className={cn(
        "flex-1 flex-col h-full",
        activeView === 'list' ? 'hidden md:flex' : 'flex'
      )}>
        <ChatView 
          key={selectedChat.id} 
          chat={selectedChat}
          patients={patients}
          isDrawerOpen={isDrawerOpen} 
          setIsDrawerOpen={setIsDrawerOpen}
          onBack={handleBack}
        />
      </main>
    </div>
  );
}
