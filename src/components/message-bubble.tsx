import { cn } from "@/lib/utils";
import type { Message, Doctor, Patient, SoapEdit } from "@/lib/data";
import { currentUserId } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Image as ImageIcon, FileAudio, Database, Download, User, CornerUpLeft, Edit, Link as LinkIcon, History } from "lucide-react";
import { Button } from "./ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MessageBubbleProps {
    message: Message;
    allMessages: Message[];
    doctors: Doctor[];
    patients: Patient[];
    onSetReply: (message: Message) => void;
    onEditSoapNote: (message: Message) => void;
    onSetEdit: (message: Message) => void;
    onShare: (message: Message) => void;
    onViewHistory: (message: Message) => void;
}

const FileIcon = ({ type }: { type: Message['type']}) => {
    switch (type) {
        case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
        case 'image': return <ImageIcon className="h-8 w-8 text-blue-500" />;
        case 'audio': return <FileAudio className="h-8 w-8 text-purple-500" />;
        case 'dicom': return <Database className="h-8 w-8 text-green-500" />;
        default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
}

const FileAttachment = ({ message }: { message: Message }) => {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background border max-w-xs">
            <FileIcon type={message.type} />
            <div className="flex-1 truncate">
                <p className="font-medium text-foreground truncate">{message.fileName}</p>
                <p className="text-sm text-muted-foreground">{message.fileSize}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <a href={message.content} download={message.fileName}>
                    <Download className="h-5 w-5" />
                </a>
            </Button>
        </div>
    )
}

const handleHighlightLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elementId = e.currentTarget.hash.substring(1);
    const element = document.getElementById(elementId);

    if (element) {
        // Remove highlight from any other element to avoid confusion
        document.querySelectorAll('.animate-highlight').forEach(el => el.classList.remove('animate-highlight'));
        
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        element.classList.add('animate-highlight');
        
        setTimeout(() => {
            element.classList.remove('animate-highlight');
        }, 2000);

        // Update the URL hash for navigation history without triggering a page reload
        if (`#${elementId}` !== window.location.hash) {
            window.history.pushState(null, '', `#${elementId}`);
        }
    }
};

const QuotedMessage = ({ message, doctors }: { message: Message; doctors: Doctor[] }) => {
    const sender = doctors.find(doc => doc.id === message.senderId);

    return (
        <a href={`#message-${message.id}`} onClick={handleHighlightLinkClick} className="block p-2 mb-2 rounded-lg bg-black/10 hover:bg-black/20 text-sm">
            <div className="font-semibold">{sender?.name || 'Unknown User'}</div>
            <div className="truncate opacity-80">
                {message.type === 'text' || message.type === 'soap' ? message.content : `Attachment: ${message.fileName}`}
            </div>
        </a>
    )
}

export default function MessageBubble({ message, allMessages, doctors, patients, onSetReply, onEditSoapNote, onSetEdit, onShare, onViewHistory }: MessageBubbleProps) {
    const isUser = message.senderId === currentUserId;
    
    const sender = doctors.find(doc => doc.id === message.senderId);
    const patient = patients.find(p => p.id === message.patientId);

    const repliedToMessage = message.replyTo ? allMessages.find(m => m.id === message.replyTo) : null;

    const isFileMessage = ['pdf', 'audio', 'dicom'].includes(message.type);

     if (message.isArchived) {
        return (
             <div 
                id={`message-${message.id}`}
                className="group flex items-end gap-2 w-full justify-center"
            >
                <div className="text-sm text-muted-foreground italic bg-muted/50 px-4 py-2 rounded-full">
                    This SOAP note has been updated.{' '}
                    <a href={`#message-${message.latestVersionId}`} onClick={handleHighlightLinkClick} className="underline font-semibold text-primary">View latest version.</a>
                </div>
            </div>
        )
    }

    return (
        <div 
            id={`message-${message.id}`}
            className={cn(
                "group flex items-start gap-2 w-full", 
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}>
                {!isUser && sender && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={sender.avatar} alt={sender.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                        {!isUser && <span>{sender?.name}</span>}
                        {patient && (
                            <>
                            {!isUser && <span>&bull;</span>}
                            <TooltipProvider>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-default">
                                        <User className="h-3 w-3" />
                                        <span>{patient.name}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{patient.diagnosis}</p>
                                </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            </>
                        )}
                        <div className="flex items-center gap-0.5 opacity-100 md:group-hover:opacity-100 transition-opacity">
                            {message.type === 'soap' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full"
                                        onClick={() => onViewHistory(message)}
                                        disabled={!message.editHistory || message.editHistory.length === 0}
                                    >
                                        <History className="h-4 w-4" />
                                        <span className="sr-only">View SOAP Note History</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full"
                                        onClick={() => onEditSoapNote(message)}
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit SOAP Note</span>
                                    </Button>
                                </>
                            )}
                            {isUser && message.type === 'text' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full"
                                    onClick={() => onSetEdit(message)}
                                >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit Message</span>
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => onSetReply(message)}
                            >
                                <CornerUpLeft className="h-4 w-4" />
                                <span className="sr-only">Reply</span>
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => onShare(message)}
                            >
                                <LinkIcon className="h-4 w-4" />
                                <span className="sr-only">Share</span>
                            </Button>
                        </div>
                    </div>
                    <div
                        className={cn(
                            "relative rounded-2xl p-3 max-w-md md:max-w-lg break-words",
                             isUser
                                ? "rounded-br-none bg-primary text-primary-foreground"
                                : "rounded-bl-none bg-card text-card-foreground shadow-sm",
                            isFileMessage && "p-0 bg-transparent shadow-none",
                            message.type === 'image' && "p-0 bg-transparent shadow-none",
                            message.type === 'soap' && (isUser ? 'bg-primary/90' : 'bg-card')
                        )}
                    >
                        {repliedToMessage && <QuotedMessage message={repliedToMessage} doctors={doctors} />}
                        {(message.type === 'text' || message.type === 'soap') && (
                             <ReactMarkdown
                                className="prose prose-sm text-current max-w-none"
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    a: ({...props}) => (
                                        <a 
                                            {...props} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={cn("underline", isUser ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary")}
                                        />
                                    ),
                                    p: ({...props}) => <p {...props} className="my-1" />,
                                    strong: ({...props}) => <strong {...props} className="font-bold" />,
                                    h4: ({...props}) => <h4 {...props} className="font-semibold mt-3 mb-1" />,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                        {message.type === 'image' && (
                            <img src={message.content} alt={message.fileName || "Shared image"} className="rounded-lg max-w-xs" data-ai-hint="medical x-ray" />
                        )}
                        {isFileMessage && (
                            <FileAttachment message={message} />
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                        <span>{message.timestamp}</span>
                        {message.isEdited && <span className="text-muted-foreground/80">(edited)</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
