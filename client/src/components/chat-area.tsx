import { useEffect, useRef } from "react";
import { type User, type Message } from "@shared/schema";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { MessageCircle } from "lucide-react";

interface ChatAreaProps {
  selectedContact: User | null;
  messages: Message[];
  ws: WebSocket | null;
  currentUserId: string;
  onlineUsers?: Set<string>;
}

export function ChatArea({
  selectedContact,
  messages,
  ws,
  currentUserId,
  onlineUsers = new Set(),
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOnline = selectedContact ? onlineUsers.has(selectedContact.id) : false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedContact) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900">
        <div className="p-6 rounded-full bg-gray-800 mb-4">
          <MessageCircle className="h-12 w-12 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Select a conversation
        </h3>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Choose a contact from the list to start chatting
        </p>
      </div>
    );
  }

  const conversationMessages = messages.filter(
    (msg) =>
      (msg.senderId === currentUserId && msg.receiverId === selectedContact.id) ||
      (msg.senderId === selectedContact.id && msg.receiverId === currentUserId)
  );

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
            {selectedContact.username.charAt(0).toUpperCase()}
          </div>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          />
        </div>
        <div>
          <h2 className="font-semibold text-white">{selectedContact.username}</h2>
          <p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 text-sm">
              No messages yet. Say hello! 👋
            </p>
          </div>
        ) : (
          conversationMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        ws={ws}
        currentUserId={currentUserId}
        receiverId={selectedContact.id}
      />
    </div>
  );
}
