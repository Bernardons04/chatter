"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getUserId, getUsername, getRoomPassword } from "@/lib/localStorage";
import AppLayout from "@/components/layout/AppLayout";
import RoomHeader from "@/components/chat/RoomHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { useChatStore, useRoomMessages, useDispatch } from "@/store/chatStore";
import chatterWs from "@/lib/websocket";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const { state, dispatch } = useChatStore();
  const { openJoinRoomModal, setActiveRoom } = useDispatch();
  const messages = useRoomMessages(roomId);

  const room = state.knownRooms.find((r) => r.id === roomId);
  const isJoined = state.joinedRoomIds.includes(roomId);

  useEffect(() => {
    // Auth check
    if (!getUserId() || !getUsername()) {
      router.replace(`/auth?redirect=/rooms/${roomId}`);
      return;
    }

    // Set active room for sidebar highlight and unread clearing
    setActiveRoom(roomId);

    // If not joined yet, attempt auto-join or open the join modal
    if (!isJoined) {
      const knownRoom = state.knownRooms.find((r) => r.id === roomId);
      const cachedPassword = getRoomPassword(roomId);

      if (cachedPassword) {
        if (state.wsReady) {
          const unsub = chatterWs.onMessage((data) => {
            if (data.type === "error") {
              unsub();
              openJoinRoomModal(roomId, knownRoom?.name);
            } else if (data.type === "room_joined" && data.room.id === roomId) {
              unsub();
            }
          });
          chatterWs.send({ type: "join_room", roomId, password: cachedPassword });
          setTimeout(() => unsub(), 8000);
        }
      } else {
        openJoinRoomModal(roomId, knownRoom?.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isJoined, state.wsReady]);

  // After room is joined (state update), make sure active room is set
  useEffect(() => {
    if (isJoined && state.activeRoomId !== roomId) {
      setActiveRoom(roomId);
    }
  }, [isJoined, roomId, state.activeRoomId, setActiveRoom]);

  // Show loading state if room metadata is unknown
  if (!room && !isJoined) {
    return (
      <AppLayout>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            flexDirection: "column",
            gap: "1rem",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div style={{ fontSize: "2rem" }}>🔒</div>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>
            Password required
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Enter the room password to access this chat.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {room && <RoomHeader room={room} />}

        <MessageList messages={messages} userId={state.userId} />

        {isJoined && <MessageInput roomId={roomId} />}
      </div>
    </AppLayout>
  );
}
