import { type Notification } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Bell, BellOff } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" data-testid="notifications-panel">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Notifications</h2>
            {unreadNotifications.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                {unreadNotifications.length}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-notifications"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  data-testid={`notification-${notification.id}`}
                  className={`w-full text-left p-4 rounded-lg transition-colors hover:bg-muted ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        notification.read ? "bg-transparent" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {notification.senderName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.messagePreview}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
