import { useEffect, useRef } from "react";
import { type Channel, type Message, type User, type Reaction } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Hash className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">
            Select a channel to start messaging
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Choose a channel from the list to join the conversation
          </p>
        </div>
      </div>
    );
  }

  const channelMessages = messages.filter(
    (msg) => msg.channelId === selectedChannel.id
  );

  const typingUsernames = channelMembers
    .filter((member) => typingUsers.has(member.id) && member.id !== currentUserId)
    .map((member) => member.username);

  return (
    <div className="flex h-full flex-col">
      {/* Channel Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-muted text-foreground font-semibold text-lg">
            <Hash className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-lg" data-testid="text-channel-name">
            {selectedChannel.name}
          </h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{channelMembers.length} members</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {channelMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          channelMessages.map((message) => {
            const messageReactions = reactions.get(message.id) || [];
            const isOwn = message.senderId === currentUserId;
            const sender = channelMembers.find((m) => m.id === message.senderId);

            return (
              <div key={message.id} className="group">
                {!isOwn && (
                  <p className="text-xs text-muted-foreground mb-1 ml-1">
                    {sender?.username || "Unknown"}
                  </p>
                )}
                <MessageBubble message={message} isOwn={isOwn} />
                {messageReactions.length > 0 && (
                  <div className="flex gap-1 mt-1 ml-1">
                    {Object.entries(
                      messageReactions.reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => onAddReaction(message.id, emoji)}
                        className="text-xs bg-muted px-2 py-0.5 rounded-full hover:bg-muted/80"
                        data-testid={`reaction-${message.id}-${emoji}`}
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1 ml-1">
                  {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onAddReaction(message.id, emoji)}
                      className="text-sm hover:scale-125 transition-transform"
                      data-testid={`add-reaction-${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsernames.length > 0 && (
        <div className="px-4 py-2 text-xs text-muted-foreground">
          {typingUsernames.length === 1
            ? `${typingUsernames[0]} is typing...`
            : `${typingUsernames.join(", ")} are typing...`}
        </div>
      )}

      {/* Message Input */}
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
