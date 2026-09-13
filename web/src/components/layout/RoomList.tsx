"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useChatStore, useDispatch } from "@/store/chatStore";
import chatterWs from "@/lib/websocket";
import type { Room } from "@/types";

export default function RoomList() {
  const router = useRouter();
  const params = useParams();
  const { state, dispatch } = useChatStore();
  const { openJoinRoomModal, openCreateRoomModal } = useDispatch();

  const [search, setSearch] = useState("");

  const activeRoomId = (params?.roomId as string) ?? null;

  const filtered = state.knownRooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleRoomClick(room: Room) {
    const isJoined = state.joinedRoomIds.includes(room.id);

    if (isJoined) {
      // Already authenticated — navigate directly
      dispatch({ type: "SET_ACTIVE_ROOM", roomId: room.id });
      router.push(`/rooms/${room.id}`);
    } else {
      // Need to authenticate — open join modal
      openJoinRoomModal(room.id, room.name);
    }
  }

  function handleLeaveRoom(e: React.MouseEvent, roomId: string) {
    e.stopPropagation();
    chatterWs.send({ type: "leave_room", roomId });
    if (activeRoomId === roomId) {
      router.push("/rooms");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        padding: "0.75rem 0",
      }}
    >
      {/* Search */}
      <div style={{ padding: "0 0.75rem 0.75rem" }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            id="sidebar-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 2.25rem",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "hsl(var(--accent))")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      {/* Rooms header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0.75rem",
          marginBottom: "0.25rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Rooms
        </span>
        <button
          id="create-room-btn"
          onClick={openCreateRoomModal}
          aria-label="Create new room"
          title="Create room"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "1.125rem",
            lineHeight: 1,
            padding: "0.125rem 0.25rem",
            borderRadius: "4px",
            transition: "color 0.15s",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--accent))")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          +
        </button>
      </div>

      {/* Room list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0.375rem" }}>
        {filtered.length === 0 && (
          <p
            style={{
              padding: "0.75rem",
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {search ? "No rooms match your search." : "No rooms yet. Create one!"}
          </p>
        )}

        {filtered.map((room) => {
          const isActive = activeRoomId === room.id;
          const isJoined = state.joinedRoomIds.includes(room.id);
          const unread = state.unreadCount[room.id] ?? 0;

          return (
            <div
              key={room.id}
              role="button"
              tabIndex={0}
              aria-label={`Room: ${room.name}`}
              onClick={() => handleRoomClick(room)}
              onKeyDown={(e) => e.key === "Enter" && handleRoomClick(room)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.625rem",
                borderRadius: "8px",
                cursor: "pointer",
                background: isActive ? "var(--accent-bg-strong)" : "transparent",
                color: isActive ? "hsl(var(--accent))" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9375rem",
                transition: "background 0.15s, color 0.15s",
                marginBottom: "0.125rem",
                userSelect: "none",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", flexShrink: 0 }}>#</span>
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {room.name}
              </span>

              {/* Unread badge */}
              {unread > 0 && !isActive && (
                <span
                  style={{
                    background: "hsl(var(--accent))",
                    color: "#fff",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "999px",
                    minWidth: "18px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}

              {/* Leave button (only for joined rooms) */}
              {isJoined && (
                <button
                  onClick={(e) => handleLeaveRoom(e, room.id)}
                  aria-label={`Leave ${room.name}`}
                  title="Leave room"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    padding: "0.125rem 0.25rem",
                    borderRadius: "4px",
                    opacity: 0,
                    transition: "opacity 0.15s, color 0.15s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                  className="leave-btn"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Show leave button on row hover via CSS trick — inject a style block */}
      <style>{`
        div[role="button"]:hover .leave-btn {
          opacity: 1 !important;
        }
        .leave-btn::before {
          content: "✕";
        }
      `}</style>
    </div>
  );
}
