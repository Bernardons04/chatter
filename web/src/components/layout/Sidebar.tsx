"use client";

import { useState } from "react";
import RoomList from "./RoomList";
import UserSection from "./UserSection";
import CreateRoomModal from "@/components/modals/CreateRoomModal";
import JoinRoomModal from "@/components/modals/JoinRoomModal";
import SettingsModal from "@/components/modals/SettingsModal";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            background: "var(--bg-overlay)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
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
          transition: "transform 0.25s ease",
          // Mobile: slide in/out
          ...(typeof window !== "undefined" && window.innerWidth < 768
            ? {
                position: "fixed" as const,
                left: 0,
                top: 0,
                transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
              }
            : {}),
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
