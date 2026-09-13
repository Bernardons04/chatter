import type { WsIncoming, WsOutgoing } from "@/types";

type MessageHandler = (data: WsIncoming) => void;
type StatusHandler = (ready: boolean) => void;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

class ChatterWebSocket {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;
    this._createConnection();
  }

  private _createConnection(): void {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("[WS] Connected");
        this._notifyStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as WsIncoming;
          this._notifyMessage(data);
        } catch {
          console.error("[WS] Failed to parse message:", event.data);
        }
      };

      this.ws.onclose = () => {
        console.log("[WS] Disconnected");
        this._notifyStatus(false);

        if (this.shouldReconnect) {
          this.reconnectTimeout = setTimeout(() => {
            console.log("[WS] Reconnecting...");
            this._createConnection();
          }, 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.error("[WS] Error:", err);
      };
    } catch (err) {
      console.error("[WS] Could not connect:", err);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  send(message: WsOutgoing): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("[WS] Cannot send — not connected");
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private _notifyMessage(data: WsIncoming): void {
    this.messageHandlers.forEach((h) => h(data));
  }

  private _notifyStatus(ready: boolean): void {
    this.statusHandlers.forEach((h) => h(ready));
  }
}

// Singleton
const chatterWs = new ChatterWebSocket();
export default chatterWs;
