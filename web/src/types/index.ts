// ── Domain types ─────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  created_at?: string;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

// ── WebSocket message types ───────────────────────────────────────────────────

export type WsIncoming =
  | { type: "room_joined"; room: Room; messages: Message[] }
  | { type: "room_left"; roomId: string }
  | { type: "room_created"; room: Room }
  | { type: "new_message"; message: Message }
  | { type: "error"; message: string };

export type WsOutgoing =
  | { type: "join_room"; roomId: string; password: string }
  | { type: "leave_room"; roomId: string }
  | { type: "send_message"; roomId: string; userId: string; username: string; content: string }
  | { type: "create_room"; name: string; password: string };

// ── App state types ───────────────────────────────────────────────────────────

export type Theme = "dark" | "light";
export type AccentColor = "indigo" | "violet" | "sky" | "emerald" | "rose";

export interface ModalState {
  createRoom: boolean;
  joinRoom: { open: boolean; roomId?: string; roomName?: string };
  settings: boolean;
}

export interface AppState {
  // User
  userId: string | null;
  username: string | null;

  // WebSocket readiness
  wsReady: boolean;

  // Rooms
  knownRooms: Room[];         // Rooms saved to localStorage
  joinedRoomIds: string[];    // roomIds currently subscribed in the WS
  activeRoomId: string | null;

  // Messages per room
  messages: Record<string, Message[]>;

  // Unread count per room (rooms that are not the active one)
  unreadCount: Record<string, number>;

  // Modals
  modals: ModalState;

  // Preferences
  theme: Theme;
  accentColor: AccentColor;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: "SET_USER"; userId: string; username: string }
  | { type: "SET_WS_READY"; ready: boolean }
  | { type: "SET_ACTIVE_ROOM"; roomId: string | null }
  | { type: "SET_KNOWN_ROOMS"; rooms: Room[] }
  | { type: "ADD_KNOWN_ROOM"; room: Room }
  | { type: "ROOM_JOINED"; room: Room; messages: Message[] }
  | { type: "ROOM_LEFT"; roomId: string }
  | { type: "NEW_MESSAGE"; message: Message }
  | { type: "OPEN_CREATE_ROOM_MODAL" }
  | { type: "CLOSE_CREATE_ROOM_MODAL" }
  | { type: "OPEN_JOIN_ROOM_MODAL"; roomId: string; roomName?: string }
  | { type: "CLOSE_JOIN_ROOM_MODAL" }
  | { type: "OPEN_SETTINGS_MODAL" }
  | { type: "CLOSE_SETTINGS_MODAL" }
  | { type: "SET_THEME"; theme: Theme }
  | { type: "SET_ACCENT_COLOR"; accentColor: AccentColor };
