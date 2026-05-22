"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MatchesPage() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 客戶端啟動時，先確認目前的登入狀態
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          );
          if (res.ok) {
            const userData = await res.json();
            setTier(userData.tier);
          }
        } catch (err) {
          console.error("取得會員等級失敗", err);
        }
      }
    };
    checkUser();
  }, []);

  // 2. 載入比賽資料（這裡直接用你原本的 fetch）
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/`);
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
        }
      } catch (err) {
        console.error("載入比賽失敗", err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  // 3. 載入詳細賠率（Pro 會員專屬）
  const loadDetailedOdds = async (matchId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("請先登入");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/odds/detailed/${matchId}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (res.ok) {
        const odds = await res.json();
        alert(JSON.stringify(odds, null, 2)); // 這裡你可以改成自己喜歡的 UI
      } else {
        alert("無權限或載入失敗");
      }
    } catch (err) {
      console.error("載入詳細賠率失敗", err);
    }
  };

  if (loading) return <p>載入中...</p>;

  return (
    <div>
      <h1>比賽列表</h1>
      {!user ? (
        <p>
          <a href="/login">登入</a> | <a href="/register">註冊</a>
        </p>
      ) : (
        <p>目前會員等級：{tier === "pro" ? "Pro" : "免費"}</p>
      )}

      {matches.map((match) => (
        <div key={match.id} style={{ marginBottom: "1rem" }}>
          <strong>{match.home_team} vs {match.away_team}</strong>
          {!user ? (
            <p>🔒 登入後解鎖詳細賠率</p>
          ) : tier !== "pro" ? (
            <p>🔒 升級 Pro 解鎖詳細賠率</p>
          ) : (
            <button onClick={() => loadDetailedOdds(match.id)}>
              載入詳細賠率
            </button>
          )}
        </div>
      ))}
    </div>
  );
}