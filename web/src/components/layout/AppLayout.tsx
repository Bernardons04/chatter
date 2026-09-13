"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Mobile top bar */}
        <div
          className="mobile-topbar"
          style={{
            display: "none",
            height: "61px",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-sidebar)",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "1.25rem",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            ☰
          </button>
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Chatter
          </span>
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar {
            display: flex !important;
          }
          aside {
            position: fixed !important;
            left: 0;
            top: 0;
            height: 100dvh;
            z-index: 30;
          }
        }
      `}</style>
    </div>
  );
}
