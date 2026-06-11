"use client";
import { useEffect, useState } from "react";
import MemberGate from "@/components/MemberGate";
import OddsDetail from "../components/OddsDetail";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const TEAM_ZH: Record<string, string> = {
  "Canada": "加拿大", "Mexico": "墨西哥", "USA": "美國",
  "United States": "美國", "Brazil": "巴西", "Argentina": "阿根廷",
  "France": "法國", "Germany": "德國", "Spain": "西班牙",
  "England": "英格蘭", "Portugal": "葡萄牙", "Netherlands": "荷蘭",
  "Belgium": "比利時", "Italy": "義大利", "Croatia": "克羅埃西亞",
  "Morocco": "摩洛哥", "Senegal": "塞內加爾", "Ghana": "加納",
  "Cameroon": "喀麥隆", "Nigeria": "奈及利亞", "South Korea": "南韓",
  "Japan": "日本", "Australia": "澳洲", "Iran": "伊朗",
  "Saudi Arabia": "沙烏地阿拉伯", "Qatar": "卡達", "Ecuador": "厄瓜多",
  "Uruguay": "烏拉圭", "Colombia": "哥倫比亞", "Chile": "智利",
  "Peru": "秘魯", "Venezuela": "委內瑞拉", "Paraguay": "巴拉圭",
  "Bolivia": "玻利維亞", "Switzerland": "瑞士", "Poland": "波蘭",
  "Serbia": "塞爾維亞", "Denmark": "丹麥", "Austria": "奧地利",
  "Sweden": "瑞典", "Hungary": "匈牙利", "Czechia": "捷克",
  "Slovakia": "斯洛伐克", "Wales": "威爾斯", "Scotland": "蘇格蘭",
  "Ukraine": "烏克蘭", "Turkey": "土耳其", "Greece": "希臘",
  "Romania": "羅馬尼亞", "Algeria": "阿爾及利亞", "Egypt": "埃及",
  "Tunisia": "突尼西亞", "Mali": "馬利", "Ivory Coast": "象牙海岸",
  "Costa Rica": "哥斯大黎加", "Panama": "巴拿馬",
  "Honduras": "宏都拉斯", "Jamaica": "牙買加",
  "New Zealand": "紐西蘭", "Bosnia & Herzegovina": "波士尼亞",
  "Bosnia and Herzegovina": "波士尼亞", "North Macedonia": "北馬其頓",
  "Albania": "阿爾巴尼亞", "Slovenia": "斯洛維尼亞",
  "China PR": "中國", "China": "中國", "Iraq": "伊拉克",
  "United Arab Emirates": "阿聯", "Uzbekistan": "烏茲別克",
  "Indonesia": "印尼", "Thailand": "泰國", "Vietnam": "越南",
  "Philippines": "菲律賓", "Malaysia": "馬來西亞",
};

function getTeamZh(name: string): string {
  return TEAM_ZH[name] || name;
}

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
  match: { home_team: string; away_team: string; kickoff_utc: string; stage?: string };
  elo: { home: number; away: number };
  prediction: Prediction;
  disclaimer: string;
}

interface DetailedOdds {
  asian_handicap: Record<string, number>;
  over_under: Record<string, number>;
  btts: Record<string, number>;
}

