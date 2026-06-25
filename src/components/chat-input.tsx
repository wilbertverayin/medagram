"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Notebook, X, CornerUpLeft, Edit } from 'lucide-react';
import { QuickReplies } from './quick-replies';
import { useToast } from '@/hooks/use-toast';
import type { Message, Patient, Doctor } from '@/lib/data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ChatInputProps {
  onSendMessage: (content: string, type: Message['type'], options?: { replyingToId?: number; file?: File, patientId?: number | null, editMessageId?: number }) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  doctors: Doctor[];
  patients: Patient[];
  onOpenSoapForm: () => void;
  editingMessage: Message | null;
  onCancelEdit: () => void;
}

export default function ChatInput({ onSendMessage, replyingTo, onCancelReply, doctors, patients, onOpenSoapForm, editingMessage, onCancelEdit }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [messagePatientId, setMessagePatientId] = useState<string>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editingMessage) {
        setMessage(editingMessage.content);
    } else {
        setMessage('');
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyingTo?.patientId) {
      setMessagePatientId(replyingTo.patientId.toString());
    } else if (!replyingTo) {
      setMessagePatientId('none');
    }
  }, [replyingTo]);


  const handleSend = () => {
    if (message.trim()) {
      const options = editingMessage 
        ? { editMessageId: editingMessage.id } 
        : { replyingToId: replyingTo?.id, patientId: messagePatientId === 'none' ? null : Number(messagePatientId) };
      onSendMessage(message, 'text', options);
      setMessage('');
      if (!replyingTo) {
        setMessagePatientId('none');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReplySelect = (reply: string) => {
    setMessage(reply);
  };
  
  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      let fileType: Message['type'] = 'pdf';
      if (file.type.startsWith('image/')) fileType = 'image';
      if (file.type.startsWith('audio/')) fileType = 'audio';

      const patientIdForFile = messagePatientId === 'none' ? null : Number(messagePatientId);
      
      onSendMessage(file.name, fileType, { file: file, replyingToId: replyingTo?.id, patientId: patientIdForFile });

      toast({
        title: "File Attached",
        description: `${file.name} has been sent.`,
        variant: "success",
      });
    }
  };
  
  const handleSoapButtonClick = () => {
    onOpenSoapForm();
  };

  const repliedToSender = replyingTo ? doctors.find(d => d.id === replyingTo.senderId) : null;
  const isEditing = !!editingMessage;

  return (
    <div className="flex flex-col gap-2">
        {isEditing && (
             <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-input">
                <Edit className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                    <p className="font-semibold text-primary">Editing message</p>
                    <p className="text-sm text-muted-foreground truncate">{editingMessage.content}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onCancelEdit}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}
        {replyingTo && !isEditing && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-input">
                <CornerUpLeft className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                    <a href={`#message-${replyingTo.id}`} className="font-semibold text-primary hover:underline">{repliedToSender?.name || 'Unknown User'}</a>
                    <p className="text-sm text-muted-foreground truncate">
                        {replyingTo.type === 'text' || replyingTo.type === 'soap' ? replyingTo.content : `File: ${replyingTo.fileName}`}
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onCancelReply}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}

        <div className="flex items-center gap-2 border-t pt-2">
            <Select onValueChange={setMessagePatientId} value={messagePatientId}>
                <SelectTrigger className="w-auto max-w-[240px] flex-shrink-0 bg-background text-sm">
                    <SelectValue placeholder="Associate Patient..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">No Patient Association</SelectItem>
                    {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex-grow" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={handleSoapButtonClick}
                  >
                      <Notebook className="h-5 w-5" />
                      <span className="sr-only">SOAP Note</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Create SOAP Note</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <QuickReplies onSelectReply={handleQuickReplySelect} />
            
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={handleFileAttach}>
                            <Paperclip className="h-5 w-5" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Attach file</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

        <div className="flex items-end gap-2">
            <div className="relative flex-1">
                <Textarea
                    placeholder="Message channel..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[48px] max-h-48 rounded-2xl text-base resize-none"
                    rows={1}
                />
            </div>
            
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          
            <Button 
                size="icon" 
                className="rounded-full h-12 w-12 shrink-0" 
                onClick={handleSend} 
                disabled={!message.trim()}
            >
                <Send className="h-6 w-6" />
                <span className="sr-only">{isEditing ? 'Save Changes' : 'Send message'}</span>
            </Button>
        </div>
    </div>
  );
}