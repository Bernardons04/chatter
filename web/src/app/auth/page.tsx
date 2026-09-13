"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { saveUser, getUserId, getUsername } from "@/lib/localStorage";
import { useChatStore } from "@/store/chatStore";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch } = useChatStore();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // If already authenticated, skip
    if (getUserId() && getUsername()) {
      router.replace("/rooms");
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 32) {
      setError("Username must be 32 characters or less.");
      return;
    }

    const userId = uuidv4();
    saveUser(userId, trimmed);
    dispatch({ type: "SET_USER", userId, username: trimmed });

    const redirect = searchParams.get("redirect");
    router.replace(redirect ?? "/rooms");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--bg-sidebar)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "2.5rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: `hsl(var(--accent))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 1rem",
              boxShadow: `0 8px 24px hsl(var(--accent) / 0.4)`,
            }}
          >
            💬
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 0.5rem",
            }}
          >
            Welcome to Chatter
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Choose a username to get started. No account or email required.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label
              htmlFor="username-input"
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Username
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="e.g. cooldev42"
              maxLength={32}
              autoFocus
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "var(--bg-input)",
                border: "1.5px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text-primary)",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "hsl(var(--accent))")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border)")
              }
            />
            {error && (
              <p
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.8125rem",
                  color: "#f87171",
                }}
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            style={{
              width: "100%",
              padding: "0.8rem",
              background: `hsl(var(--accent))`,
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s, transform 0.1s",
              boxShadow: `0 4px 16px hsl(var(--accent) / 0.35)`,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.opacity = "0.9";
              (e.target as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.opacity = "1";
              (e.target as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Enter Chatter →
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Your username is stored locally and never sent to any server.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
