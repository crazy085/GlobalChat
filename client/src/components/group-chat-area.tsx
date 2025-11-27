import { useEffect, useRef } from "react";
import { type Channel, type Message, type User, type Reaction } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { Hash, Users, Lock, Sparkles, MessageCircle } from "lucide-react";

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
      <div className="flex h-full items-center justify-center gradient-bg">
        <div className="text-center space-y-4 fade-in">
          <div className="relative mx-auto w-fit">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Hash className="h-10 w-10 text-primary" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Select a channel to start messaging
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
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

  const displayedMembers = channelMembers.slice(0, 5);
  const remainingMembers = channelMembers.length - 5;

  return (
    <div className="flex h-full flex-col">
      {/* Channel Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-white/10">
            <AvatarFallback className={`font-semibold text-lg ${
              selectedChannel.isPrivate 
                ? "bg-gradient-to-br from-orange-500/30 to-red-500/30 text-orange-300" 
                : "bg-gradient-to-br from-primary/30 to-accent/30 text-foreground"
            }`}>
              {selectedChannel.isPrivate ? (
                <Lock className="h-5 w-5" />
              ) : (
                <Hash className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg text-foreground truncate" data-testid="text-channel-name">
              {selectedChannel.name}
            </h2>
            {selectedChannel.isPrivate && (
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{channelMembers.length} members</span>
          </div>
        </div>
        {/* Member Avatars */}
        <div className="hidden sm:flex items-center -space-x-2">
          {displayedMembers.map((member) => (
            <Avatar 
              key={member.id} 
              className="h-8 w-8 border-2 border-background hover:z-10 hover:scale-110 transition-transform cursor-pointer"
              title={member.username}
            >
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-foreground text-xs font-semibold">
                {member.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {remainingMembers > 0 && (
            <div className="h-8 w-8 rounded-full bg-white/10 border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">+{remainingMembers}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {channelMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center fade-in">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation! 🎉
              </p>
            </div>
          </div>
        ) : (
          channelMessages.map((message) => {
            const messageReactions = reactions.get(message.id) || [];
            const isOwn = message.senderId === currentUserId;
            const sender = channelMembers.find((m) => m.id === message.senderId);

            return (
              <div key={message.id} className="group fade-in">
                {!isOwn && (
                  <div className="flex items-center gap-2 mb-1 ml-1">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-foreground text-[10px] font-semibold">
                        {sender?.username?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground font-medium">
                      {sender?.username || "Unknown"}
                    </p>
                  </div>
                )}
                <MessageBubble message={message} isOwn={isOwn} />
                {messageReactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 ml-1">
                    {Object.entries(
                      messageReactions.reduce((acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => onAddReaction(message.id, emoji)}
                        className="text-xs bg-white/10 px-2.5 py-1 rounded-full hover:bg-white/20 hover:scale-105 transition-all border border-white/10"
                        data-testid={`reaction-${message.id}-${emoji}`}
                      >
                        {emoji} <span className="text-muted-foreground ml-0.5">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 mt-1.5 ml-1">
                  {["👍", "❤️", "😂", "😮", "😢", "🔥"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onAddReaction(message.id, emoji)}
                      className="text-sm hover:scale-125 active:scale-95 transition-transform p-1 rounded hover:bg-white/10"
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
        <div className="px-4 py-2 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary"></span>
            </div>
            <span className="font-medium">
              {typingUsernames.length === 1
                ? `${typingUsernames[0]} is typing...`
                : `${typingUsernames.join(", ")} are typing...`}
            </span>
          </div>
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
