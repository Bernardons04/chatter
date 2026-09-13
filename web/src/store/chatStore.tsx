"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { AppState, AppAction, AccentColor, Theme, Room } from "@/types";
import {
  getUserId,
  getUsername,
  getTheme,
  getAccentColor,
  getKnownRooms,
  saveTheme,
  saveAccentColor,
  saveKnownRooms,
} from "@/lib/localStorage";
import chatterWs from "@/lib/websocket";

// ── Accent color CSS values ───────────────────────────────────────────────────

export const ACCENT_COLORS: Record<AccentColor, { hsl: string; label: string; hex: string }> = {
  indigo: { hsl: "239 84% 67%", label: "Indigo", hex: "#6366f1" },
  violet: { hsl: "263 70% 60%", label: "Violet", hex: "#7c3aed" },
  sky: { hsl: "199 89% 48%", label: "Sky", hex: "#0ea5e9" },
  emerald: { hsl: "160 84% 39%", label: "Emerald", hex: "#10b981" },
  rose: { hsl: "347 77% 58%", label: "Rose", hex: "#f43f5e" },
};

// ── Initial state ─────────────────────────────────────────────────────────────
// NOTE: runs on server during SSR, so no localStorage access here.
// Hydration from localStorage happens in the mount effect inside ChatProvider.

function getInitialState(): AppState {
  return {
    userId: null,
    username: null,
    wsReady: false,
    knownRooms: [],
    joinedRoomIds: [],
    activeRoomId: null,
    messages: {},
    unreadCount: {},
    modals: {
      createRoom: false,
      joinRoom: { open: false },
      settings: false,
    },
    theme: "dark",
    accentColor: "indigo",
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, userId: action.userId, username: action.username };

    case "SET_WS_READY":
      return { ...state, wsReady: action.ready };

    case "SET_ACTIVE_ROOM": {
      const unreadCount = action.roomId
        ? { ...state.unreadCount, [action.roomId]: 0 }
        : state.unreadCount;
      return { ...state, activeRoomId: action.roomId, unreadCount };
    }

    case "SET_KNOWN_ROOMS": {
      // Merge fetched rooms with any rooms already known locally,
      // deduplicating by id. Locally-known rooms take precedence (already have metadata).
      const merged = [...action.rooms];
      for (const local of state.knownRooms) {
        if (!merged.some((r) => r.id === local.id)) {
          merged.push(local);
        }
      }
      // Sort by created_at ascending if available
      merged.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return 0;
      });
      return { ...state, knownRooms: merged };
    }

    case "ADD_KNOWN_ROOM": {
      const exists = state.knownRooms.some((r) => r.id === action.room.id);
      if (exists) return state;
      return { ...state, knownRooms: [...state.knownRooms, action.room] };
    }

    case "ROOM_JOINED": {
      const { room, messages } = action;
      const alreadyJoined = state.joinedRoomIds.includes(room.id);
      return {
        ...state,
        joinedRoomIds: alreadyJoined
          ? state.joinedRoomIds
          : [...state.joinedRoomIds, room.id],
        knownRooms: state.knownRooms.some((r) => r.id === room.id)
          ? state.knownRooms
          : [...state.knownRooms, room],
        messages: {
          ...state.messages,
          [room.id]: messages,
        },
        modals: {
          ...state.modals,
          joinRoom: { open: false },
        },
      };
    }

    case "ROOM_LEFT": {
      const { roomId } = action;
      const { [roomId]: _msgs, ...restMessages } = state.messages;
      const { [roomId]: _unread, ...restUnread } = state.unreadCount;
      // Remove from knownRooms so it disappears from the sidebar
      const knownRooms = state.knownRooms.filter((r) => r.id !== roomId);
      return {
        ...state,
        joinedRoomIds: state.joinedRoomIds.filter((id) => id !== roomId),
        activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
        knownRooms,
        messages: restMessages,
        unreadCount: restUnread,
      };
    }

    case "NEW_MESSAGE": {
      const { message } = action;
      const roomId = message.room_id;
      const existing = state.messages[roomId] ?? [];

      // Deduplicate by id
      if (existing.some((m) => m.id === message.id)) return state;

      const updated = [...existing, message];
      const isActive = state.activeRoomId === roomId;

      return {
        ...state,
        messages: { ...state.messages, [roomId]: updated },
        unreadCount: {
          ...state.unreadCount,
          [roomId]: isActive ? 0 : (state.unreadCount[roomId] ?? 0) + 1,
        },
      };
    }

    case "OPEN_CREATE_ROOM_MODAL":
      return { ...state, modals: { ...state.modals, createRoom: true } };

    case "CLOSE_CREATE_ROOM_MODAL":
      return { ...state, modals: { ...state.modals, createRoom: false } };

    case "OPEN_JOIN_ROOM_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          joinRoom: { open: true, roomId: action.roomId, roomName: action.roomName },
        },
      };

    case "CLOSE_JOIN_ROOM_MODAL":
      return { ...state, modals: { ...state.modals, joinRoom: { open: false } } };

    case "OPEN_SETTINGS_MODAL":
      return { ...state, modals: { ...state.modals, settings: true } };

    case "CLOSE_SETTINGS_MODAL":
      return { ...state, modals: { ...state.modals, settings: false } };

    case "SET_THEME":
      return { ...state, theme: action.theme };

    case "SET_ACCENT_COLOR":
      return { ...state, accentColor: action.accentColor };

    default:
      return state;
  }
}

