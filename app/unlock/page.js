"use client";

import { useState } from "react";

export default function UnlockPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const params = new URLSearchParams(window.location.search);
    const from = params.get("from") || "/";

    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, from }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    window.location.href = data.redirectTo || "/";
  }

  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <form onSubmit={handleSubmit} style={{ maxWidth: 360, width: "100%" }}>
        <h1 style={{ fontSize: 20, marginBottom: 16 }}>This site is private</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 16,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />
        {error && (
          <p style={{ color: "crimson", marginBottom: 12 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px 12px", fontSize: 16 }}
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
