"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // ✅ 將 access token 存入 localStorage，供 matches 等頁面使用
      localStorage.setItem("sb-access-token", data.session.access_token);
      window.location.href = "/";
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>登入</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: "#1a5490",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          登入
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
      <p style={{ marginTop: "20px", fontSize: "14px", textAlign: "center" }}>
        還沒有帳號？ <a href="/register" style={{ color: "#1a5490" }}>註冊</a>
      </p>
    </div>
  );
}