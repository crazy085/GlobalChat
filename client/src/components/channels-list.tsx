import { useState } from "react";
import { type Channel } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Hash, Plus, Lock, Sparkles } from "lucide-react";

interface ChannelsListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  currentUserId: string;
  onCreateChannel: (name: string, isPrivate: boolean) => void;
}

export function ChannelsList({
  channels,
  selectedChannel,
  onChannelSelect,
  currentUserId,
  onCreateChannel,
}: ChannelsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    onCreateChannel(newChannelName.trim(), isPrivate);
    setNewChannelName("");
    setIsPrivate(false);
    setDialogOpen(false);
  };

  return (
    <div className="flex h-full flex-col gradient-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center ring-2 ring-primary/30">
            <Hash className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-foreground">Channels</h2>
            <p className="text-xs text-muted-foreground">{channels.length} available</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/10 hover-glow transition-all"
              data-testid="button-create-channel"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-dark border-white/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Channel
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
                data-testid="input-channel-name"
              />
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="private-channel"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="peer sr-only"
                    data-testid="checkbox-private"
                  />
                  <div className="h-5 w-5 rounded-md border-2 border-white/30 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center transition-all">
                    {isPrivate && <Lock className="h-3 w-3 text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Private channel</p>
                  <p className="text-xs text-muted-foreground">Only invited members can join</p>
                </div>
              </label>
              <Button
                onClick={handleCreateChannel}
                className="w-full h-11 rounded-xl gradient-primary text-white font-semibold hover-lift transition-all"
                disabled={!newChannelName.trim()}
                data-testid="button-confirm-create"
              >
                Create Channel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
            data-testid="input-search-channels"
          />
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center fade-in">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No channels found" : "No channels available"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a new channel to get started
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                data-testid={`channel-${channel.id}`}
                className={`w-full flex items-center gap-3 p-3 rounded-xl hover-lift transition-all duration-200 ${
                  selectedChannel?.id === channel.id
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <Avatar className="h-11 w-11">
                  <AvatarFallback className={`font-semibold ${
                    channel.isPrivate 
                      ? "bg-gradient-to-br from-orange-500/30 to-red-500/30 text-orange-300" 
                      : "bg-gradient-to-br from-primary/30 to-accent/30 text-foreground"
                  }`}>
                    {channel.isPrivate ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Hash className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-base truncate text-foreground">
                      {channel.name}
                    </p>
                    {channel.isPrivate && (
                      <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {channel.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {channel.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
