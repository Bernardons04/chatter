"use client";

import { useState, useRef, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { saveRoomPassword } from "@/lib/localStorage";
import { useChatStore } from "@/store/chatStore";
import chatterWs from "@/lib/websocket";
import type { WsIncoming } from "@/types";

export default function CreateRoomModal() {
  const { state, dispatch } = useChatStore();
  const open = state.modals.createRoom;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setPassword("");
      setError("");
      setLoading(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  function close() {
    dispatch({ type: "CLOSE_CREATE_ROOM_MODAL" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPass = password.trim();

    if (!trimmedName) return setError("Room name is required.");
    if (!trimmedPass) return setError("Password is required.");
    if (trimmedName.length > 50) return setError("Room name must be 50 characters or less.");

    setLoading(true);
    setError("");

    // Listen for response once
    const unsub = chatterWs.onMessage((data: WsIncoming) => {
      if (data.type === "room_created") {
        saveRoomPassword(data.room.id, trimmedPass);
        unsub();
        setLoading(false);
        close();
      } else if (data.type === "error") {
        unsub();
        setLoading(false);
        setError(data.message);
      }
    });

    chatterWs.send({ type: "create_room", name: trimmedName, password: trimmedPass });

    // Timeout fallback
    setTimeout(() => {
      unsub();
      if (loading) {
        setLoading(false);
        setError("Request timed out. Please try again.");
      }
    }, 8000);
  }

  return (
    <Modal open={open} onClose={close} title="Create a Room">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <FieldGroup label="Room Name" htmlFor="create-room-name">
          <input
            id="create-room-name"
            ref={nameRef}
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. general"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "hsl(var(--accent))")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </FieldGroup>

        <FieldGroup label="Password" htmlFor="create-room-password">
          <input
            id="create-room-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Set a password for this room"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "hsl(var(--accent))")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </FieldGroup>

        {error && <p style={{ margin: 0, fontSize: "0.8125rem", color: "#f87171" }}>{error}</p>}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button type="button" onClick={close} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            type="submit"
            id="create-room-submit"
            disabled={loading}
            style={{
              ...primaryBtnStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function FieldGroup({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{
          display: "block",
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: "0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "var(--bg-input)",
  border: "1.5px solid var(--border)",
  borderRadius: "10px",
  color: "var(--text-primary)",
  fontSize: "0.9375rem",
  outline: "none",
  transition: "border-color 0.15s",
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "0.75rem",
  background: "var(--bg-hover)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "var(--text-secondary)",
  fontSize: "0.9375rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background 0.15s",
};

const primaryBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "0.75rem",
  background: "hsl(var(--accent))",
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "0.9375rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.15s",
  boxShadow: "0 4px 14px hsl(var(--accent) / 0.3)",
};
