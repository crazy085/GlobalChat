import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, X } from "lucide-react";

interface MessageInputProps {
  ws: WebSocket | null;
  currentUserId: string;
  receiverId: string;
  channelId?: string;
  senderName?: string;
}

export function MessageInput({ 
  ws, 
  currentUserId, 
  receiverId, 
  channelId,
  senderName 
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSend = () => {
    if (!message.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const messageData: any = {
      type: "message",
      senderId: currentUserId,
      content: message.trim(),
      senderName: senderName || "User",
    };

    if (channelId) {
      messageData.channelId = channelId;
    } else {
      messageData.receiverId = receiverId;
    }

    ws.send(JSON.stringify(messageData));
    setMessage("");
    setSelectedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    
    const typingData: any = {
      type: "typing",
      senderId: currentUserId,
    };

    if (channelId) {
      typingData.channelId = channelId;
    } else {
      typingData.receiverId = receiverId;
    }

    ws.send(JSON.stringify(typingData));
  };

  return (
    <div className="border-t border-white/10 p-4 glass-dark">
      <div className="flex items-end gap-3">
        <input
          type="file"
          id="file-input"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          data-testid="input-file"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => document.getElementById("file-input")?.click()}
          className="h-11 w-11 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-200 flex-shrink-0"
          data-testid="button-attach-file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          className="resize-none min-h-11 max-h-32 text-base rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
          rows={1}
          data-testid="input-message"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
          className="h-11 w-11 rounded-full flex-shrink-0 gradient-primary hover-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-send"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      {selectedFile && (
        <div className="flex items-center gap-2 text-xs bg-white/5 p-2.5 rounded-xl mt-3 border border-white/10 fade-in">
          <span className="truncate text-foreground">{selectedFile.name}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            data-testid="button-remove-file"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
