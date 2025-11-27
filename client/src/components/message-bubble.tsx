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
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} fade-in`}
      data-testid={`message-${message.id}`}
    >
      <div
        className={`max-w-md px-4 py-2.5 shadow-lg ${
          isOwn
            ? "message-sent shadow-primary/20"
            : "message-received shadow-black/20 border border-white/5"
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <div
          className={`flex items-center gap-1.5 mt-1.5 text-[10px] font-medium tracking-wide ${
            isOwn ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          <span className="uppercase">{formattedTime}</span>
          {isOwn && (
            <span className="ml-0.5">
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