// ── Language strings ──────────────────────────────────────────
type Lang = "zh" | "en";
const T = {
  zh: {
    loading: "載入中...", loadPred: "分析中...", noPred: "無預測資料",
    home: "首頁", stage: "小組賽", ko: "淘汰賽",
    viewPred: "查看 AI 分析", collapse: "收起",
    eloPfx: "ELO —", homeLabel: "主場勝", draw: "和局", away: "客場勝",
    confLabel: "信心指數", probLabel: "1X2 機率",
    ouLabel: (eg: number) => `大小球 O/U 2.5 — 預期進球 ${eg}`,
    bttsLabel: "雙方進球 (BTTS)",
    bttsYes: "都進球", bttsNo: "未都進",
    lockLabel: "升級 Pro 解鎖：讓球 / 大小球 / BTTS 詳細賠率",
    disclaimer: "以上為機率分析，不構成投注建議",
    footer: "本平台預測結果為機率數值，不構成任何投注建議。請理性評估風險。",
    noMatches: "暫無賽事資料",
    headerTag: "AI 驅動賽事分析平台",
    headerTitle: "比賽預測",
    headerSub: (n: number) => `共 ${n} 場賽事 · Poisson 模型 · 真實 ELO`,
    tiScore: "台北時間",
    proLabel: "⚡ PRO",
    freeLabel: "FREE",
    navMatches: "賽事",
  },
  en: {
    loading: "Loading...", loadPred: "Analysing...", noPred: "No prediction data",
    home: "Home", stage: "Group Stage", ko: "Knockout",
    viewPred: "View AI Analysis", collapse: "Collapse",
    eloPfx: "ELO —", homeLabel: "Home", draw: "Draw", away: "Away",
    confLabel: "Confidence", probLabel: "1X2 Probability",
    ouLabel: (eg: number) => `Over/Under 2.5 — Expected goals ${eg}`,
    bttsLabel: "Both Teams to Score (BTTS)",
    bttsYes: "Yes", bttsNo: "No",
    lockLabel: "Upgrade Pro: Asian Handicap / Over-Under / BTTS odds",
    disclaimer: "Statistical analysis only — not betting advice",
    footer: "All predictions are probability estimates only and do not constitute betting advice.",
    noMatches: "No fixtures found",
    headerTag: "AI-Powered Match Analytics",
    headerTitle: "Predictions",
    headerSub: (n: number) => `${n} fixtures · Poisson model · Real ELO`,
    tiScore: "Taipei time",
    proLabel: "⚡ PRO",
    freeLabel: "FREE",
    navMatches: "Fixtures",
  },
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tier, setTier] = useState("free");
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("zh");
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
        if (matchRes.ok) setMatches(await matchRes.json());
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
      setExpandedPred((p) => ({ ...p, [matchId]: false }));
      return;
    }
    setExpandedPred((p) => ({ ...p, [matchId]: true }));
    if (predictions[matchId]) return;
    setPredLoading((p) => ({ ...p, [matchId]: true }));
    try {
      const r = await fetch(`${API_URL}/predict/${matchId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (r.ok) setPredictions((p) => ({ ...p, [matchId]: await r.json() }));
      if (tier === "pro" && token) {
        const o = await fetch(`${API_URL}/odds/detailed/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (o.ok) setDetailedOdds((p) => ({ ...p, [matchId]: await o.json() }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPredLoading((p) => ({ ...p, [matchId]: false }));
    }
  };

  const t = T[lang];

  if (loading) return (
    <div style={{ background: "#060912", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", animation: "wc-blink 1.2s infinite" }}></div>
      <span style={{ fontSize: 13, color: "#bfdbfe", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.loading}</span>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="wc-root">

        {/* NAV */}
        <nav className="wc-nav">
          <div className="wc-logo">WC<span>2026</span></div>
          <div className="wc-nav-right">
            {/* Language toggle */}
            <div className="wc-ltog">
              <button className={`wc-lb${lang === "en" ? " on" : ""}`} onClick={() => setLang("en")}>EN</button>
              <button className={`wc-lb${lang === "zh" ? " on" : ""}`} onClick={() => setLang("zh")}>中文</button>
            </div>
            <span className={`wc-tier-badge${tier === "pro" ? " pro" : ""}`}>
              {tier === "pro" ? t.proLabel : t.freeLabel}
            </span>
            <a href="/" className="wc-nav-link">{t.home}</a>
          </div>
        </nav>

        {/* HEADER */}
        <div className="wc-header">
          <div className="wc-header-tag">
            <span className="wc-live-dot"></span>
            {t.headerTag}
          </div>
          <h1 className="wc-title">{t.headerTitle}</h1>
          <p className="wc-sub">{t.headerSub(matches.length)}</p>
        </div>

        {/* TRUST BAR */}
        <div className="wc-trust">
          <span className="wc-trust-item">⚡ Poisson {lang === "zh" ? "迴歸模型" : "regression"}</span>
          <span className="wc-trust-div"></span>
          <span className="wc-trust-item">🗄 {lang === "zh" ? "10 年歷史數據" : "10 yrs historical data"}</span>
          <span className="wc-trust-div"></span>
          <span className="wc-trust-item">🛡 Pinnacle + Bet365</span>
          <span className="wc-trust-div"></span>
          <span className="wc-trust-item">🔄 {lang === "zh" ? "每 6 小時更新" : "Updated every 6h"}</span>
        </div>

        {/* MATCHES */}
        <div className="wc-list">
          {matches.length === 0 && <div className="wc-empty">{t.noMatches}</div>}
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              tier={tier}
              lang={lang}
              userEmail={userEmail}
              isExpanded={!!expandedPred[match.id]}
              isLoading={!!predLoading[match.id]}
              prediction={predictions[match.id] || null}
              detailedOdds={detailedOdds[match.id] || null}
              onToggle={() => togglePrediction(match.id)}
              t={t}
            />
          ))}
        </div>

        <div className="wc-footer">{t.footer}</div>
      </div>
    </>
  );
}

function MatchCard({ match, tier, lang, userEmail, isExpanded, isLoading, prediction, detailedOdds, onToggle, t }: {
  match: Match; tier: string; lang: Lang; userEmail: string;
  isExpanded: boolean; isLoading: boolean;
  prediction: PredictionResponse | null; detailedOdds: DetailedOdds | null;
  onToggle: () => void; t: typeof T["zh"];
}) {
  const kickoff = new Date(match.kickoff_utc);
  const timeStr = kickoff.toLocaleString(lang === "zh" ? "zh-TW" : "en-GB", {
    timeZone: "Asia/Taipei", month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const isFinished = match.status === "finished";
  const stageLabel = match.stage?.toLowerCase().includes("group")
    ? t.stage
    : match.stage?.toLowerCase().includes("final") || match.stage?.toLowerCase().includes("knock")
      ? t.ko
      : match.stage || t.stage;

  return (
    <div className={`wc-card${isExpanded ? " expanded" : ""}`}>
      <div className="wc-card-main" onClick={onToggle}>
        <div className="wc-card-left">
          <div className="wc-card-meta">
            <span className="wc-stage-tag">{stageLabel}</span>
            <span className="wc-time">{timeStr} {t.tiScore}</span>
          </div>
          <div className="wc-teams">
            <div className="wc-team">
              <span className="wc-team-zh">{lang === "zh" ? getTeamZh(match.home_team) : match.home_team}</span>
              <span className="wc-team-en">{lang === "zh" ? match.home_team : getTeamZh(match.home_team)}</span>
            </div>
            <span className="wc-vs">VS</span>
            <div className="wc-team">
              <span className="wc-team-zh">{lang === "zh" ? getTeamZh(match.away_team) : match.away_team}</span>
              <span className="wc-team-en">{lang === "zh" ? match.away_team : getTeamZh(match.away_team)}</span>
            </div>
          </div>
          {isFinished && match.home_score !== null && (
            <div className="wc-score">{match.home_score} — {match.away_score}</div>
          )}
        </div>
        <button className="wc-toggle-btn">
          {isLoading ? "..." : isExpanded ? "▲" : t.viewPred}
        </button>
      </div>

      {isExpanded && (
        <div className="wc-expand">
          {isLoading ? (
            <p className="wc-loading-txt">{t.loadPred}</p>
          ) : !prediction ? (
            <p className="wc-loading-txt">{t.noPred}</p>
          ) : (
            <>
              {prediction.prediction.model_warning && (
                <div className="wc-warn">⚠ {prediction.prediction.model_warning}</div>
              )}

              {/* ELO */}
              <div className="wc-elo-row">
                <span>{t.eloPfx} {lang === "zh" ? getTeamZh(match.home_team) : match.home_team}: <strong>{prediction.elo.home}</strong></span>
                <span>{lang === "zh" ? getTeamZh(match.away_team) : match.away_team}: <strong>{prediction.elo.away}</strong></span>
              </div>

              {/* 1X2 */}
              <div className="wc-prob-section">
                <div className="wc-prob-label">{t.probLabel}</div>
                <div className="wc-prob-row">
                  <ProbBox label={t.homeLabel} prob={prediction.prediction.home_prob} color="blue" />
                  <ProbBox label={t.draw}      prob={prediction.prediction.draw_prob} color="neutral" />
                  <ProbBox label={t.away}      prob={prediction.prediction.away_prob} color="dim" />
                </div>
              </div>

              {/* Confidence */}
              <div className="wc-conf">
                <span className="wc-conf-label">{t.confLabel}</span>
                <div className="wc-conf-bg">
                  <div className="wc-conf-fill" style={{ width: `${Math.round(prediction.prediction.confidence * 100)}%` }}></div>
                </div>
                <span className="wc-conf-val">{Math.round(prediction.prediction.confidence * 100)}%</span>
              </div>

              {/* Pro section */}
              {tier === "pro" ? (
                <>
                  <div className="wc-prob-section">
                    <div className="wc-prob-label">{t.ouLabel(prediction.prediction.expected_goals)}</div>
                    <div className="wc-prob-row">
                      <ProbBox label={lang === "zh" ? "大球 Over" : "Over"} prob={prediction.prediction.over_prob}  color="blue" />
                      <ProbBox label={lang === "zh" ? "小球 Under" : "Under"} prob={prediction.prediction.under_prob} color="dim" />
                    </div>
                  </div>
                  <div className="wc-prob-section">
                    <div className="wc-prob-label">{t.bttsLabel}</div>
                    <div className="wc-prob-row">
                      <ProbBox label={t.bttsYes} prob={prediction.prediction.btts_yes} color="blue" />
                      <ProbBox label={t.bttsNo}  prob={prediction.prediction.btts_no}  color="dim" />
                    </div>
                  </div>
                  {detailedOdds?.asian_handicap && (
                    <OddsDetail
                      homeTeam={match.home_team}
                      awayTeam={match.away_team}
                      odds={{
                        home_odds:   Object.values(detailedOdds.asian_handicap)[0] ?? 1.90,
                        away_odds:   Object.values(detailedOdds.asian_handicap)[1] ?? 1.90,
                        line:        0.5,
                        over_odds:   detailedOdds.over_under?.["Over 2.5"]  ?? detailedOdds.over_under?.["over"]  ?? 1.90,
                        under_odds:  detailedOdds.over_under?.["Under 2.5"] ?? detailedOdds.over_under?.["under"] ?? 1.90,
                        yes_odds:    detailedOdds.btts?.["Yes"] ?? detailedOdds.btts?.["yes"] ?? 1.90,
                        no_odds:     detailedOdds.btts?.["No"]  ?? detailedOdds.btts?.["no"]  ?? 1.90,
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="wc-lock">
                  <span>🔒</span>
                  <span className="wc-lock-txt">{t.lockLabel}</span>
                </div>
              )}

              <p className="wc-disclaimer">{t.disclaimer}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProbBox({ label, prob, color }: { label: string; prob?: number; color: "blue" | "dim" | "neutral" }) {
  if (prob === undefined) return null;
  const pct = Math.round(prob * 100);
  return (
    <div className={`wc-prob-box ${color}`}>
      <div className="wc-prob-pct">{pct}%</div>
      <div className="wc-prob-lbl">{label}</div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

@keyframes wc-blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
@keyframes wc-pulse{0%,100%{opacity:1}50%{opacity:.3}}

*{box-sizing:border-box;margin:0;padding:0}

:root{
  --wc-bg:#060912;
  --wc-s1:#0b1120;
  --wc-s2:#101929;
  --wc-s3:#1a2840;
  --wc-blue:#3b82f6;
  --wc-sky:#60a5fa;
  --wc-text:#f1f5ff;
  --wc-body:#bfdbfe;
  --wc-dim:#93c5fd;
  --wc-border:rgba(147,197,253,0.22);
  --wc-border2:rgba(147,197,253,0.38);
  --wc-amber:#fbbf24;
  --wc-amber-dim:rgba(251,191,36,0.13);
  --wc-amber-bdr:rgba(251,191,36,0.4);
  --wc-green:#4ade80;
  --wc-red:#f87171;
  --f:'Plus Jakarta Sans',sans-serif;
}

.wc-root{background:var(--wc-bg);min-height:100vh;color:var(--wc-text);font-family:var(--f);-webkit-font-smoothing:antialiased}

/* NAV */
.wc-nav{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:54px;background:rgba(6,9,18,0.97);border-bottom:1px solid var(--wc-border2);position:sticky;top:0;z-index:100;backdrop-filter:blur(10px)}
.wc-logo{font-size:17px;font-weight:800;letter-spacing:-0.03em;color:var(--wc-text)}
.wc-logo span{color:var(--wc-sky)}
.wc-nav-right{display:flex;align-items:center;gap:10px}
.wc-ltog{display:flex;background:var(--wc-s2);border:1.5px solid var(--wc-border2);border-radius:8px;padding:2px;gap:2px}
.wc-lb{font-family:var(--f);font-size:11px;font-weight:700;padding:4px 11px;border-radius:6px;border:none;background:transparent;color:var(--wc-body);cursor:pointer;transition:all .15s}
.wc-lb.on{background:var(--wc-blue);color:#fff}
.wc-tier-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;background:var(--wc-s2);border:1.5px solid var(--wc-border2);color:var(--wc-body)}
.wc-tier-badge.pro{background:rgba(59,130,246,0.18);border-color:rgba(147,197,253,0.45);color:var(--wc-sky)}
.wc-nav-link{font-size:12px;font-weight:600;color:var(--wc-body);text-decoration:none;transition:.15s}
.wc-nav-link:hover{color:var(--wc-text)}

/* HEADER */
.wc-header{padding:32px 20px 20px;position:relative;overflow:hidden}
.wc-header::before{content:'';position:absolute;top:-80px;left:-60px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.18),transparent 70%);pointer-events:none}
.wc-header::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,rgba(96,165,250,0.4) 50%,transparent 95%)}
.wc-header-tag{font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--wc-sky);margin-bottom:10px;display:flex;align-items:center;gap:7px;position:relative;z-index:1}
.wc-live-dot{width:6px;height:6px;border-radius:50%;background:var(--wc-red);animation:wc-pulse 1.4s infinite}
.wc-title{font-size:26px;font-weight:800;letter-spacing:-0.025em;color:var(--wc-text);margin-bottom:4px;position:relative;z-index:1}
.wc-sub{font-size:13px;font-weight:500;color:var(--wc-body);position:relative;z-index:1}

/* TRUST BAR */
.wc-trust{background:var(--wc-s1);border-top:1px solid var(--wc-border2);border-bottom:1px solid var(--wc-border2);padding:10px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.wc-trust-item{font-size:11px;font-weight:600;color:var(--wc-body)}
.wc-trust-div{width:1px;height:14px;background:var(--wc-border2)}

/* LIST */
.wc-list{padding:16px 16px 0}
.wc-empty{text-align:center;padding:48px;color:var(--wc-body);font-size:14px}

/* CARD */
.wc-card{background:var(--wc-s1);border:1.5px solid var(--wc-border);border-radius:12px;margin-bottom:10px;overflow:hidden;transition:border-color .2s}
.wc-card:hover{border-color:var(--wc-border2)}
.wc-card.expanded{border-color:rgba(96,165,250,0.5)}
.wc-card-main{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;cursor:pointer;gap:12px}
.wc-card-left{flex:1;min-width:0}
.wc-card-meta{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.wc-stage-tag{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:2px 9px;border-radius:4px;background:rgba(59,130,246,0.12);border:1px solid rgba(147,197,253,0.25);color:var(--wc-dim)}
.wc-time{font-size:11px;font-weight:600;color:var(--wc-body)}

/* TEAMS */
.wc-teams{display:flex;align-items:center;gap:10px}
.wc-team{display:flex;align-items:baseline;gap:5px}
.wc-team-zh{font-size:15px;font-weight:700;color:var(--wc-text)}
.wc-team-en{font-size:10px;font-weight:500;color:var(--wc-dim)}
.wc-vs{font-size:10px;font-weight:700;color:rgba(147,197,253,0.35);background:var(--wc-s2);border:1px solid var(--wc-border);padding:3px 8px;border-radius:4px;flex-shrink:0}
.wc-score{font-size:18px;font-weight:800;color:var(--wc-sky);margin-top:6px;letter-spacing:-0.02em}

.wc-toggle-btn{font-size:12px;font-weight:700;padding:8px 14px;border-radius:8px;border:1.5px solid var(--wc-border2);color:var(--wc-body);background:transparent;cursor:pointer;transition:.15s;white-space:nowrap;flex-shrink:0}
.wc-toggle-btn:hover{border-color:var(--wc-sky);color:var(--wc-text)}

/* EXPAND */
.wc-expand{padding:16px;border-top:1px solid var(--wc-border2);background:rgba(6,9,18,0.6)}
.wc-loading-txt{font-size:13px;color:var(--wc-body);text-align:center;padding:16px}
.wc-warn{font-size:12px;color:var(--wc-amber);background:var(--wc-amber-dim);border:1px solid var(--wc-amber-bdr);border-radius:7px;padding:8px 12px;margin-bottom:12px}
.wc-elo-row{display:flex;gap:16px;font-size:12px;font-weight:500;color:var(--wc-body);margin-bottom:14px;flex-wrap:wrap}
.wc-elo-row strong{color:var(--wc-text)}

/* PROB */
.wc-prob-section{margin-bottom:14px}
.wc-prob-label{font-size:11px;font-weight:700;color:var(--wc-body);margin-bottom:8px;letter-spacing:.03em}
.wc-prob-row{display:flex;gap:8px}
.wc-prob-box{flex:1;text-align:center;padding:11px 6px;border-radius:8px;border:1.5px solid var(--wc-border)}
.wc-prob-box.blue{background:rgba(59,130,246,0.15);border-color:rgba(147,197,253,0.4)}
.wc-prob-box.dim{background:rgba(59,130,246,0.07);border-color:rgba(147,197,253,0.2)}
.wc-prob-box.neutral{background:var(--wc-s2);border-color:var(--wc-border)}
.wc-prob-pct{font-size:19px;font-weight:800;letter-spacing:-0.025em;color:var(--wc-text);line-height:1;margin-bottom:3px}
.wc-prob-box.blue .wc-prob-pct{color:var(--wc-sky)}
.wc-prob-lbl{font-size:10px;font-weight:600;color:var(--wc-body)}

/* CONFIDENCE */
.wc-conf{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.wc-conf-label{font-size:11px;font-weight:700;color:var(--wc-body);white-space:nowrap}
.wc-conf-bg{flex:1;height:4px;background:var(--wc-s3);border-radius:2px;overflow:hidden}
.wc-conf-fill{height:100%;border-radius:2px;background:var(--wc-blue);transition:width .6s ease}
.wc-conf-val{font-size:11px;font-weight:700;color:var(--wc-sky);min-width:30px;text-align:right}

/* LOCK */
.wc-lock{display:flex;align-items:flex-start;gap:8px;background:var(--wc-amber-dim);border:1.5px solid var(--wc-amber-bdr);border-radius:8px;padding:10px 13px;margin-bottom:12px}
.wc-lock-txt{font-size:11px;font-weight:700;color:var(--wc-amber);line-height:1.5}

.wc-disclaimer{font-size:11px;font-weight:500;color:var(--wc-body);margin-top:12px;padding-top:12px;border-top:1px solid var(--wc-border2)}

/* FOOTER */
.wc-footer{text-align:center;padding:24px 20px;font-size:11px;font-weight:500;color:var(--wc-body);border-top:1px solid var(--wc-border2);margin-top:8px}

@media(max-width:600px){
  .wc-teams{flex-wrap:wrap;gap:6px}
  .wc-card-main{flex-direction:column;align-items:flex-start}
  .wc-toggle-btn{align-self:flex-end;margin-top:4px}
  .wc-prob-row{gap:6px}
}
`;
