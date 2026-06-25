import React, { useEffect, useRef } from 'react';
import type { Message, Patient, Doctor } from '@/lib/data';
import MessageBubble from './message-bubble';
import { ScrollArea } from './ui/scroll-area';

interface ChatMessagesProps {
  messages: Message[];
  patients: Patient[];
  doctors: Doctor[];
  onSetReply: (message: Message) => void;
  onEditSoapNote: (message: Message) => void;
  onSetEdit: (message: Message) => void;
  onShare: (message: Message) => void;
  onViewHistory: (message: Message) => void;
}

export default function ChatMessages({ messages, patients, doctors, onSetReply, onEditSoapNote, onSetEdit, onShare, onViewHistory }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // This effect handles highlighting when a page is loaded with a hash in the URL.
  // It runs only once on mount.
  useEffect(() => {
    if (!viewportRef.current) return;

    const hash = window.location.hash;
    if (hash) {
      try {
        const elementId = hash.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          element.classList.add('animate-highlight');
          setTimeout(() => {
            element.classList.remove('animate-highlight');
          }, 2000);
        }
      } catch (e) {
        console.error("Error handling hash link", e);
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  // This effect handles scrolling to the bottom when new messages arrive.
  useEffect(() => {
    if (viewportRef.current) {
        // We only auto-scroll if the user isn't looking at a specific message via a hash link.
        if (!window.location.hash) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
    }
  }, [messages]); // Reruns whenever messages array changes.

  return (
    <ScrollArea className="h-full" viewportRef={viewportRef} ref={scrollAreaRef}>
      <div className="space-y-6 p-4">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            allMessages={messages}
            doctors={doctors} 
            patients={patients} 
            onSetReply={onSetReply}
            onEditSoapNote={onEditSoapNote}
            onSetEdit={onSetEdit}
            onShare={onShare}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
