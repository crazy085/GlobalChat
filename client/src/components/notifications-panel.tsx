import { type Notification } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { X, Bell, BellOff, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationsPanel({
  notifications,
  onClose,
  onMarkAsRead,
}: NotificationsPanelProps) {
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div 
      className="fixed inset-0 z-50 glass-dark" 
      onClick={onClose}
      data-testid="notifications-panel"
    >
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md gradient-sidebar border-l border-white/10 shadow-2xl slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Notifications</h2>
              {unreadNotifications.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadNotifications.length} unread
                </p>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            data-testid="button-close-notifications"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Notifications List */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full fade-in">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {notifications.map((notification, index) => (
                <button
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  data-testid={`notification-${notification.id}`}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 hover-lift border ${
                    !notification.read 
                      ? "bg-primary/10 border-primary/20 hover:bg-primary/15" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        !notification.read 
                          ? "gradient-primary" 
                          : "bg-white/10"
                      }`}>
                        <MessageCircle className={`h-5 w-5 ${
                          !notification.read ? "text-white" : "text-muted-foreground"
                        }`} />
                      </div>
                      {!notification.read && (
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background pulse-online" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`font-semibold text-sm truncate ${
                          !notification.read ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {notification.senderName}
                        </p>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {format(new Date(notification.createdAt), "h:mm a")}
                        </p>
                      </div>
                      <p className={`text-sm truncate ${
                        !notification.read ? "text-foreground/80" : "text-muted-foreground"
                      }`}>
                        {notification.messagePreview}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {format(new Date(notification.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
