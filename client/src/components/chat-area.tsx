import { useEffect, useRef } from "react";
import { type User, type Message } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { MessageCircle, Sparkles } from "lucide-react";

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
  const isOnline = selectedContact ? onlineUsers.has(selectedContact.id) : false;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedContact) {
    return (
      <div className="flex h-full items-center justify-center bg-background gradient-bg">
        <div className="text-center space-y-4 fade-in">
          <div className="relative mx-auto w-fit">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Select a contact to start messaging
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Choose a contact from the list to begin your conversation
          </p>
        </div>
      </div>
    );
  }

  const conversationMessages = messages.filter(
    (msg) =>
      (msg.senderId === currentUserId && msg.receiverId === selectedContact.id) ||
      (msg.senderId === selectedContact.id && msg.receiverId === currentUserId)
  );

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-white/10">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-foreground font-semibold text-lg">
              {selectedContact.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${isOnline ? "bg-green-500 pulse-online" : "bg-gray-500"}`} />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-foreground" data-testid="text-contact-name">
            {selectedContact.username}
          </h2>
          <p className={`text-xs font-medium ${isOnline ? "text-green-400" : "text-muted-foreground"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {conversationMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center fade-in">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hello! 👋
              </p>
            </div>
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

      {/* Message Input */}
      <MessageInput
        ws={ws}
        currentUserId={currentUserId}
        receiverId={selectedContact.id}
      />
    </div>
  );
}
