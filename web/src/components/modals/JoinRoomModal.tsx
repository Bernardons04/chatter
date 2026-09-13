"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { saveRoomPassword } from "@/lib/localStorage";
import { useChatStore } from "@/store/chatStore";
import chatterWs from "@/lib/websocket";
import type { WsIncoming } from "@/types";

export default function JoinRoomModal() {
  const router = useRouter();
  const { state, dispatch } = useChatStore();
  const { open, roomId, roomName } = state.modals.joinRoom;

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
      setLoading(false);
      setTimeout(() => passwordRef.current?.focus(), 50);
    }
  }, [open]);

  function close() {
    dispatch({ type: "CLOSE_JOIN_ROOM_MODAL" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomId) return;
    const trimmedPass = password.trim();
    if (!trimmedPass) return setError("Password is required.");

    setLoading(true);
    setError("");

    const unsub = chatterWs.onMessage((data: WsIncoming) => {
      if (data.type === "room_joined" && data.room.id === roomId) {
        saveRoomPassword(roomId, trimmedPass);
        unsub();
        setLoading(false);
        close();
        router.push(`/rooms/${roomId}`);
      } else if (data.type === "error") {
        unsub();
        setLoading(false);
        setError(data.message);
      }
    });

    chatterWs.send({ type: "join_room", roomId, password: trimmedPass });

    setTimeout(() => {
      unsub();
      setLoading(false);
    }, 8000);
  }

  return (
    <Modal open={open} onClose={close} title={`Join ${roomName ? `#${roomName}` : "Room"}`}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          This room is password-protected. Enter the password to join.
        </p>

        <div>
          <label
            htmlFor="join-room-password"
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
            Password
          </label>
          <input
            id="join-room-password"
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Room password"
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              background: "var(--bg-input)",
              border: "1.5px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "0.9375rem",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "hsl(var(--accent))")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {error && (
            <p style={{ marginTop: "0.4rem", fontSize: "0.8125rem", color: "#f87171", margin: "0.4rem 0 0" }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={close}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            id="join-room-submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "hsl(var(--accent))",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 14px hsl(var(--accent) / 0.3)",
            }}
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
