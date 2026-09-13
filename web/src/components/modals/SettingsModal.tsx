"use client";

import Modal from "@/components/ui/Modal";
import { useChatStore, ACCENT_COLORS, useDispatch } from "@/store/chatStore";
import type { Theme, AccentColor } from "@/types";

export default function SettingsModal() {
  const { state } = useChatStore();
  const { dispatch, setTheme, setAccentColor } = useDispatch();
  const open = state.modals.settings;

  function close() {
    dispatch({ type: "CLOSE_SETTINGS_MODAL" });
  }

  return (
    <Modal open={open} onClose={close} title="Settings" maxWidth="440px">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Theme */}
        <section>
          <SectionLabel>Theme</SectionLabel>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {(["dark", "light"] as Theme[]).map((t) => (
              <ThemeButton
                key={t}
                id={`theme-${t}`}
                theme={t}
                active={state.theme === t}
                onClick={() => setTheme(t)}
              />
            ))}
          </div>
        </section>

        {/* Accent color */}
        <section>
          <SectionLabel>Accent Color</SectionLabel>
          <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
            {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
              <AccentColorButton
                key={color}
                id={`accent-${color}`}
                color={color}
                active={state.accentColor === color}
                onClick={() => setAccentColor(color)}
              />
            ))}
          </div>
        </section>

        {/* Info */}
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Preferences are stored locally in your browser. They will persist after reloading the page.
        </p>
      </div>
    </Modal>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 0.75rem",
        fontSize: "0.8125rem",
        fontWeight: 600,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </p>
  );
}

function ThemeButton({
  theme,
  active,
  onClick,
  id,
}: {
  theme: Theme;
  active: boolean;
  onClick: () => void;
  id: string;
}) {
  const icons: Record<Theme, string> = { dark: "🌙", light: "☀️" };
  const labels: Record<Theme, string> = { dark: "Dark", light: "Light" };

  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        flex: 1,
        padding: "0.875rem 1rem",
        background: active ? "var(--accent-bg-strong)" : "var(--bg-hover)",
        border: `1.5px solid ${active ? "hsl(var(--accent))" : "var(--border)"}`,
        borderRadius: "12px",
        color: active ? "hsl(var(--accent))" : "var(--text-secondary)",
        fontFamily: "inherit",
        fontSize: "0.9375rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        transition: "all 0.15s",
      }}
    >
      <span>{icons[theme]}</span>
      <span>{labels[theme]}</span>
    </button>
  );
}

function AccentColorButton({
  color,
  active,
  onClick,
  id,
}: {
  color: AccentColor;
  active: boolean;
  onClick: () => void;
  id: string;
}) {
  const { hex, label } = ACCENT_COLORS[color];

  return (
    <button
      id={id}
      onClick={onClick}
      title={label}
      aria-label={`Accent color: ${label}`}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: hex,
        border: active
          ? `3px solid var(--text-primary)`
          : "3px solid transparent",
        cursor: "pointer",
        padding: 0,
        transition: "transform 0.15s, border-color 0.15s",
        transform: active ? "scale(1.15)" : "scale(1)",
        boxShadow: active ? `0 0 0 2px var(--bg-modal), 0 0 0 4px ${hex}` : "none",
      }}
    />
  );
}
