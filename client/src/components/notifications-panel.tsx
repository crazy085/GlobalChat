import { type Notification } from "@shared/schema";
import { format } from "date-fns";
import { Bell, X } from "lucide-react";

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
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-gray-900 border-l border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Bell className="h-12 w-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${
                    notification.read
                      ? "bg-gray-800/50"
                      : "bg-gray-800 border border-purple-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {notification.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">
                        {notification.senderName}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {notification.messagePreview}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                    )}
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
