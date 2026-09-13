import type { Metadata } from "next";
import "./globals.css";
import { ChatProvider } from "@/store/chatStore";

export const metadata: Metadata = {
  title: "Chatter — Realtime Anonymous Chat",
  description:
    "Chatter is a minimalist realtime chat app. No account required — just pick a name and start chatting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