// ── Fetch all rooms from backend ──────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchAllRooms(): Promise<Room[]> {
  try {
    const res = await fetch(`${API_URL}/rooms`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ── Apply theme/accent to DOM (no save — prevents overwrite bug) ──────────────

function applyThemeToDom(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}

function applyAccentToDom(accentColor: AccentColor) {
  const color = ACCENT_COLORS[accentColor];
  document.documentElement.style.setProperty("--accent", color.hsl);
  document.documentElement.style.setProperty("--accent-hex", color.hex);
}

// ── Context ───────────────────────────────────────────────────────────────────

interface ChatContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used within ChatProvider");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Hydrate from localStorage + apply DOM state on mount ────────────────────
  // This runs ONCE after first render, client-side only.
  // It reads the persisted values and dispatches them — the effects below then
  // apply them to the DOM. We do NOT save in those effects to avoid overwriting
  // the persisted values on the very first render with the SSR defaults.
  useEffect(() => {
    // User
    const userId = getUserId();
    const username = getUsername();
    if (userId && username) {
      dispatch({ type: "SET_USER", userId, username });
    }

    // Preferences — read from localStorage and apply directly to DOM first,
    // then dispatch to update React state (which will re-apply via effects below,
    // but the DOM is already correct so there's no flash).
    const theme = getTheme();
    const accentColor = getAccentColor();
    applyThemeToDom(theme);
    applyAccentToDom(accentColor);
    dispatch({ type: "SET_THEME", theme });
    dispatch({ type: "SET_ACCENT_COLOR", accentColor });

    // Known rooms from localStorage (user's own rooms)
    const knownRooms = getKnownRooms();
    if (knownRooms.length > 0) {
      dispatch({ type: "SET_KNOWN_ROOMS", rooms: knownRooms });
    }

    // Fetch ALL rooms from backend so every client sees every room in the sidebar
    fetchAllRooms().then((rooms) => {
      if (rooms.length > 0) {
        dispatch({ type: "SET_KNOWN_ROOMS", rooms });
      }
    });
  }, []);

  // ── Apply theme to DOM when state changes (after user toggles) ───────────────
  // useRef to skip first render (hydration already handled above)
  const isFirstThemeRender = useRef(true);
  useEffect(() => {
    if (isFirstThemeRender.current) {
      isFirstThemeRender.current = false;
      return;
    }
    applyThemeToDom(state.theme);
    saveTheme(state.theme); // Save only when user explicitly changes it
  }, [state.theme]);

  // ── Apply accent color to DOM when state changes ─────────────────────────────
  const isFirstAccentRender = useRef(true);
  useEffect(() => {
    if (isFirstAccentRender.current) {
      isFirstAccentRender.current = false;
      return;
    }
    applyAccentToDom(state.accentColor);
    saveAccentColor(state.accentColor); // Save only when user explicitly changes it
  }, [state.accentColor]);

  // ── Persist known rooms to localStorage when they change ─────────────────────
  useEffect(() => {
    saveKnownRooms(state.knownRooms);
  }, [state.knownRooms]);

  // ── Connect WebSocket and register message handlers ───────────────────────────
  useEffect(() => {
    chatterWs.connect();

    const unsubStatus = chatterWs.onStatusChange((ready) => {
      dispatch({ type: "SET_WS_READY", ready });

      // Re-fetch room list when WS reconnects (backend may have new rooms)
      if (ready) {
        fetchAllRooms().then((rooms) => {
          if (rooms.length > 0) {
            dispatch({ type: "SET_KNOWN_ROOMS", rooms });
          }
        });
      }
    });

    const unsubMessage = chatterWs.onMessage((data) => {
      switch (data.type) {
        case "room_joined":
          dispatch({ type: "ROOM_JOINED", room: data.room, messages: data.messages });
          break;

        case "room_left":
          dispatch({ type: "ROOM_LEFT", roomId: data.roomId });
          break;

        case "room_created":
          // Add the newly created room to known rooms AND re-fetch the full list
          // so other clients can see it too (they poll on WS connect, but this
          // client is the source of truth immediately).
          dispatch({ type: "ADD_KNOWN_ROOM", room: data.room });
          break;

        case "new_message":
          dispatch({ type: "NEW_MESSAGE", message: data.message });
          break;

        case "error":
          // Handled locally by components
          break;
      }
    });

    return () => {
      unsubStatus();
      unsubMessage();
    };
  }, []);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

// ── Convenience hooks ─────────────────────────────────────────────────────────

export function useActiveRoom() {
  const { state } = useChatStore();
  if (!state.activeRoomId) return null;
  return state.knownRooms.find((r) => r.id === state.activeRoomId) ?? null;
}

export function useRoomMessages(roomId: string | null) {
  const { state } = useChatStore();
  if (!roomId) return [];
  return state.messages[roomId] ?? [];
}

// Action dispatchers
export function useDispatch() {
  const { dispatch } = useChatStore();

  const setActiveRoom = useCallback(
    (roomId: string | null) => dispatch({ type: "SET_ACTIVE_ROOM", roomId }),
    [dispatch]
  );

  const openCreateRoomModal = useCallback(
    () => dispatch({ type: "OPEN_CREATE_ROOM_MODAL" }),
    [dispatch]
  );

  const openJoinRoomModal = useCallback(
    (roomId: string, roomName?: string) =>
      dispatch({ type: "OPEN_JOIN_ROOM_MODAL", roomId, roomName }),
    [dispatch]
  );

  const openSettingsModal = useCallback(
    () => dispatch({ type: "OPEN_SETTINGS_MODAL" }),
    [dispatch]
  );

  const setTheme = useCallback(
    (theme: Theme) => dispatch({ type: "SET_THEME", theme }),
    [dispatch]
  );

  const setAccentColor = useCallback(
    (accentColor: AccentColor) => dispatch({ type: "SET_ACCENT_COLOR", accentColor }),
    [dispatch]
  );

  return {
    dispatch,
    setActiveRoom,
    openCreateRoomModal,
    openJoinRoomModal,
    openSettingsModal,
    setTheme,
    setAccentColor,
  };
}
