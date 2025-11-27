import { useState } from "react";
import { type Channel } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Hash, Plus, Lock } from "lucide-react";

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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Channels</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              data-testid="button-create-channel"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                data-testid="input-channel-name"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private-channel"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4"
                  data-testid="checkbox-private"
                />
                <label htmlFor="private-channel" className="text-sm">
                  Private channel
                </label>
              </div>
              <Button
                onClick={handleCreateChannel}
                className="w-full"
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
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search channels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-lg"
            data-testid="input-search-channels"
          />
        </div>
      </div>

      {/* Channels List */}
      <ScrollArea className="flex-1">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Hash className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No channels found" : "No channels available"}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                data-testid={`channel-${channel.id}`}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 transition-colors ${
                  selectedChannel?.id === channel.id
                    ? "bg-sidebar-accent"
                    : ""
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted text-foreground font-semibold">
                    {channel.isPrivate ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Hash className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-base truncate">
                    {channel.name}
                  </p>
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
      </ScrollArea>
    </div>
  );
}
