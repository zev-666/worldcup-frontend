"use client";
import { useEffect, useState } from "react";
import MemberGate from "@/components/MemberGate";

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
  home_prob: number;
  draw_prob: number;
  away_prob: number;
  over_prob: number;
  under_prob: number;
  expected_goals: number;
  btts_yes: number;
  btts_no: number;
  confidence: number;
  model_warning?: string | null;
}

interface PredictionResponse {
  match: { home_team: string; away_team: string; kickoff_utc: string };
  elo: { home: number; away: number };
  prediction: Prediction;
  disclaimer: string;
}

interface DetailedOdds {
  asian_handicap: Record<string, number>;
  over_under: Record<string, number>;
  btts: Record<string, number>;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tier, setTier] = useState<string>("free");
  const [userEmail, setUserEmail] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPred, setExpandedPred] = useState<Record<string, boolean>>({});
  const [predictions, setPredictions] = useState<Record<string, PredictionResponse>>({});
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
            setUserEmail(me.email || "");
          }
        }
        const matchRes = await fetch(`${API_URL}/matches/`, {
          headers: stored ? { Authorization: `Bearer ${stored}` } : {},
        });
        if (matchRes.ok) {
          setMatches(await matchRes.json());
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
        const data: PredictionResponse = await predRes.json();
        setPredictions((prev) => ({ ...prev, [matchId]: data }));
      }
      if (tier === "pro" && token) {
        const oddsRes = await fetch(`${API_URL}/odds/detailed/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (oddsRes.ok) {
          setDetailedOdds((prev) => ({ ...prev, [matchId]: await oddsRes.json() }));
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
      {/* 標題列 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          ⚽ World Cup 2026 賽事
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
              tier === "pro"
                ? "bg-emerald-700 text-white"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {tier === "pro" ? "⚡ Pro" : "免費版"}
          </span>
          <a href="/" className="text-sm text-blue-600 hover:underline">
            返回首頁
          </a>
        </div>
      </div>

      {matches.length === 0 && (
        <p className="text-center text-gray-400">目前沒有賽事資料</p>
      )}

      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            tier={tier}
            userEmail={userEmail}
            isExpanded={!!expandedPred[match.id]}
            isLoading={!!predLoading[match.id]}
            prediction={predictions[match.id] || null}
            detailedOdds={detailedOdds[match.id] || null}
            onToggle={() => togglePrediction(match.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── 比賽卡片 ────────────────────────────────────────────────

function MatchCard({
  match, tier, userEmail, isExpanded, isLoading, prediction, detailedOdds, onToggle,
}: {
  match: Match;
  tier: string;
  userEmail: string;
  isExpanded: boolean;
  isLoading: boolean;
  prediction: PredictionResponse | null;
  detailedOdds: DetailedOdds | null;
  onToggle: () => void;
}) {
  const kickoff = new Date(match.kickoff_utc);
  const isFinished = match.status === "finished";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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
              {match.stage && <span className="ml-2">‧ {match.stage}</span>}
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
            {isLoading ? "載入中" : isExpanded ? "▲ 收起" : "📊 查看預測"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
          {isLoading ? (
            <p className="text-sm text-gray-400">正在載入預測...</p>
          ) : !prediction ? (
            <p className="text-sm text-gray-400">預測資料不可用</p>
          ) : (
            <>
              {/* ELO 資訊 */}
              <div className="flex gap-4 mb-4 text-xs text-gray-500">
                <span>🏠 {match.home_team} ELO: <strong>{prediction.elo.home}</strong></span>
                <span>✈️ {match.away_team} ELO: <strong>{prediction.elo.away}</strong></span>
              </div>

              {/* 模型警示 */}
              {prediction.prediction.model_warning && (
                <div className="mb-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  ⚠️ {prediction.prediction.model_warning}
                </div>
              )}

              {/* 1X2 機率 */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 mb-2">勝平負機率（1X2）</div>
                <div className="flex gap-3">
                  <ProbBox label="主勝" prob={prediction.prediction.home_prob} />
                  <ProbBox label="平局" prob={prediction.prediction.draw_prob} />
                  <ProbBox label="客勝" prob={prediction.prediction.away_prob} />
                </div>
              </div>

              {/* O/U + BTTS：Pro 看完整，Free 看鎖定提示 */}
              {tier === "pro" ? (
                <>
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      大小球（O/U 2.5）｜預期進球：{prediction.prediction.expected_goals}
                    </div>
                    <div className="flex gap-3">
                      <ProbBox label="大球 Over" prob={prediction.prediction.over_prob} />
                      <ProbBox label="小球 Under" prob={prediction.prediction.under_prob} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">雙隊得分（BTTS）</div>
                    <div className="flex gap-3">
                      <ProbBox label="都進球" prob={prediction.prediction.btts_yes} />
                      <ProbBox label="有隊未進" prob={prediction.prediction.btts_no} />
                    </div>
                  </div>

                  <ConfidenceBar value={prediction.prediction.confidence} />

                  {detailedOdds && <DetailedOddsBlock odds={detailedOdds} />}
                </>
              ) : (
                <MemberGate userEmail={userEmail} label="大小球、BTTS、讓球詳細賠率" />
              )}

              {/* 免責聲明 */}
              <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                ⚠️ {prediction.disclaimer}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 詳細賠率區塊（Pro）────────────────────────────────────────

function DetailedOddsBlock({ odds }: { odds: DetailedOdds }) {
  return (
    <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
      <div className="text-xs font-bold text-emerald-700 mb-3">⚡ Pro 專屬賠率</div>
      {odds.asian_handicap && <OddsRow label="讓球" data={odds.asian_handicap} />}
      {odds.over_under && <OddsRow label="大小球" data={odds.over_under} />}
      {odds.btts && <OddsRow label="雙隊得分" data={odds.btts} />}
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

// ─── 機率方塊 ─────────────────────────────────────────────────

function ProbBox({ label, prob }: { label: string; prob?: number }) {
  if (prob === undefined) return null;
  const pct = Math.round(prob * 100);
  const isHigh = pct >= 40;
  return (
    <div
      className={`flex-1 text-center py-3 px-2 rounded-lg border ${
        isHigh ? "bg-emerald-50 border-emerald-200" : "bg-gray-100 border-gray-200"
      }`}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${isHigh ? "text-emerald-700" : "text-gray-800"}`}>
        {pct}%
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 60 ? "bg-emerald-700" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="mt-3 mb-4">
      <div className="text-xs text-gray-500 mb-1">模型信心度：{pct}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
