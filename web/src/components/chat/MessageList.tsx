"use client";

import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  userId: string | null;
}

const GROUP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export default function MessageList({ messages, userId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages, unless user has scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <p style={{ margin: "0 0 0.5rem", fontSize: "2rem" }}>👋</p>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--text-secondary)" }}>
            No messages yet
          </p>
          <p style={{ margin: "0.375rem 0 0", fontSize: "0.875rem" }}>
            Be the first to say something!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const isSameUser = prev?.user_id === msg.user_id;
        const timeDiff = prev
          ? new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()
          : Infinity;
        const showHeader = !isSameUser || timeDiff > GROUP_THRESHOLD_MS;
        const isOwn = msg.user_id === userId;

        return (
          <MessageItem
            key={msg.id}
            message={msg}
            isOwn={isOwn}
            showHeader={showHeader}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
