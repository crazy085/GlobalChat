import { useState } from "react";
import { type Channel } from "@shared/schema";
import { Hash, Lock, Plus, Search, X } from "lucide-react";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (newChannelName.trim()) {
      onCreateChannel(newChannelName.trim(), isPrivate);
      setNewChannelName("");
      setIsPrivate(false);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Channels</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Hash className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">
              {searchQuery ? "No channels found" : "No channels yet"}
            </p>
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedChannel?.id === channel.id
                  ? "bg-purple-500/20 border border-purple-500/30"
                  : "hover:bg-gray-800"
              }`}
            >
              <div className="p-2 bg-gray-800 rounded-lg">
                {channel.isPrivate ? (
                  <Lock className="h-4 w-4 text-gray-400" />
                ) : (
                  <Hash className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{channel.name}</p>
                {channel.description && (
                  <p className="text-xs text-gray-400 truncate">
                    {channel.description}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create Channel</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                autoFocus
                className="w-full h-12 px-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-gray-300">Private channel</span>
              </label>
              <button
                onClick={handleCreate}
                disabled={!newChannelName.trim()}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
