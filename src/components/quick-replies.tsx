"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"
import { quickReplies } from "@/lib/data"
import { ScrollArea } from "./ui/scroll-area"

interface QuickRepliesProps {
  onSelectReply: (reply: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ onSelectReply, disabled }: QuickRepliesProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" disabled={disabled}>
          <MessageSquarePlus className="h-5 w-5" />
          <span className="sr-only">Quick Replies</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Quick Replies</h4>
            <p className="text-sm text-muted-foreground">
              Select a message to quickly respond.
            </p>
          </div>
          <ScrollArea className="h-48">
            <div className="grid gap-2 pr-4">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto whitespace-normal"
                  onClick={() => onSelectReply(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}