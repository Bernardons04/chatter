"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserId, getUsername } from "@/lib/localStorage";
import AppLayout from "@/components/layout/AppLayout";
import { useDispatch } from "@/store/chatStore";

export default function RoomsPage() {
  const router = useRouter();
  const { setActiveRoom } = useDispatch();

  useEffect(() => {
    if (!getUserId() || !getUsername()) {
      router.replace("/auth");
      return;
    }
    setActiveRoom(null);
  }, [router, setActiveRoom]);

  return (
    <AppLayout>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "380px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
          <h2
            style={{
              margin: "0 0 0.75rem",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Welcome to Chatter
          </h2>
          <p
            style={{
              margin: "0 0 2rem",
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Create a new room or join an existing one to start chatting in real time.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <WelcomeButton
              id="welcome-create-room"
              label="+ Create a Room"
              onClick={() => {
                document.getElementById("create-room-btn")?.click();
              }}
              primary
            />
            <WelcomeButton
              id="welcome-join-room"
              label="Enter a Room"
              onClick={() => {
                document.getElementById("sidebar-search")?.focus();
              }}
            />
          </div>

          <p
            style={{
              marginTop: "2rem",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
            }}
          >
            Share a room link with someone to invite them to your chat.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function WelcomeButton({
  label,
  onClick,
  primary,
  id,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  id: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        padding: "0.75rem 1.25rem",
        background: primary ? "hsl(var(--accent))" : "var(--bg-hover)",
        border: primary ? "none" : "1px solid var(--border)",
        borderRadius: "10px",
        color: primary ? "#fff" : "var(--text-secondary)",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "opacity 0.15s, transform 0.1s",
        boxShadow: primary ? "0 4px 16px hsl(var(--accent) / 0.3)" : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.88";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {label}
    </button>
  );
}
