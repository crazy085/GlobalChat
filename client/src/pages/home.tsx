import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ContactList } from "@/components/contact-list";
import { ChatArea } from "@/components/chat-area";
import { ChannelsList } from "@/components/channels-list";
import { GroupChatArea } from "@/components/group-chat-area";
import { NotificationsPanel } from "@/components/notifications-panel";
import { type User, type Message, type Channel, type Reaction, type Notification } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bell, Users, MessageSquare } from "lucide-react";

type ViewMode = "direct" | "channels";

export default function Home() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("direct");
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());
  const [channelMembers, setChannelMembers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!userId || !username) {
      setLocation("/login");
    }
  }, [userId, username, setLocation]);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!userId,
  });

  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
    enabled: !!userId,
  });

  const { data: userNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", userId],
    enabled: !!userId,
  });

  useEffect(() => {
    setNotifications(userNotifications);
  }, [userNotifications]);

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", userId }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "message") {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "history") {
          setMessages(data.messages);
        } else if (data.type === "channelHistory") {
          setMessages(data.messages);
        } else if (data.type === "typing") {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.add(data.userId);
            return newSet;
          });
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }, 3000);
        } else if (data.type === "reaction") {
          setReactions((prev) => {
            const newMap = new Map(prev);
            const messageReactions = newMap.get(data.reaction.messageId) || [];
            newMap.set(data.reaction.messageId, [...messageReactions, data.reaction]);
            return newMap;
          });
        } else if (data.type === "userStatus") {
          if (data.status === "online") {
            setOnlineUsers((prev) => new Set(prev).add(data.userId));
          } else {
            setOnlineUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }
        }
      } catch (error) {
        console.error("WebSocket parse error:", error);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [userId]);

  const handleContactSelect = (contact: User) => {
    setSelectedContact(contact);
    setSelectedChannel(null);
    setViewMode("direct");
    setShowMobileChat(true);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "getHistory",
          userId,
          contactId: contact.id,
        })
      );
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setSelectedContact(null);
    setViewMode("channels");
    setShowMobileChat(true);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "getChannelMessages",
          channelId: channel.id,
        })
      );
    }
    loadChannelMembers(channel.id);
  };

  const loadChannelMembers = async (channelId: string) => {
    try {
      const res = await fetch(`/api/channels/${channelId}/members`);
      const data = await res.json();
      setChannelMembers(data);
    } catch (error) {
      console.error("Failed to load channel members:", error);
    }
  };

  const handleBackToContacts = () => {
    setShowMobileChat(false);
    setSelectedContact(null);
    setSelectedChannel(null);
  };

  const handleCreateChannel = async (name: string, isPrivate: boolean) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          creatorId: userId,
          isPrivate,
          description: "",
        }),
      });
      const data = await res.json();
      setSelectedChannel(data.channel);
      setViewMode("channels");
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    
    ws.send(
      JSON.stringify({
        type: "reaction",
        messageId,
        userId,
        emoji,
        senderId: userId,
        receiverId: selectedContact?.id,
        channelId: selectedChannel?.id,
      })
    );
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const contacts = users.filter((user) => user.id !== userId);
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <div className={`${showMobileChat ? "hidden" : "flex"} md:flex w-full md:w-80 flex-col border-r border-gray-800`}>
        {/* View Mode Toggle */}
        <div className="flex p-2 gap-1 border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setViewMode("direct")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "direct"
                ? "bg-purple-500/20 text-purple-400"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </button>
          <button
            onClick={() => setViewMode("channels")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "channels"
                ? "bg-purple-500/20 text-purple-400"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <Users className="h-4 w-4" />
            Channels
          </button>
        </div>

        {viewMode === "direct" ? (
          <ContactList
            contacts={contacts}
            selectedContact={selectedContact}
            onContactSelect={handleContactSelect}
            currentUsername={username || ""}
            onlineUsers={onlineUsers}
          />
        ) : (
          <ChannelsList
            channels={channels}
            selectedChannel={selectedChannel}
            onChannelSelect={handleChannelSelect}
            currentUserId={userId || ""}
            onCreateChannel={handleCreateChannel}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className={`${showMobileChat ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
        {/* Mobile Header */}
        {(selectedContact || selectedChannel) && showMobileChat && (
          <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900 md:hidden">
            <button
              onClick={handleBackToContacts}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        )}

        {/* Desktop Notification Button */}
        <div className="hidden md:flex items-center justify-end p-2 border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Chat Content */}
        {viewMode === "direct" ? (
          <ChatArea
            selectedContact={selectedContact}
            messages={messages}
            ws={ws}
            currentUserId={userId || ""}
            onlineUsers={onlineUsers}
          />
        ) : (
          <GroupChatArea
            selectedChannel={selectedChannel}
            messages={messages}
            ws={ws}
            currentUserId={userId || ""}
            currentUsername={username || ""}
            channelMembers={channelMembers}
            typingUsers={typingUsers}
            reactions={reactions}
            onAddReaction={handleAddReaction}
          />
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={handleMarkNotificationAsRead}
        />
      )}
    </div>
  );
}
