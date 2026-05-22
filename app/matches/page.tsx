"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  stage: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

interface Prediction {
  match_id: string;
  market: string;
  home_prob?: number;
  draw_prob?: number;
  away_prob?: number;
  over_prob?: number;
  under_prob?: number;
  expected_goals?: number;
  confidence?: number;
  model_warning?: string;
  error?: string;
}

interface DetailedOdds {
  asian_handicap?: Record<string, number>;
  over_under?: Record<string, number>;
  btts?: Record<string, number>;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tier, setTier] = useState<string>("free");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 每張卡片的展開狀態、預測資料、詳細賠率
  const [expandedPred, setExpandedPred] = useState<Record<string, boolean>>({});
  const [predictions, setPredictions] = useState<Record<string, Prediction[]>>({});
  const [detailedOdds, setDetailedOdds] = useState<Record<string, DetailedOdds>>({});
  const [predLoading, setPredLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("sb-access-token");
    setToken(stored);

    const fetchData = async () => {
      try {
        // 取得會員等級
        if (stored) {
          const meRes = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (meRes.ok) {
            const me = await meRes.json();
            setTier(me.tier || "free");
          }
        }

        // 取得比賽列表
        const matchRes = await fetch(`${API_URL}/matches/`, {
          headers: stored ? { Authorization: `Bearer ${stored}` } : {},
        });
        if (matchRes.ok) {
          const data = await matchRes.json();
          setMatches(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const togglePrediction = async (matchId: string) => {
    // 如果已展開，收起
    if (expandedPred[matchId]) {
      setExpandedPred((prev) => ({ ...prev, [matchId]: false }));
      return;
    }

    setExpandedPred((prev) => ({ ...prev, [matchId]: true }));

    // 已有資料就不重複抓
    if (predictions[matchId]) return;

    setPredLoading((prev) => ({ ...prev, [matchId]: true }));
    try {
      // 抓預測（所有人）
      const predRes = await fetch(`${API_URL}/predict/${matchId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (predRes.ok) {
        const data = await predRes.json();
        // 後端回傳格式可能是 array 或 object，統一轉 array
        const arr = Array.isArray(data) ? data : [data];
        setPredictions((prev) => ({ ...prev, [matchId]: arr }));
      }

      // Pro 會員額外抓詳細賠率
      if (tier === "pro" && token) {
        const oddsRes = await fetch(`${API_URL}/odds/detailed/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (oddsRes.ok) {
          const oddsData = await oddsRes.json();
          setDetailedOdds((prev) => ({ ...prev, [matchId]: oddsData }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPredLoading((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
        載入中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700 }}>⚽ World Cup 2026 賽事</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{
            fontSize: "12px", padding: "4px 10px", borderRadius: "99px",
            background: tier === "pro" ? "#1a6b3c" : "#e5e2da",
            color: tier === "pro" ? "#fff" : "#6b6860", fontWeight: 600,
          }}>
            {tier === "pro" ? "⭐ Pro" : "免費會員"}
          </span>
          <a href="/" style={{ fontSize: "13px", color: "#1a5490" }}>← 首頁</a>
        </div>
      </div>

      {matches.length === 0 && (
        <p style={{ color: "#888", textAlign: "center" }}>目前沒有賽事資料。</p>
      )}

      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          tier={tier}
          isExpanded={!!expandedPred[match.id]}
          isLoading={!!predLoading[match.id]}
          predictions={predictions[match.id] || []}
          detailedOdds={detailedOdds[match.id] || null}
          onToggle={() => togglePrediction(match.id)}
        />
      ))}
    </div>
  );
}

// ─── 比賽卡片元件 ───────────────────────────────────────

function MatchCard({
  match, tier, isExpanded, isLoading, predictions, detailedOdds, onToggle,
}: {
  match: Match;
  tier: string;
  isExpanded: boolean;
  isLoading: boolean;
  predictions: Prediction[];
  detailedOdds: DetailedOdds | null;
  onToggle: () => void;
}) {
  const kickoff = new Date(match.kickoff_utc);
  const isFinished = match.status === "finished";

  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e2da", borderRadius: "12px",
      marginBottom: "16px", overflow: "hidden",
    }}>
      {/* 卡片頭部 */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
              {match.home_team}
              <span style={{ color: "#888", margin: "0 8px", fontSize: "14px" }}>vs</span>
              {match.away_team}
            </div>
            {isFinished && match.home_score !== null && (
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#1a6b3c", marginBottom: "4px" }}>
                {match.home_score} – {match.away_score}
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#888" }}>
              {kickoff.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
              {match.stage && <span style={{ marginLeft: "8px" }}>· {match.stage}</span>}
            </div>
          </div>
          <button
            onClick={onToggle}
            style={{
              fontSize: "13px", padding: "6px 14px", borderRadius: "8px",
              border: "1px solid #e5e2da", background: isExpanded ? "#f0ede6" : "#fff",
              cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap",
            }}
          >
            {isLoading ? "載入中…" : isExpanded ? "▲ 收起" : "📊 查看預測"}
          </button>
        </div>
      </div>

      {/* 展開預測區塊 */}
      {isExpanded && (
        <div style={{ borderTop: "1px solid #f0ede6", padding: "16px 20px", background: "#fafaf8" }}>
          {isLoading ? (
            <p style={{ color: "#888", fontSize: "14px" }}>分析中，請稍候…</p>
          ) : predictions.length === 0 ? (
            <p style={{ color: "#888", fontSize: "14px" }}>預測資料暫無。</p>
          ) : (
            <>
              <PredictionBlock predictions={predictions} tier={tier} />
              {tier === "pro" && detailedOdds && (
                <DetailedOddsBlock odds={detailedOdds} />
              )}
              {tier !== "pro" && (
                <div style={{
                  marginTop: "12px", padding: "10px 14px", borderRadius: "8px",
                  background: "#fdf8e8", border: "1px solid #f0d060", fontSize: "13px", color: "#7a560a",
                }}>
                  🔒 <strong>Pro 會員</strong>可查看亞洲讓球、大小球市場賠率與信心分析
                </div>
              )}
              <p style={{ marginTop: "12px", fontSize: "11px", color: "#aaa", lineHeight: 1.5 }}>
                ⚠️ 以上數據為模型機率分析，不構成任何投注建議，請理性評估風險。
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 1X2 預測區塊 ────────────────────────────────────────

function PredictionBlock({ predictions, tier }: { predictions: Prediction[]; tier: string }) {
  const pred1x2 = predictions.find((p) => p.market === "1x2");
  const predOU = predictions.find((p) => p.market === "ou");

  return (
    <div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#555", marginBottom: "10px" }}>
        📈 模型預測（機率）
      </div>

      {pred1x2 && !pred1x2.error && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>勝平負（1X2）</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <ProbBox label="主勝" prob={pred1x2.home_prob} />
            <ProbBox label="和局" prob={pred1x2.draw_prob} />
            <ProbBox label="客勝" prob={pred1x2.away_prob} />
          </div>
          {pred1x2.model_warning && (
            <div style={{ marginTop: "6px", fontSize: "12px", color: "#b07d11" }}>
              ⚠ {pred1x2.model_warning}
            </div>
          )}
        </div>
      )}

      {/* Pro 才看大小球 */}
      {tier === "pro" && predOU && !predOU.error && (
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>
            大小球（OU {predOU.over_prob !== undefined ? "2.5" : ""}）
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <ProbBox label="大球" prob={predOU.over_prob} />
            <ProbBox label="小球" prob={predOU.under_prob} />
            {predOU.expected_goals !== undefined && (
              <span style={{ fontSize: "12px", color: "#888" }}>
                預測總進球：{predOU.expected_goals}
              </span>
            )}
          </div>
          {predOU.confidence !== undefined && (
            <ConfidenceBar value={predOU.confidence} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── 詳細賠率區塊（Pro） ─────────────────────────────────

function DetailedOddsBlock({ odds }: { odds: DetailedOdds }) {
  return (
    <div style={{
      marginTop: "14px", padding: "12px 14px", borderRadius: "8px",
      background: "#e8f5ee", border: "1px solid #b8dfc8",
    }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a6b3c", marginBottom: "8px" }}>
        ⭐ Pro 專屬：市場賠率
      </div>
      {odds.asian_handicap && (
        <OddsRow label="亞洲讓球" data={odds.asian_handicap} />
      )}
      {odds.over_under && (
        <OddsRow label="大小球" data={odds.over_under} />
      )}
      {odds.btts && (
        <OddsRow label="雙方進球" data={odds.btts} />
      )}
    </div>
  );
}

function OddsRow({ label, data }: { label: string; data: Record<string, number> }) {
  return (
    <div style={{ marginBottom: "6px", fontSize: "13px" }}>
      <span style={{ color: "#555", minWidth: "80px", display: "inline-block" }}>{label}：</span>
      {Object.entries(data).map(([k, v]) => (
        <span key={k} style={{ marginRight: "12px" }}>
          <span style={{ color: "#888" }}>{k} </span>
          <strong>{typeof v === "number" ? v.toFixed(2) : v}</strong>
        </span>
      ))}
    </div>
  );
}

// ─── 小工具元件 ──────────────────────────────────────────

function ProbBox({ label, prob }: { label: string; prob?: number }) {
  if (prob === undefined) return null;
  const pct = Math.round(prob * 100);
  const isHigh = pct >= 45;
  return (
    <div style={{
      flex: 1, textAlign: "center", padding: "10px 8px", borderRadius: "8px",
      background: isHigh ? "#e8f5ee" : "#f0ede6",
      border: `1px solid ${isHigh ? "#b8dfc8" : "#e5e2da"}`,
    }}>
      <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: isHigh ? "#1a6b3c" : "#333" }}>
        {pct}%
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 60 ? "#1a6b3c" : pct >= 40 ? "#b07d11" : "#c0392b";
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ fontSize: "11px", color: "#888", marginBottom: "3px" }}>
        模型信心度：{pct}%
      </div>
      <div style={{ background: "#e5e2da", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: "99px" }} />
      </div>
    </div>
  );
}