import { useState } from "react";
import { Send, Paperclip } from "lucide-react";

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
    <div className="p-4 border-t border-gray-800 bg-gray-900">
      <div className="flex items-end gap-3">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Paperclip className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500 transition-colors"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
