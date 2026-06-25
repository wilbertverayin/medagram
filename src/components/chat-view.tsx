import React, { useState } from 'react';
import ChatHeader from './chat-header';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import PatientInfoDrawer from './patient-info-drawer';
import { type Chat, type Message, currentUserId, doctors, type Patient, type SoapNotes, type SoapEdit } from '@/lib/data';
import type { SoapAttachedFileGroups, SoapAttachedFile } from '@/lib/data';
import SoapForm from './soap-form';
import { useToast } from '@/hooks/use-toast';
import type { AttachedFiles as SoapFormFiles } from './soap-form';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { ScrollArea } from './ui/scroll-area';


interface ChatViewProps {
  chat: Chat;
  patients: Patient[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  onBack?: () => void;
}

export default function ChatView({ chat, patients, isDrawerOpen, setIsDrawerOpen, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [filteredPatientId, setFilteredPatientId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isSoapFormOpen, setIsSoapFormOpen] = useState(false);
  const [editingSoapNote, setEditingSoapNote] = useState<Message | null>(null);
  const [messageForHistory, setMessageForHistory] = useState<Message | null>(null);
  const { toast } = useToast();

  const handleSendMessage = (content: string, type: Message['type'], options?: { replyingToId?: number, file?: File, patientId?: number | null, editMessageId?: number }) => {
    
    if (options?.editMessageId) {
        setMessages(prev => prev.map(msg => 
            msg.id === options.editMessageId
                ? { ...msg, content, isEdited: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                : msg
        ));
        setEditingMessage(null);
        toast({ title: "Message Edited", variant: "success" });
        return;
    }

    const patientIdForNewMessage = (options?.replyingToId && replyingTo) ? replyingTo.patientId : options?.patientId;

    const newMessage: Message = {
      id: Date.now(), // Use timestamp for unique ID
      senderId: currentUserId,
      patientId: patientIdForNewMessage ?? null,
      type: type,
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: options?.replyingToId,
    };

    if (type !== 'text' && type !== 'soap' && options?.file) {
      const file = options?.file;
      if (file) {
          newMessage.content = URL.createObjectURL(file);
          newMessage.fileName = file.name;
          newMessage.fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      }
    } else if (type !== 'text' && type !== 'soap' && !options?.file) {
        newMessage.fileName = content;
        newMessage.fileSize = `${(Math.random() * 10).toFixed(1)} MB`;
    }


    setMessages(prev => [...prev, newMessage]);
    if (options?.replyingToId) {
        setReplyingTo(null);
    }
  };

  const displayedMessages = filteredPatientId
    ? messages.filter(m => m.patientId === filteredPatientId || m.patientId === null)
    : messages;

  const selectedPatientForDrawer = patients.find(p => p.id === filteredPatientId);

  const handleInfoClick = () => {
    if (selectedPatientForDrawer) {
        setIsDrawerOpen(true);
    }
  }

  const handleSetReply = (message: Message) => {
    setEditingMessage(null);
    setReplyingTo(message);
  }

  const handleCancelReply = () => {
    setReplyingTo(null);
  }

  const handleSetEdit = (message: Message) => {
    setReplyingTo(null);
    setEditingMessage(message);
  }

  const handleCancelEdit = () => {
      setEditingMessage(null);
  }

  const handleShare = async (message: Message) => {
      const url = new URL(window.location.href);
      url.hash = `message-${message.id}`;
      try {
          await navigator.clipboard.writeText(url.toString());
          toast({ title: "Link Copied", description: "Message link copied to clipboard.", variant: "success" });
      } catch (err) {
          toast({ title: "Error", description: "Could not copy link.", variant: "destructive" });
      }
  }

  const handleOpenSoapForm = () => {
    setEditingSoapNote(null);
    setIsSoapFormOpen(true);
  };

  const handleEditSoapNote = (message: Message) => {
    if (message.type === 'soap') {
      setEditingSoapNote(message);
      setIsSoapFormOpen(true);
    }
  };

  const handleViewHistory = (message: Message) => {
    if (message.type === 'soap' && message.editHistory && message.editHistory.length > 0) {
      setMessageForHistory(message);
    }
  };

  const handleSaveSoap = (notes: SoapNotes, newFiles: SoapFormFiles, patient: Patient) => {
    let content = `**SOAP Note for ${patient.name}**\n\n**S:** ${notes.subjective}\n\n**O:** ${notes.objective}\n\n**A:** ${notes.assessment}\n\n**P:** ${notes.plan}`;

    const convertFilesToMessageFormat = (files: File[]): SoapAttachedFile[] => {
      return files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024).toFixed(1)} KB`,
      }));
    };
    
    const newAttachedFiles: SoapAttachedFileGroups = {
      subjective: convertFilesToMessageFormat(newFiles.subjective),
      objective: convertFilesToMessageFormat(newFiles.objective),
      assessment: convertFilesToMessageFormat(newFiles.assessment),
      plan: convertFilesToMessageFormat(newFiles.plan),
    };


    if (editingSoapNote) {
      const newId = Date.now();
      const newEdit: SoapEdit = {
        editorId: currentUserId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        previousContent: editingSoapNote.soapData!,
      };

      const existingFiles = editingSoapNote.attachedFiles || { subjective: [], objective: [], assessment: [], plan: [] };
      const mergedFiles = {
        subjective: [...existingFiles.subjective, ...newAttachedFiles.subjective],
        objective: [...existingFiles.objective, ...newAttachedFiles.objective],
        assessment: [...existingFiles.assessment, ...newAttachedFiles.assessment],
        plan: [...existingFiles.plan, ...newAttachedFiles.plan],
      };

      const newSoapMessage: Message = {
          id: newId,
          senderId: currentUserId,
          patientId: patient.id,
          type: 'soap',
          content: content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          soapData: notes,
          attachedFiles: mergedFiles,
          isEdited: true, // It's an edited version
          editHistory: [...(editingSoapNote.editHistory || []), newEdit],
          originalMessageId: editingSoapNote.id,
      };

      setMessages(prev => {
          const updatedMessages = prev.map(msg => {
              if (msg.id === editingSoapNote.id) {
                  return {
                      ...msg,
                      isArchived: true,
                      latestVersionId: newId,
                  };
              }
              return msg;
          });
          return [...updatedMessages, newSoapMessage];
      });

      toast({ title: "SOAP Note Updated", description: `A new version of the note for ${patient.name} has been created.`, variant: "success" });
    } else {
      const newMessage: Message = {
        id: Date.now(),
        senderId: currentUserId,
        patientId: patient.id,
        type: 'soap',
        content: content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        soapData: notes,
        attachedFiles: newAttachedFiles,
        isEdited: false,
        editHistory: [],
      };
      setMessages(prev => [...prev, newMessage]);
      toast({ title: "SOAP Note Saved", description: `New note for ${patient.name} created.`, variant: "success" });
    }

    setEditingSoapNote(null);
    setIsSoapFormOpen(false);
  };


  return (
    <div className="flex flex-1 h-full">
      <div className="flex flex-col flex-1 h-full bg-background">
        <ChatHeader
          chatName={chat.name}
          patients={patients}
          selectedPatientId={filteredPatientId}
          onSelectPatient={(patientId) => {
            setFilteredPatientId(patientId);
            setReplyingTo(null); // Cancel reply when patient filter changes
          }}
          onInfoClick={handleInfoClick}
          onBack={onBack}
        />
        <div className="flex-1 overflow-y-auto">
             <ChatMessages
                messages={displayedMessages}
                doctors={doctors}
                patients={patients}
                onSetReply={handleSetReply}
                onEditSoapNote={handleEditSoapNote}
                onSetEdit={handleSetEdit}
                onShare={handleShare}
                onViewHistory={handleViewHistory}
            />
        </div>
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
          <ChatInput
            onSendMessage={handleSendMessage}
            replyingTo={replyingTo}
            onCancelReply={handleCancelReply}
            doctors={doctors}
            patients={patients}
            onOpenSoapForm={handleOpenSoapForm}
            editingMessage={editingMessage}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>
      {selectedPatientForDrawer && (
        <PatientInfoDrawer patient={selectedPatientForDrawer} isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      )}
       <SoapForm 
        isOpen={isSoapFormOpen} 
        onOpenChange={setIsSoapFormOpen}
        patients={patients}
        onSave={handleSaveSoap}
        messageToEdit={editingSoapNote}
        initialPatientId={filteredPatientId}
        doctors={doctors}
      />
      {messageForHistory && (
        <AlertDialog open={!!messageForHistory} onOpenChange={(isOpen) => !isOpen && setMessageForHistory(null)}>
            <AlertDialogContent className="max-w-4xl bg-card">
                <AlertDialogHeader>
                    <AlertDialogTitle>SOAP Note Edit History</AlertDialogTitle>
                    <AlertDialogDescription>
                        Showing changes for the note regarding {patients.find(p => p.id === messageForHistory.patientId)?.name}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <ScrollArea className="h-96 pr-4 -mr-4">
                    <div className='space-y-4'>
                        {messageForHistory.editHistory?.map((edit, index) => {
                            const editor = doctors.find(d => d.id === edit.editorId);
                            return (
                            <div key={index} className="p-4 rounded-lg border">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                    <p className="font-semibold">{editor?.name || 'Unknown Doctor'}</p>
                                    <p className="text-sm text-muted-foreground">{edit.timestamp}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><h4 className='font-medium mb-1'>Subjective</h4><p className='text-muted-foreground whitespace-pre-wrap'>{edit.previousContent.subjective}</p></div>
                                    <div><h4 className='font-medium mb-1'>Objective</h4><p className='text-muted-foreground whitespace-pre-wrap'>{edit.previousContent.objective}</p></div>
                                    <div><h4 className='font-medium mb-1'>Assessment</h4><p className='text-muted-foreground whitespace-pre-wrap'>{edit.previousContent.assessment}</p></div>
                                    <div><h4 className='font-medium mb-1'>Plan</h4><p className='text-muted-foreground whitespace-pre-wrap'>{edit.previousContent.plan}</p></div>
                                </div>
                            </div>
                        )})}
                    </div>
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setMessageForHistory(null)}>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
