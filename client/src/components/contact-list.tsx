import { useState } from "react";
import { type User } from "@shared/schema";
import { Search, MessageCircle, LogOut } from "lucide-react";

interface ContactListProps {
  contacts: User[];
  selectedContact: User | null;
  onContactSelect: (contact: User) => void;
  currentUsername: string;
  onlineUsers?: Set<string>;
}

export function ContactList({
  contacts,
  selectedContact,
  onContactSelect,
  currentUsername,
  onlineUsers = new Set(),
}: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {currentUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{currentUsername}</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageCircle className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">
              {searchQuery ? "No contacts found" : "No contacts yet"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => {
              const isOnline = onlineUsers.has(contact.id);
              return (
                <button
                  key={contact.id}
                  onClick={() => onContactSelect(contact)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    selectedContact?.id === contact.id
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                      {contact.username.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white">{contact.username}</p>
                    <p className="text-xs text-gray-400">
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
