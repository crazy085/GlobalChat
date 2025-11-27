import { type Message } from "@shared/schema";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formattedTime = format(new Date(message.timestamp), "h:mm a");

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
          isOwn
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
            : "bg-gray-800 text-white rounded-bl-md"
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">
          {message.content}
        </p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isOwn ? "text-white/70" : "text-gray-400"
          }`}
        >
          <span>{formattedTime}</span>
          {isOwn && (
            <span className="ml-1">
              {message.read ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
