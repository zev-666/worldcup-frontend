"use client";
import { useEffect, useState } from "react";
import MemberGate from "@/components/MemberGate";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// 國家中文名稱對照表
const TEAM_ZH: Record<string, string> = {
  "Canada": "加拿大", "Mexico": "墨西哥", "USA": "美國",
  "United States": "美國", "Brazil": "巴西", "Argentina": "阿根廷",
  "France": "法國", "Germany": "德國", "Spain": "西班牙",
  "England": "英格蘭", "Portugal": "葡萄牙", "Netherlands": "荷蘭",
  "Belgium": "比利時", "Italy": "義大利", "Croatia": "克羅埃西亞",
  "Morocco": "摩洛哥", "Senegal": "塞內加爾", "Ghana": "迦納",
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
  "Honduras": "宏都拉斯", "Jamaica": "牙買加", "Trinidad and Tobago": "千里達",
  "New Zealand": "紐西蘭", "Bosnia & Herzegovina": "波士尼亞",
  "Bosnia and Herzegovina": "波士尼亞", "North Macedonia": "北馬其頓",
  "Albania": "阿爾巴尼亞", "Slovenia": "斯洛維尼亞",
  "China PR": "中國", "China": "中國", "Iraq": "伊拉克",
  "United Arab Emirates": "阿聯酋", "Uzbekistan": "烏茲別克",
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

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tier, setTier] = useState("free");
  const [userEmail, setUserEmail] = useState("");
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
      if (r.ok) {
        const predData = await r.json();
        setPredictions((p) => ({ ...p, [matchId]: predData }));
      }
      if (tier === "pro" && token) {
        const o = await fetch(`${API_URL}/odds/detailed/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (o.ok) {
          const oddsData = await o.json();
          setDetailedOdds((p) => ({ ...p, [matchId]: oddsData }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPredLoading((p) => ({ ...p, [matchId]: false }));
    }
  };

  if (loading) return (
    <div style={S.loadWrap}>
      <div style={S.loadDot}></div>
      <span style={S.loadText}>載入中...</span>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="wc-root">
        {/* NAV */}
        <nav className="wc-nav">
          <div className="wc-logo">
            <span className="wc-logo-dot"></span>
            WC26DATA
          </div>
          <div className="wc-nav-right">
            <span className={`wc-tier ${tier === "pro" ? "pro" : ""}`}>
              {tier === "pro" ? "⚡ PRO" : "FREE"}
            </span>
            <a href="/" className="wc-nav-home">首頁</a>
          </div>
        </nav>

        {/* HEADER */}
        <div className="wc-header">
          <div className="wc-header-tag">
            <span className="wc-live-dot"></span>
            FIFA WORLD CUP 2026
          </div>
          <h1 className="wc-title">賽事預測</h1>
          <p className="wc-sub">共 {matches.length} 場賽事 · Poisson 模型 · 真實 ELO</p>
        </div>

        {/* MATCHES */}
        <div className="wc-list">
          {matches.length === 0 && (
            <div className="wc-empty">目前沒有賽事資料</div>
          )}
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

        <div className="wc-footer">
          ⚠ 數據僅供分析參考，非投注建議
        </div>
      </div>
    </>
  );
}

function MatchCard({ match, tier, userEmail, isExpanded, isLoading, prediction, detailedOdds, onToggle }: {
  match: Match; tier: string; userEmail: string;
  isExpanded: boolean; isLoading: boolean;
  prediction: PredictionResponse | null; detailedOdds: DetailedOdds | null;
  onToggle: () => void;
}) {
  const kickoff = new Date(match.kickoff_utc);
  const timeStr = kickoff.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei", month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const isFinished = match.status === "finished";

  return (
    <div className={`wc-card ${isExpanded ? "expanded" : ""}`}>
      {/* 主列 */}
      <div className="wc-card-main" onClick={onToggle}>
        <div className="wc-card-left">
          <div className="wc-card-meta">
            <span className="wc-stage">{match.stage || "小組賽"}</span>
            <span className="wc-time">{timeStr} 台北</span>
          </div>
          <div className="wc-teams">
            <span className="wc-team">
              {getTeamZh(match.home_team)}
              <em>{match.home_team}</em>
            </span>
            <span className="wc-vs">VS</span>
            <span className="wc-team">
              {getTeamZh(match.away_team)}
              <em>{match.away_team}</em>
            </span>
          </div>
          {isFinished && match.home_score !== null && (
            <div className="wc-score">
              {match.home_score} – {match.away_score}
            </div>
          )}
        </div>
        <button className="wc-toggle-btn">
          {isLoading ? "..." : isExpanded ? "▲" : "查看預測"}
        </button>
      </div>

      {/* 展開區 */}
      {isExpanded && (
        <div className="wc-expand">
          {isLoading ? (
            <p className="wc-loading-text">載入預測中...</p>
          ) : !prediction ? (
            <p className="wc-loading-text">預測資料不可用</p>
          ) : (
            <>
              {prediction.prediction.model_warning && (
                <div className="wc-warn">⚠ {prediction.prediction.model_warning}</div>
              )}

              {/* ELO */}
              <div className="wc-elo-row">
                <span>ELO · {getTeamZh(match.home_team)}: <strong>{prediction.elo.home}</strong></span>
                <span>{getTeamZh(match.away_team)}: <strong>{prediction.elo.away}</strong></span>
              </div>

              {/* 1X2 */}
              <div className="wc-prob-section">
                <div className="wc-prob-label">勝平負（1X2）</div>
                <div className="wc-prob-row">
                  <ProbBox label="主勝" prob={prediction.prediction.home_prob} color="green" />
                  <ProbBox label="平局" prob={prediction.prediction.draw_prob} color="neutral" />
                  <ProbBox label="客勝" prob={prediction.prediction.away_prob} color="blue" />
                </div>
              </div>

              {/* 信心度 */}
              <div className="wc-conf">
                <span className="wc-conf-label">模型信心度</span>
                <div className="wc-conf-bg">
                  <div className="wc-conf-fill" style={{ width: `${Math.round(prediction.prediction.confidence * 100)}%` }}></div>
                </div>
                <span className="wc-conf-val">{Math.round(prediction.prediction.confidence * 100)}%</span>
              </div>

              {/* Pro 內容 */}
              {tier === "pro" ? (
                <>
                  <div className="wc-prob-section">
                    <div className="wc-prob-label">大小球（O/U 2.5）· 預期進球 {prediction.prediction.expected_goals}</div>
                    <div className="wc-prob-row">
                      <ProbBox label="大球 Over" prob={prediction.prediction.over_prob} color="green" />
                      <ProbBox label="小球 Under" prob={prediction.prediction.under_prob} color="blue" />
                    </div>
                  </div>
                  <div className="wc-prob-section">
                    <div className="wc-prob-label">雙隊得分（BTTS）</div>
                    <div className="wc-prob-row">
                      <ProbBox label="都進球" prob={prediction.prediction.btts_yes} color="green" />
                      <ProbBox label="有隊未進" prob={prediction.prediction.btts_no} color="blue" />
                    </div>
                  </div>
                  {detailedOdds && (
                    <div className="wc-detailed">
                      <div className="wc-detailed-title">⚡ 詳細賠率</div>
                      {detailedOdds.asian_handicap && <OddsRow label="讓球" data={detailedOdds.asian_handicap} />}
                      {detailedOdds.over_under && <OddsRow label="大小球" data={detailedOdds.over_under} />}
                      {detailedOdds.btts && <OddsRow label="雙隊得分" data={detailedOdds.btts} />}
                    </div>
                  )}
                </>
              ) : (
                <MemberGate userEmail={userEmail} label="大小球、BTTS、讓球詳細賠率" />
              )}

              <p className="wc-disclaimer">{prediction.disclaimer}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProbBox({ label, prob, color }: { label: string; prob?: number; color: "green" | "blue" | "neutral" }) {
  if (prob === undefined) return null;
  const pct = Math.round(prob * 100);
  return (
    <div className={`wc-prob-box ${color}`}>
      <div className="wc-prob-pct">{pct}%</div>
      <div className="wc-prob-lbl">{label}</div>
    </div>
  );
}

function OddsRow({ label, data }: { label: string; data: Record<string, number> }) {
  return (
    <div className="wc-odds-row">
      <span className="wc-odds-label">{label}</span>
      {Object.entries(data).map(([k, v]) => (
        <span key={k} className="wc-odds-item">
          <span className="wc-odds-key">{k}</span>
          <strong>{typeof v === "number" ? v.toFixed(2) : v}</strong>
        </span>
      ))}
    </div>
  );
}

const S = {
  loadWrap: { background: "#07090B", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  loadDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#00C27A" },
  loadText: { fontSize: "14px", color: "#607080", fontFamily: "Inter,sans-serif" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#07090B;--s1:#0C1014;--s2:#111820;--border:#1C2530;--border2:#243040;
  --green:#00C27A;--green2:rgba(0,194,122,.1);--blue:#3B9EFF;--blue2:rgba(59,158,255,.1);
  --text:#DDE4EC;--muted:#607080;--dim:#1A2430;--tag:#0F1820;
}

.wc-root{background:var(--bg);min-height:100vh;color:var(--text);font-family:'Inter','Noto Sans TC',sans-serif}

/* NAV */
.wc-nav{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;background:var(--s1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;backdrop-filter:blur(8px)}
.wc-logo{font-size:15px;font-weight:700;letter-spacing:.08em;color:var(--text);display:flex;align-items:center;gap:7px}
.wc-logo-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px rgba(0,194,122,.6)}
.wc-nav-right{display:flex;align-items:center;gap:12px}
.wc-tier{font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;background:var(--tag);color:var(--muted);border:1px solid var(--border);font-family:'IBM Plex Mono',monospace;letter-spacing:.04em}
.wc-tier.pro{background:rgba(0,194,122,.1);color:var(--green);border-color:rgba(0,194,122,.25)}
.wc-nav-home{font-size:13px;color:var(--muted);text-decoration:none;transition:.15s}
.wc-nav-home:hover{color:var(--text)}

/* HEADER */
.wc-header{padding:32px 20px 20px;background:radial-gradient(ellipse 70% 50% at 50% 0%,rgba(0,194,122,.05) 0%,transparent 70%);position:relative}
.wc-header::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,rgba(0,194,122,.3) 50%,transparent 95%)}
.wc-header-tag{font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.12em;color:var(--green);margin-bottom:10px;display:flex;align-items:center;gap:7px}
.wc-live-dot{width:6px;height:6px;border-radius:50%;background:#FF4444;animation:lp 1.4s ease-in-out infinite}
@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
.wc-title{font-size:26px;font-weight:700;letter-spacing:-.02em;color:var(--text);margin-bottom:4px}
.wc-sub{font-size:13px;color:var(--muted)}

/* LIST */
.wc-list{padding:16px 16px 0}
.wc-empty{text-align:center;padding:48px;color:var(--muted);font-size:14px}

/* CARD */
.wc-card{background:var(--s1);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;overflow:hidden;transition:border-color .15s}
.wc-card:hover{border-color:var(--border2)}
.wc-card.expanded{border-color:rgba(0,194,122,.25)}

.wc-card-main{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;gap:12px}
.wc-card-left{flex:1;min-width:0}

.wc-card-meta{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.wc-stage{font-size:10px;font-family:'IBM Plex Mono',monospace;letter-spacing:.06em;padding:2px 8px;border-radius:4px;background:var(--tag);border:1px solid var(--border);color:var(--muted)}
.wc-time{font-size:11px;color:var(--muted)}

/* TEAMS */
.wc-teams{display:flex;align-items:center;gap:12px}
.wc-team{font-size:15px;font-weight:600;color:var(--text);display:flex;align-items:baseline;gap:5px}
.wc-team em{font-style:normal;font-size:11px;font-weight:400;color:var(--muted)}
.wc-vs{font-size:11px;font-weight:600;font-family:'IBM Plex Mono',monospace;color:var(--dim);background:var(--tag);padding:3px 9px;border-radius:4px;border:1px solid var(--border);flex-shrink:0}
.wc-score{font-size:18px;font-weight:700;color:var(--green);margin-top:6px}

.wc-toggle-btn{font-size:12px;font-weight:500;padding:7px 14px;border-radius:7px;border:1px solid var(--border);color:var(--muted);background:transparent;cursor:pointer;transition:.15s;white-space:nowrap;flex-shrink:0}
.wc-toggle-btn:hover{border-color:var(--green);color:var(--green)}

/* EXPAND */
.wc-expand{padding:16px;border-top:1px solid var(--border);background:var(--bg)}
.wc-loading-text{font-size:13px;color:var(--muted);text-align:center;padding:16px}
.wc-warn{font-size:12px;color:#E8A230;background:rgba(232,162,48,.08);border:1px solid rgba(232,162,48,.2);border-radius:6px;padding:8px 12px;margin-bottom:12px}

.wc-elo-row{display:flex;gap:16px;font-size:12px;color:var(--muted);margin-bottom:14px}
.wc-elo-row strong{color:var(--text)}

/* PROBS */
.wc-prob-section{margin-bottom:14px}
.wc-prob-label{font-size:11px;color:var(--muted);margin-bottom:8px;font-weight:500}
.wc-prob-row{display:flex;gap:8px}
.wc-prob-box{flex:1;text-align:center;padding:12px 8px;border-radius:8px;border:1px solid var(--border)}
.wc-prob-box.green{background:var(--green2);border-color:rgba(0,194,122,.2)}
.wc-prob-box.blue{background:var(--blue2);border-color:rgba(59,158,255,.2)}
.wc-prob-box.neutral{background:var(--s2)}
.wc-prob-pct{font-size:18px;font-weight:700;color:var(--text);line-height:1;margin-bottom:3px}
.wc-prob-box.green .wc-prob-pct{color:var(--green)}
.wc-prob-box.blue .wc-prob-pct{color:var(--blue)}
.wc-prob-lbl{font-size:11px;color:var(--muted)}

/* CONFIDENCE */
.wc-conf{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.wc-conf-label{font-size:11px;color:var(--muted);white-space:nowrap}
.wc-conf-bg{flex:1;height:4px;background:var(--dim);border-radius:2px;overflow:hidden}
.wc-conf-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--green),var(--blue));transition:width .6s ease}
.wc-conf-val{font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--muted);min-width:30px;text-align:right}

/* DETAILED ODDS */
.wc-detailed{background:var(--s2);border:1px solid rgba(0,194,122,.15);border-radius:8px;padding:14px;margin-top:12px;margin-bottom:12px}
.wc-detailed-title{font-size:12px;font-weight:600;color:var(--green);margin-bottom:10px}
.wc-odds-row{display:flex;align-items:center;gap:12px;font-size:13px;margin-bottom:8px;flex-wrap:wrap}
.wc-odds-row:last-child{margin-bottom:0}
.wc-odds-label{font-size:11px;color:var(--muted);width:60px;flex-shrink:0}
.wc-odds-item{display:flex;gap:4px;align-items:center}
.wc-odds-key{font-size:11px;color:var(--muted)}
.wc-odds-item strong{color:var(--text)}

.wc-disclaimer{font-size:11px;color:var(--muted);margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}

/* FOOTER */
.wc-footer{text-align:center;padding:24px;font-size:11px;color:var(--muted);border-top:1px solid var(--border);margin-top:8px}

@media(max-width:600px){
  .wc-teams{flex-direction:column;align-items:flex-start;gap:6px}
  .wc-card-main{flex-direction:column;align-items:flex-start}
  .wc-toggle-btn{align-self:flex-end}
  .wc-prob-row{gap:6px}
  .wc-prob-pct{font-size:16px}
}
`;
