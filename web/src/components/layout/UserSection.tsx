"use client";

import { useChatStore, useDispatch } from "@/store/chatStore";

export default function UserSection() {
  const { state } = useChatStore();
  const { openSettingsModal } = useDispatch();

  const username = state.username ?? "Anonymous";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      style={{
        padding: "0.875rem 1rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexShrink: 0,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "hsl(var(--accent))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
          boxShadow: "0 2px 8px hsl(var(--accent) / 0.35)",
        }}
      >
        {initial}
      </div>

      {/* Username */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {username}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: state.wsReady ? "#4ade80" : "var(--text-muted)",
          }}
        >
          {state.wsReady ? "● Connected" : "● Connecting..."}
        </p>
      </div>

      {/* Settings button */}
      <button
        id="open-settings-btn"
        onClick={openSettingsModal}
        aria-label="Open settings"
        title="Settings"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.375rem",
          borderRadius: "8px",
          color: "var(--text-muted)",
          fontSize: "1rem",
          transition: "color 0.15s, background 0.15s",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.color = "var(--text-primary)";
          el.style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.color = "var(--text-muted)";
          el.style.background = "none";
        }}
      >
        ⚙️
      </button>
    </div>
  );
}
