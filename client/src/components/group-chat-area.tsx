import { useEffect, useRef } from "react";
import { type Channel, type Message, type User, type Reaction } from "@shared/schema";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { Hash, Users } from "lucide-react";

interface GroupChatAreaProps {
  selectedChannel: Channel | null;
  messages: Message[];
  ws: WebSocket | null;
  currentUserId: string;
  currentUsername: string;
  channelMembers: User[];
  typingUsers: Set<string>;
  reactions: Map<string, Reaction[]>;
  onAddReaction: (messageId: string, emoji: string) => void;
}

export function GroupChatArea({
  selectedChannel,
  messages,
  ws,
  currentUserId,
  currentUsername,
  channelMembers,
  typingUsers,
  reactions,
  onAddReaction,
}: GroupChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedChannel) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900">
        <div className="p-6 rounded-full bg-gray-800 mb-4">
          <Hash className="h-12 w-12 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Select a channel
        </h3>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Choose a channel from the list to start chatting
        </p>
      </div>
    );
  }

  const channelMessages = messages.filter(
    (msg) => msg.channelId === selectedChannel.id
  );

  const typingUserNames = channelMembers
    .filter((m) => typingUsers.has(m.id) && m.id !== currentUserId)
    .map((m) => m.username);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg">
            <Hash className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">{selectedChannel.name}</h2>
            {selectedChannel.description && (
              <p className="text-xs text-gray-400">{selectedChannel.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="h-4 w-4" />
          <span className="text-sm">{channelMembers.length}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {channelMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 text-sm">
              No messages yet. Start the conversation! 🎉
            </p>
          </div>
        ) : (
          channelMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUserNames.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span className="ml-2">
              {typingUserNames.join(", ")} {typingUserNames.length === 1 ? "is" : "are"} typing...
            </span>
          </span>
        </div>
      )}

      {/* Input */}
      <MessageInput
        ws={ws}
        currentUserId={currentUserId}
        receiverId=""
        channelId={selectedChannel.id}
        senderName={currentUsername}
      />
    </div>
  );
}
