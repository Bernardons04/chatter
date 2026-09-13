"use client";

import { useState } from "react";
import Link from "next/link";
import type { Room } from "@/types";

interface RoomHeaderProps {
  room: Room;
}

export default function RoomHeader({ room }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        padding: "0 1.25rem",
        height: "61px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-sidebar)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexShrink: 0,
      }}
    >
      {/* Room name */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flex: 1, minWidth: 0 }}>
        <Link
          href="/rooms"
          className="mobile-back-btn"
          style={{
            textDecoration: "none",
            color: "var(--text-secondary)",
            fontSize: "1.25rem",
            marginRight: "0.25rem",
            cursor: "pointer",
          }}
          aria-label="Back to rooms"
        >
          ←
        </Link>
        <span style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: 300 }}>#</span>
        <h2
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {room.name}
        </h2>
      </div>

      {/* Copy link button */}
      <button
        id="copy-room-link-btn"
        onClick={copyLink}
        title="Copy room link"
        aria-label="Copy room link"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.4rem 0.75rem",
          background: copied ? "var(--accent-bg-strong)" : "var(--bg-hover)",
          border: `1px solid ${copied ? "hsl(var(--accent))" : "var(--border)"}`,
          borderRadius: "8px",
          color: copied ? "hsl(var(--accent))" : "var(--text-secondary)",
          fontSize: "0.8125rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s",
          flexShrink: 0,
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (!copied) {
            e.currentTarget.style.background = "var(--bg-surface)";
            e.currentTarget.style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (!copied) {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
      >
        {copied ? "✓ Copied!" : "🔗 Copy link"}
      </button>
    </div>
  );
}
