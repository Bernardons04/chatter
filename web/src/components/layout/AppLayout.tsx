"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoomRoot = pathname === "/rooms";

  return (
    <div
      style={{
        display: "flex",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar />

      {/* Main area */}
      <main
        className={isRoomRoot ? "hide-on-mobile" : "show-on-mobile"}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </main>

      <style>{`
        .mobile-back-btn {
          display: none !important;
        }
        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
          }
          .show-on-mobile {
            display: flex !important;
            width: 100% !important;
            flex: 1 !important;
          }
          .mobile-back-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
