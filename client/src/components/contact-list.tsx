import { useState } from "react";
import { type User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactListProps {
  contacts: User[];
  selectedContact: User | null;
  onContactSelect: (contact: User) => void;
  currentUsername: string;
}

export function ContactList({
  contacts,
  selectedContact,
  onContactSelect,
  currentUsername,
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
    <div className="flex h-full flex-col gradient-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-primary/30">
            <AvatarFallback className="gradient-primary text-white font-semibold">
              {currentUsername.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base truncate text-foreground" data-testid="text-current-user">
              {currentUsername}
            </h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center fade-in">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No contacts found" : "No contacts available"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => onContactSelect(contact)}
                data-testid={`contact-${contact.id}`}
                className={`w-full flex items-center gap-3 p-3 rounded-xl hover-lift transition-all duration-200 ${
                  selectedContact?.id === contact.id
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-foreground font-semibold">
                      {contact.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-[hsl(240,10%,5%)] pulse-online" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-base truncate text-foreground">
                    {contact.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Online
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
