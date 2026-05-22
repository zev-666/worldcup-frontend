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

  const [expandedPred, setExpandedPred] = useState<Record<string, boolean>>({});
  const [predictions, setPredictions] = useState<Record<string, Prediction[]>>({});
  const [detailedOdds, setDetailedOdds] = useState<Record<string, DetailedOdds>>({});
  const [predLoading, setPredLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("sb-access-token");
    setToken(stored);

    const fetchData = async () => {
      try {
        if (stored) {
          const meRes = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (meRes.ok) {
            const me = await meRes.json();
            setTier(me.tier || "free");
          }
        }

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
    if (expandedPred[matchId]) {
      setExpandedPred((prev) => ({ ...prev, [matchId]: false }));
      return;
    }

    setExpandedPred((prev) => ({ ...prev, [matchId]: true }));

    if (predictions[matchId]) return;

    setPredLoading((prev) => ({ ...prev, [matchId]: true }));
    try {
      const predRes = await fetch(`${API_URL}/predict/${matchId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (predRes.ok) {
        const data = await predRes.json();
        const arr = Array.isArray(data) ? data : [data];
        setPredictions((prev) => ({ ...prev, [matchId]: arr }));
      }

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
      <div className="flex justify-center items-center h-64 text-gray-400">
        載入中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 頁首 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">⚽ World Cup 2026 賽事</h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
              tier === "pro"
                ? "bg-emerald-700 text-white"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {tier === "pro" ? "⭐ Pro" : "免費會員"}
          </span>
          <a href="/" className="text-sm text-blue-600 hover:underline">
            ← 首頁
          </a>
        </div>
      </div>

      {matches.length === 0 && (
        <p className="text-center text-gray-400">目前沒有賽事資料。</p>
      )}

      <div className="space-y-4">
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
    </div>
  );
}

// ─── 比賽卡片元件 ───────────────────────────────────────

function MatchCard({
  match,
  tier,
  isExpanded,
  isLoading,
  predictions,
  detailedOdds,
  onToggle,
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* 卡片頭部 */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-base font-bold text-gray-800 mb-1">
              {match.home_team}
              <span className="text-gray-400 mx-2 text-sm">vs</span>
              {match.away_team}
            </div>
            {isFinished && match.home_score !== null && (
              <div className="text-xl font-bold text-emerald-700 mb-1">
                {match.home_score} – {match.away_score}
              </div>
            )}
            <div className="text-xs text-gray-500">
              {kickoff.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
              {match.stage && <span className="ml-2">· {match.stage}</span>}
            </div>
          </div>
          <button
            onClick={onToggle}
            className={`text-sm px-4 py-2 rounded-lg border font-medium transition-colors ${
              isExpanded
                ? "bg-gray-100 border-gray-300 text-gray-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {isLoading ? "載入中…" : isExpanded ? "▲ 收起" : "📊 查看預測"}
          </button>
        </div>
      </div>

      {/* 展開預測區塊 */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
          {isLoading ? (
            <p className="text-sm text-gray-400">分析中，請稍候…</p>
          ) : predictions.length === 0 ? (
            <p className="text-sm text-gray-400">預測資料暫無。</p>
          ) : (
            <>
              <PredictionBlock predictions={predictions} tier={tier} />
              {tier === "pro" && detailedOdds && (
                <DetailedOddsBlock odds={detailedOdds} />
              )}
              {tier !== "pro" && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  🔒 <strong>Pro 會員</strong>可查看亞洲讓球、大小球市場賠率與信心分析
                </div>
              )}
              <p className="mt-4 text-xs text-gray-400 leading-relaxed">
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
      <div className="text-sm font-semibold text-gray-600 mb-3">
        📈 模型預測（機率）
      </div>

      {pred1x2 && !pred1x2.error && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">勝平負（1X2）</div>
          <div className="flex gap-3">
            <ProbBox label="主勝" prob={pred1x2.home_prob} />
            <ProbBox label="和局" prob={pred1x2.draw_prob} />
            <ProbBox label="客勝" prob={pred1x2.away_prob} />
          </div>
          {pred1x2.model_warning && (
            <div className="mt-2 text-xs text-amber-600">
              ⚠ {pred1x2.model_warning}
            </div>
          )}
        </div>
      )}

      {tier === "pro" && predOU && !predOU.error && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-2">
            大小球（OU {predOU.over_prob !== undefined ? "2.5" : ""}）
          </div>
          <div className="flex gap-3 items-center">
            <ProbBox label="大球" prob={predOU.over_prob} />
            <ProbBox label="小球" prob={predOU.under_prob} />
            {predOU.expected_goals !== undefined && (
              <span className="text-xs text-gray-500">
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
    <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
      <div className="text-xs font-bold text-emerald-700 mb-3">
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
    <div className="mb-2 text-sm">
      <span className="text-gray-600 font-medium w-20 inline-block">{label}：</span>
      {Object.entries(data).map(([k, v]) => (
        <span key={k} className="mr-3">
          <span className="text-gray-400">{k} </span>
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
    <div
      className={`flex-1 text-center py-3 px-2 rounded-lg ${
        isHigh
          ? "bg-emerald-50 border-emerald-200"
          : "bg-gray-100 border-gray-200"
      } border`}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={`text-xl font-bold ${
          isHigh ? "text-emerald-700" : "text-gray-800"
        }`}
      >
        {pct}%
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 60 ? "bg-emerald-700" : pct >= 40 ? "bg-amber-500" : "bg-red-600";
  return (
    <div className="mt-3">
      <div className="text-xs text-gray-500 mb-1">模型信心度：{pct}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}