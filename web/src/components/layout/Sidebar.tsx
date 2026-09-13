"use client";

import { usePathname } from "next/navigation";
import RoomList from "./RoomList";
import UserSection from "./UserSection";
import CreateRoomModal from "@/components/modals/CreateRoomModal";
import JoinRoomModal from "@/components/modals/JoinRoomModal";
import SettingsModal from "@/components/modals/SettingsModal";

export default function Sidebar() {
  const pathname = usePathname();
  const isRoomRoot = pathname === "/rooms";
  return (
    <>
      {/* Sidebar */}
      <aside
        className={!isRoomRoot ? "hide-on-mobile" : "show-on-mobile"}
        style={{
          width: "var(--sidebar-width)",
          flexShrink: 0,
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          zIndex: 30,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.125rem 1rem 0.875rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "hsl(var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              boxShadow: "0 2px 8px hsl(var(--accent) / 0.4)",
            }}
          >
            💬
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Chatter
          </h1>
        </div>

        {/* Room list (takes remaining space) */}
        <RoomList />

        {/* User section (pinned to bottom) */}
        <UserSection />
      </aside>

      {/* Modals */}
      <CreateRoomModal />
      <JoinRoomModal />
      <SettingsModal />
    </>
  );
}
