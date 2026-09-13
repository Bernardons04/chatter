"use client";

import type { Message } from "@/types";
import { useChatStore } from "@/store/chatStore";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showHeader: boolean; // false when same user sent previous message recently
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MessageItem({ message, isOwn, showHeader }: MessageItemProps) {
  const initial = message.username.charAt(0).toUpperCase();

  return (
    <div
      className="message-item"
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        gap: "0.75rem",
        padding: showHeader ? "0.75rem 1.25rem 0.125rem" : "0.125rem 1.25rem",
        transition: "background 0.1s",
      }}
    >
      {/* Avatar or spacer */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: isOwn ? "var(--bg-hover)" : "var(--bg-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "var(--text-secondary)",
          flexShrink: 0,
          marginTop: showHeader ? "1.5rem" : "0px", // Align with bubble when header is present
          visibility: showHeader ? "visible" : "hidden",
        }}
      >
        {initial}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {showHeader && (
          <div
            style={{
              display: "flex",
              flexDirection: isOwn ? "row-reverse" : "row",
              alignItems: "baseline",
              gap: "0.5rem",
              marginBottom: "0.25rem",
              padding: isOwn ? "0 0.25rem 0 0" : "0 0 0 0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: isOwn ? "hsl(var(--accent))" : "var(--text-primary)",
              }}
            >
              {isOwn ? "You" : message.username}
            </span>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        <div
          style={{
            background: isOwn ? "hsl(var(--accent))" : "var(--bg-hover)",
            color: isOwn ? "#fff" : "var(--text-primary)",
            padding: "0.625rem 0.875rem",
            borderRadius: "16px",
            borderTopRightRadius: isOwn && showHeader ? "4px" : "16px",
            borderTopLeftRadius: !isOwn && showHeader ? "4px" : "16px",
            maxWidth: "85%",
            boxShadow: isOwn ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.9375rem",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
