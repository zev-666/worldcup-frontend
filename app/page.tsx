"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setTier(userData.tier);
          }
        } catch (err) {
          console.error("取得會員等級失敗", err);
        }
      }
      setLoading(false);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setTier("");
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTier("");
  };

  if (loading) return <p>載入中...</p>;

  return (
    <div>
      <h1>FIFA World Cup 2026 數據分析平台</h1>
      {user ? (
        <div>
          <p>歡迎，{user.email}</p>
          <p>會員等級：{tier === "pro" ? "Pro" : "免費"}</p>
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : (
        <div>
          <a href="/login">登入</a> | <a href="/register">註冊</a>
        </div>
      )}
      <hr />
      <a href="/matches">查看比賽</a>
    </div>
  );
}