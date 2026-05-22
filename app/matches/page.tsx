"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MatchesPage() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [oddsMap, setOddsMap] = useState<Record<string, any>>({});
  const [loadingOdds, setLoadingOdds] = useState<Record<string, boolean>>({});

  // 1. 確認登入狀態
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

  // 2. 載入比賽列表
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

  // 3. 載入詳細賠率（Pro 專屬）
  const loadDetailedOdds = async (matchId: string) => {
    setLoadingOdds(prev => ({ ...prev, [matchId]: true }));
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("請先登入");
      setLoadingOdds(prev => ({ ...prev, [matchId]: false }));
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/odds/detailed/${matchId}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      if (res.ok) {
        const odds = await res.json();
        setOddsMap(prev => ({ ...prev, [matchId]: odds }));
      } else {
        alert("無權限或載入失敗");
      }
    } catch (err) {
      console.error("載入詳細賠率失敗", err);
    } finally {
      setLoadingOdds(prev => ({ ...prev, [matchId]: false }));
    }
  };

  if (loading) return <p>載入中...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>比賽列表</h1>
      {!user ? (
        <p>
          <a href="/login">登入</a> | <a href="/register">註冊</a>
        </p>
      ) : (
        <p>目前會員等級：{tier === "pro" ? "Pro" : "免費"}</p>
      )}

      {matches.map((match) => (
        <div key={match.id} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
          <strong>{match.home_team} vs {match.away_team}</strong>
          <br />
          {!user ? (
            <span>🔒 登入後解鎖詳細賠率</span>
          ) : tier !== "pro" ? (
            <span>🔒 升級 Pro 解鎖詳細賠率</span>
          ) : (
            <button
              onClick={() => loadDetailedOdds(match.id)}
              disabled={loadingOdds[match.id]}
            >
              {loadingOdds[match.id] ? "載入中..." : "載入詳細賠率"}
            </button>
          )}

          {/* 顯示詳細賠率內容 */}
          {oddsMap[match.id] && (
            <div style={{ marginTop: "0.5rem", background: "#f9f9f9", padding: "0.5rem", borderRadius: "4px" }}>
              {oddsMap[match.id].asian_handicap && (
                <p>
                  🏆 讓球盤：主隊 {oddsMap[match.id].asian_handicap.home > 0 ? "+" : ""}{oddsMap[match.id].asian_handicap.home} ({oddsMap[match.id].asian_handicap.home_odds}) vs 客隊 {oddsMap[match.id].asian_handicap.away > 0 ? "+" : ""}{oddsMap[match.id].asian_handicap.away} ({oddsMap[match.id].asian_handicap.away_odds})
                </p>
              )}
              {oddsMap[match.id].over_under && (
                <p>
                  ⚽ 大小球：{oddsMap[match.id].over_under.line} 大 {oddsMap[match.id].over_under.over_odds} / 小 {oddsMap[match.id].over_under.under_odds}
                </p>
              )}
              {oddsMap[match.id].btts && (
                <p>
                  🥅 兩隊是否進球 (BTTS)：是 {oddsMap[match.id].btts.yes_odds} / 否 {oddsMap[match.id].btts.no_odds}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}