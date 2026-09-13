"use client";

import { useState, useRef, KeyboardEvent } from "react";
import chatterWs from "@/lib/websocket";
import { useChatStore } from "@/store/chatStore";

interface MessageInputProps {
  roomId: string;
}

export default function MessageInput({ roomId }: MessageInputProps) {
  const { state } = useChatStore();
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!state.userId || !state.username) return;

    chatterWs.send({
      type: "send_message",
      roomId,
      userId: state.userId,
      username: state.username,
      content: trimmed,
    });

    setContent("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    // Auto-resize textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <div
      style={{
        padding: "0.875rem 1.25rem 1rem",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-base)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: "var(--bg-input)",
          border: "1.5px solid var(--border)",
          borderRadius: "12px",
          padding: "0.625rem 0.75rem 0.625rem 1rem",
          transition: "border-color 0.15s",
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--accent))";
        }}
        onBlurCapture={(e) => {
          // only blur if focus leaves the container
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          }
        }}
      >
        <textarea
          id="message-input"
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "0.9375rem",
            resize: "none",
            lineHeight: 1.5,
            fontFamily: "inherit",
            maxHeight: "160px",
            overflowY: "auto",
          }}
        />

        <button
          id="send-message-btn"
          onClick={handleSend}
          disabled={!content.trim()}
          aria-label="Send message"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "9px",
            background: content.trim() ? "hsl(var(--accent))" : "var(--bg-hover)",
            border: "none",
            cursor: content.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-end",
            fontSize: "1rem",
            flexShrink: 0,
            transition: "background 0.15s, transform 0.1s",
            color: content.trim() ? "#fff" : "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            if (content.trim()) {
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ↑
        </button>
      </div>

      <p
        style={{
          margin: "0.375rem 0 0",
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          textAlign: "right",
        }}
      >
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
