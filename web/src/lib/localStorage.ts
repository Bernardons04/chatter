import type { Room, Theme, AccentColor } from "@/types";

// Keys
const KEYS = {
  userId: "chatter_userId",
  username: "chatter_username",
  theme: "chatter_theme",
  accentColor: "chatter_accentColor",
  knownRooms: "chatter_knownRooms",
  roomPasswords: "chatter_roomPasswords",
} as const;

// Safe localStorage access (Next.js runs on server too)
function get(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

// ── User ─────────────────────────────────────────────────────────────────────

export function getUserId(): string | null {
  return get(KEYS.userId);
}

export function getUsername(): string | null {
  return get(KEYS.username);
}

export function saveUser(userId: string, username: string): void {
  set(KEYS.userId, userId);
  set(KEYS.username, username);
}

// ── Preferences ───────────────────────────────────────────────────────────────

export function getTheme(): Theme {
  const val = get(KEYS.theme);
  if (val === "light" || val === "dark") return val;
  return "dark";
}

export function saveTheme(theme: Theme): void {
  set(KEYS.theme, theme);
}

export function getAccentColor(): AccentColor {
  const val = get(KEYS.accentColor);
  if (
    val === "indigo" ||
    val === "violet" ||
    val === "sky" ||
    val === "emerald" ||
    val === "rose"
  )
    return val;
  return "indigo";
}

export function saveAccentColor(color: AccentColor): void {
  set(KEYS.accentColor, color);
}

// ── Known rooms ───────────────────────────────────────────────────────────────

export function getKnownRooms(): Room[] {
  try {
    const raw = get(KEYS.knownRooms);
    if (!raw) return [];
    return JSON.parse(raw) as Room[];
  } catch {
    return [];
  }
}

export function saveKnownRooms(rooms: Room[]): void {
  set(KEYS.knownRooms, JSON.stringify(rooms));
}

export function addKnownRoom(room: Room): Room[] {
  const rooms = getKnownRooms();
  const exists = rooms.some((r) => r.id === room.id);
  if (exists) return rooms;
  const updated = [...rooms, room];
  saveKnownRooms(updated);
  return updated;
}

// ── Room Passwords ────────────────────────────────────────────────────────────

export function getRoomPassword(roomId: string): string | null {
  try {
    const raw = get(KEYS.roomPasswords);
    if (!raw) return null;
    const passwords = JSON.parse(raw) as Record<string, string>;
    return passwords[roomId] || null;
  } catch {
    return null;
  }
}

export function saveRoomPassword(roomId: string, password: string): void {
  try {
    const raw = get(KEYS.roomPasswords);
    const passwords = raw ? JSON.parse(raw) : {};
    passwords[roomId] = password;
    set(KEYS.roomPasswords, JSON.stringify(passwords));
  } catch {
    // ignore
  }
}
