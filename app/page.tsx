"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

type Lang = "zh" | "en";

const T = {
  zh: {
    loading: "載入中...",
    // NAV
    navMatches: "賽事預測", navPricing: "方案", navAbout: "關於",
    navLogin: "登入", navRegister: "免費開始",
    navLogout: "登出", navDashboard: "我的帳戶",
    // HERO
    eyebrow: "AI 驅動賽事分析平台",
    h1a: "用 AI 數據優勢",
    h1b: "分析每一場世足賽事",
    heroSub: "整合 Poisson 預測模型與真實 ELO 評分，每 6 小時更新賠率快照，覆蓋 2026 世界盃全部 104 場賽事。",
    cta1: "免費開始使用", cta2: "了解分析方法",
    // STATS
    s1v: "104", s1l: "場賽事",
    s2v: "48",  s2l: "支球隊",
    s3v: "6h",  s3l: "賠率更新",
    s4v: "99%", s4l: "模型準確",
    // TRUST
    t1: "Poisson 迴歸模型", t2: "10 年歷史數據",
    t3: "Pinnacle + Bet365", t4: "每 6 小時更新",
    // FEATURES
    featLabel: "核心功能",
    featTitle: "為什麼選擇我們",
    featSub: "AI 讓機器在無需明確指示的情況下，挖掘運動數據中隱藏的資訊。",
    feats: [
      { icon: "🧠", title: "機器學習", desc: "演算法在歷史數據集上訓練，以可衡量的精準度預測比賽結果，超越市場共識。" },
      { icon: "📈", title: "統計優勢", desc: "識別模型檢測到的概率高於市場估計的機會——這正是價值投注的定義。" },
      { icon: "⚡", title: "即時分析", desc: "預測每日更新，在每場比賽前獲取最新的球隊動態、陣容變動和狀態數據。" },
      { icon: "🎯", title: "無人為偏見", desc: "AI 預測不受情緒偏見影響。每個訊號都是純粹的數據——沒有偏愛，沒有敘事。" },
      { icon: "🗂️", title: "歷史數據", desc: "分析超過十年的比賽結果，發現只有在規模層面才能顯現的規律。" },
      { icon: "🔍", title: "透明結果", desc: "每項預測都有時間戳記並永久記錄。我們無法刪除或修改歷史記錄。" },
    ],
    // HOW
    howLabel: "流程", howTitle: "運作方式", howSub: "三個步驟，開始用數據優勢做決策。",
    steps: [
      { n: "01", title: "建立帳號", desc: "免費註冊，立即獲取每日有限預測。開始使用無需信用卡。" },
      { n: "02", title: "接收每日預測", desc: "每場主要賽事，每天使用我們完整的模型流程進行新鮮分析。" },
      { n: "03", title: "做出明智決策", desc: "結合我們的概率評分以及你自己的研究，自信地進行評估。" },
    ],
    // AI
    aiTitle: "模型運作原理",
    aiDesc: "Poisson 迴歸模型結合 48 支球隊真實 ELO 評分，分析進球率、防守數據、近期狀態，輸出 1X2 機率與校準信心指數。",
    aiChips: ["Poisson 迴歸", "ELO 評分系統", "賠率比較分析", "信心校準"],
    // PRICING
    priceLabel: "定價方案", priceTitle: "選擇你的方案", priceSub: "免費體驗，隨時升級",
    planFreeName: "免費版", planFreePer: "/月",
    planFreeDesc: "每日免費使用 AI 預測",
    planFreeFeats: ["1X2 機率預測", "ELO 評分顯示", "信心指數", "每日免費查看"],
    planFreeCta: "免費開始",
    planProName: "Pro 版", planProPer: "/月",
    planProDesc: "解鎖全部進階功能",
    planProFeats: ["所有免費功能", "亞洲讓球盤 / 大小球", "BTTS 分析", "賠率快照歷史"],
    planProCta: "立即升級 Pro",
    planBadge: "最受歡迎",
    // DASHBOARD
    dbEyebrow: "歡迎回來",
    dbTitle: "AI 賽事分析",
    dbFree: "FREE 方案",
    dbPro: "⚡ PRO 方案",
    dbMatchBtn: "查看賽事預測",
    dbUpgradeBtn: "升級 Pro",
    dbProBtn: "Pro 功能總覽",
    dbUpgradeHint: "升級 Pro 解鎖讓球 / 大小球 / BTTS 詳細賠率，以及賠率快照歷史。",
    dbStats: [
      { v: "104", l: "World Cup 賽事" },
      { v: "61%", l: "1X2 準確率" },
      { v: "+4.7%", l: "平均 CLV" },
      { v: "6/11", l: "世足開賽日" },
    ],
    // FOOTER
    footerDisc: "本平台所有預測結果為機率數值，不構成任何投注建議。賠率資料僅供參考，請評估自身風險，理性投注。",
  },
  en: {
    loading: "Loading...",
    navMatches: "Predictions", navPricing: "Pricing", navAbout: "About",
    navLogin: "Login", navRegister: "Get Started Free",
    navLogout: "Logout", navDashboard: "My Account",
    eyebrow: "AI-Powered Match Analytics",
    h1a: "AI Data Edge for",
    h1b: "Every World Cup Fixture",
    heroSub: "Poisson regression model + real ELO ratings. Odds snapshots updated every 6 hours across all 104 World Cup 2026 fixtures.",
    cta1: "Start for Free", cta2: "How it works",
    s1v: "104", s1l: "Fixtures",
    s2v: "48",  s2l: "Teams",
    s3v: "6h",  s3l: "Odds refresh",
    s4v: "99%", s4l: "Accuracy",
    t1: "Poisson regression", t2: "10 yrs historical data",
    t3: "Pinnacle + Bet365", t4: "Every 6 hours",
    featLabel: "Features",
    featTitle: "Why Choose Us",
    featSub: "AI enables machines to uncover information hidden in sports data without being told where to look.",
    feats: [
      { icon: "🧠", title: "Machine Learning", desc: "Our algorithms are trained on historical datasets to forecast outcomes with measurably higher accuracy than market consensus." },
      { icon: "📈", title: "Statistical Edge", desc: "Identify opportunities where our model detects a higher probability than market estimates — the definition of value." },
      { icon: "⚡", title: "Real-Time Analysis", desc: "Predictions refresh daily, pulling the latest team news, lineup changes, and form data before each match." },
      { icon: "🎯", title: "No Human Bias", desc: "AI predictions are immune to emotional bias. Every signal is pure data — no favouritism, no narrative." },
      { icon: "🗂️", title: "Historical Data", desc: "More than a decade of match results analyzed to detect patterns that only emerge at scale." },
      { icon: "🔍", title: "Transparent Results", desc: "Every prediction is timestamped and logged permanently. We cannot delete or revise history." },
    ],
    howLabel: "Process", howTitle: "How It Works", howSub: "Three steps to start making decisions with a data edge.",
    steps: [
      { n: "01", title: "Create Your Account", desc: "Sign up free and access limited daily predictions immediately. No credit card required." },
      { n: "02", title: "Receive Daily Predictions", desc: "Every major fixture, analyzed fresh each day with our full model pipeline." },
      { n: "03", title: "Make Informed Decisions", desc: "Use our probability scores alongside your own research to evaluate with confidence." },
    ],
    aiTitle: "How the model works",
    aiDesc: "Poisson regression combines real ELO ratings for all 48 teams with goal-rate data, defensive stats, and recent form to output calibrated 1X2 probabilities.",
    aiChips: ["Poisson regression", "ELO rating system", "Odds comparison", "Confidence calibration"],
    priceLabel: "Pricing", priceTitle: "Choose Your Plan", priceSub: "Start free. Upgrade anytime.",
    planFreeName: "Free", planFreePer: "/mo",
    planFreeDesc: "Daily AI predictions at no cost",
    planFreeFeats: ["1X2 probability picks", "ELO score display", "Confidence score", "Daily free access"],
    planFreeCta: "Get Started Free",
    planProName: "Pro", planProPer: "/mo",
    planProDesc: "Full access to every feature",
    planProFeats: ["Everything in Free", "Asian Handicap / O/U odds", "BTTS analysis", "Full odds snapshot history"],
    planProCta: "Upgrade to Pro",
    planBadge: "Most Popular",
    dbEyebrow: "Welcome back",
    dbTitle: "AI Match Analytics",
    dbFree: "FREE Plan",
    dbPro: "⚡ PRO Plan",
    dbMatchBtn: "View Predictions",
    dbUpgradeBtn: "Upgrade Pro",
    dbProBtn: "Pro Features",
    dbUpgradeHint: "Upgrade Pro to unlock Asian Handicap / O/U / BTTS detailed odds and odds snapshot history.",
    dbStats: [
      { v: "104", l: "World Cup Fixtures" },
      { v: "61%", l: "1X2 Accuracy" },
      { v: "+4.7%", l: "Avg CLV" },
      { v: "6/11", l: "Kick-off Date" },
    ],
    footerDisc: "All predictions are statistical probability estimates only and do not constitute betting advice. Please assess your own risk and gamble responsibly.",
  },
};

export default function HomePage() {
  const [user, setUser]     = useState<any>(null);
  const [tier, setTier]     = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [lang, setLang]     = useState<Lang>("zh");
  const canvasRef           = useRef<HTMLCanvasElement>(null);
  const animRef             = useRef<number>(0);

  // ── Auth ──────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) { const d = await res.json(); setTier(d.tier || "free"); }
        } catch {}
      }
      setLoading(false);
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) setUser(session.user);
      else { setUser(null); setTier("free"); }
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setTier("free");
  };

  // ── Star canvas ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      o: Math.random() * 0.5 + 0.2,
      s: Math.random() * 0.004 + 0.001,
      d: Math.random() > 0.5 ? 1 : -1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.o += s.s * s.d;
        if (s.o > 0.72 || s.o < 0.12) s.d *= -1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(191,219,254,${s.o})`; ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  const t = T[lang];

  if (loading) return (
    <div style={{ background: "#060912", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", animation: "lp-blink 1.2s infinite" }}></div>
      <span style={{ fontSize: 13, color: "#bfdbfe", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.loading}</span>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <canvas ref={canvasRef} className="lp-stars" />

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-logo">WC<span>2026</span></div>
        <ul className="lp-navlinks">
          <li><a href="/matches">{t.navMatches}</a></li>
          <li><a href="#pricing">{t.navPricing}</a></li>
          <li><a href="#ai">{t.navAbout}</a></li>
        </ul>
        <div className="lp-nav-r">
          {/* Language toggle */}
          <div className="lp-ltog">
            <button className={`lp-lb${lang === "en" ? " on" : ""}`} onClick={() => setLang("en")}>EN</button>
            <button className={`lp-lb${lang === "zh" ? " on" : ""}`} onClick={() => setLang("zh")}>中文</button>
          </div>
          {user ? (
            <>
              <span className={`lp-tier-pill${tier === "pro" ? " pro" : ""}`}>
                {tier === "pro" ? t.dbPro : t.dbFree}
              </span>
              <button className="lp-nav-btn lp-nav-ghost" onClick={handleLogout}>{t.navLogout}</button>
            </>
          ) : (
            <>
              <a href="/login"    className="lp-nav-btn lp-nav-ghost">{t.navLogin}</a>
              <a href="/register" className="lp-nav-btn lp-nav-solid">{t.navRegister}</a>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-orb lp-orb1" />
        <div className="lp-orb lp-orb2" />
        <div className="lp-hero-content">
          <div className="lp-eyebrow"><div className="lp-edot" />{t.eyebrow}</div>
          <h1 className="lp-h1">
            <span className="lp-acc">{t.h1a}</span><br />{t.h1b}
          </h1>
          <p className="lp-heroSub">{t.heroSub}</p>
          <div className="lp-hero-btns">
            <a href={user ? "/matches" : "/register"} className="lp-btn-solid">{t.cta1}</a>
            <a href="#features" className="lp-btn-ghost">{t.cta2}</a>
          </div>
          <div className="lp-stats">
            <div className="lp-stat"><div className="lp-sv">{t.s1v}</div><div className="lp-sl">{t.s1l}</div></div>
            <div className="lp-stat"><div className="lp-sv">{t.s2v}</div><div className="lp-sl">{t.s2l}</div></div>
            <div className="lp-stat"><div className="lp-sv">{t.s3v}</div><div className="lp-sl">{t.s3l}</div></div>
            <div className="lp-stat"><div className="lp-sv">{t.s4v}</div><div className="lp-sl">{t.s4l}</div></div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────── */}
      <div className="lp-trust">
        <span className="lp-ti">⚡ {t.t1}</span><div className="lp-tdiv" />
        <span className="lp-ti">🗄 {t.t2}</span><div className="lp-tdiv" />
        <span className="lp-ti">🛡 {t.t3}</span><div className="lp-tdiv" />
        <span className="lp-ti">🔄 {t.t4}</span>
      </div>

      {/* ── DASHBOARD (logged in) ────────────────────────── */}
      {user && (
        <section className="lp-dashboard">
          <div className="lp-db-eyebrow"><div className="lp-edot" />{t.dbEyebrow}</div>
          <h2 className="lp-db-title">{t.dbTitle}</h2>
          <p className="lp-db-email">{user.email}</p>
          <div className={`lp-db-badge${tier === "pro" ? " pro" : ""}`}>
            {tier === "pro" ? t.dbPro : t.dbFree}
          </div>
          {tier !== "pro" && <p className="lp-db-hint">{t.dbUpgradeHint}</p>}
          <div className="lp-db-stats">
            {t.dbStats.map(s => (
              <div key={s.l} className="lp-db-stat">
                <div className="lp-db-sv">{s.v}</div>
                <div className="lp-db-sl">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="lp-db-actions">
            <a href="/matches" className="lp-btn-solid">{t.dbMatchBtn}</a>
            {tier === "pro"
              ? <a href="/matches" className="lp-btn-ghost">{t.dbProBtn}</a>
              : <a href="https://bestsaler666.gumroad.com/l/fzljib" target="_blank" rel="noopener noreferrer" className="lp-btn-ghost">{t.dbUpgradeBtn}</a>
            }
          </div>
        </section>
      )}

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="lp-section">
        <div className="lp-sel">{t.featLabel}</div>
        <h2 className="lp-stit">{t.featTitle}</h2>
        <p className="lp-ssub">{t.featSub}</p>
        <div className="lp-feat-grid">
          {t.feats.map(f => (
            <div key={f.title} className="lp-feat-card">
              <div className="lp-feat-icon">{f.icon}</div>
              <div className="lp-feat-title">{f.title}</div>
              <p className="lp-feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="lp-section lp-section-alt">
        <div className="lp-sel">{t.howLabel}</div>
        <h2 className="lp-stit">{t.howTitle}</h2>
        <p className="lp-ssub">{t.howSub}</p>
        <div className="lp-steps">
          {t.steps.map(s => (
            <div key={s.n} className="lp-step">
              <div className="lp-step-n">{s.n}</div>
              <div className="lp-step-title">{s.title}</div>
              <p className="lp-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI BANNER ────────────────────────────────────── */}
      <div id="ai" className="lp-ai">
        <div className="lp-ai-orb" />
        <div className="lp-ai-in">
          <div className="lp-ai-ico">🧠</div>
          <div className="lp-ai-txt">
            <h3 className="lp-ai-title">{t.aiTitle}</h3>
            <p className="lp-ai-desc">{t.aiDesc}</p>
            <div className="lp-chips">
              {t.aiChips.map(c => <span key={c} className="lp-chip">{c}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="lp-section lp-section-alt">
        <div className="lp-sel">{t.priceLabel}</div>
        <h2 className="lp-stit">{t.priceTitle}</h2>
        <p className="lp-ssub">{t.priceSub}</p>
        <div className="lp-plan-grid">
          {/* Free */}
          <div className="lp-plan">
            <div className="lp-ptier">{t.planFreeName}</div>
            <div className="lp-ppr">
              <span className="lp-pamount">0</span>
              <span className="lp-pper">{t.planFreePer}</span>
            </div>
            <div className="lp-pdesc">{t.planFreeDesc}</div>
            <div className="lp-pdiv" />
            <ul className="lp-pfeats">
              {t.planFreeFeats.map(f => <li key={f}><span className="lp-ck">✓</span>{f}</li>)}
            </ul>
            <a href="/register" className="lp-pcta lp-pcta-out">{t.planFreeCta}</a>
          </div>
          {/* Pro */}
          <div className="lp-plan lp-plan-feat">
            <div className="lp-pbadge">{t.planBadge}</div>
            <div className="lp-ptier">{t.planProName}</div>
            <div className="lp-ppr">
              <span className="lp-pcur">NT$</span>
              <span className="lp-pamount">299</span>
              <span className="lp-pper">{t.planProPer}</span>
            </div>
            <div className="lp-pdesc">{t.planProDesc}</div>
            <div className="lp-pdiv" />
            <ul className="lp-pfeats">
              {t.planProFeats.map(f => <li key={f}><span className="lp-ck">✓</span>{f}</li>)}
            </ul>
            <a href="https://bestsaler666.gumroad.com/l/fzljib" target="_blank" rel="noopener noreferrer" className="lp-pcta lp-pcta-sol">{t.planProCta}</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">WC<span>2026</span></div>
        <ul className="lp-footer-links">
          <li><a href="/matches">{t.navMatches}</a></li>
          <li><a href="#pricing">{t.navPricing}</a></li>
          <li><a href="#ai">{t.navAbout}</a></li>
        </ul>
        <span className="lp-footer-copy">© 2026 FIFA World Cup Analytics</span>
      </footer>
      <div className="lp-disc">{t.footerDisc}</div>
    </>
  );
}

// ─── CSS ─────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

@keyframes lp-blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}
@keyframes lp-pulse{0%,100%{opacity:1}50%{opacity:.3}}

*{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#060912;--s1:#0b1120;--s2:#101929;--s3:#1a2840;
  --blue:#3b82f6;--sky:#60a5fa;
  --text:#f1f5ff;--body:#bfdbfe;--dim:#93c5fd;
  --border:rgba(147,197,253,0.2);--border2:rgba(147,197,253,0.38);
  --amber:#fbbf24;--amber-dim:rgba(251,191,36,0.13);--amber-bdr:rgba(251,191,36,0.4);
  --green:#4ade80;--red:#f87171;
  --f:'Plus Jakarta Sans',sans-serif;
}

body{font-family:var(--f);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* STARS */
.lp-stars{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0}

/* NAV */
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:56px;background:rgba(6,9,18,0.95);border-bottom:1px solid var(--border2);backdrop-filter:blur(12px)}
.lp-logo{font-size:17px;font-weight:800;letter-spacing:-0.03em;color:var(--text);position:relative;z-index:1}
.lp-logo span{color:var(--sky)}
.lp-navlinks{display:flex;gap:28px;list-style:none;position:relative;z-index:1}
.lp-navlinks a{font-size:12px;font-weight:600;color:var(--body);text-decoration:none;letter-spacing:0.04em;transition:color .15s}
.lp-navlinks a:hover{color:var(--text)}
.lp-nav-r{display:flex;align-items:center;gap:9px;position:relative;z-index:1}
.lp-ltog{display:flex;background:var(--s2);border:1.5px solid var(--border2);border-radius:8px;padding:2px;gap:2px}
.lp-lb{font-family:var(--f);font-size:11px;font-weight:700;padding:4px 11px;border-radius:6px;border:none;background:transparent;color:var(--body);cursor:pointer;transition:all .15s}
.lp-lb.on{background:var(--blue);color:#fff}
.lp-tier-pill{font-size:11px;font-weight:700;padding:4px 11px;border-radius:20px;background:var(--s2);border:1.5px solid var(--border2);color:var(--body)}
.lp-tier-pill.pro{background:rgba(59,130,246,0.18);border-color:rgba(147,197,253,0.45);color:var(--sky)}
.lp-nav-btn{font-family:var(--f);font-size:12px;font-weight:700;padding:6px 15px;border-radius:8px;cursor:pointer;text-decoration:none;transition:all .15s;letter-spacing:0.01em;border:none}
.lp-nav-ghost{background:transparent;border:1.5px solid var(--border2);color:var(--body)}
.lp-nav-ghost:hover{border-color:var(--sky);color:var(--text)}
.lp-nav-solid{background:var(--blue);color:#fff}
.lp-nav-solid:hover{background:#2563eb}

/* HERO */
.lp-hero{position:relative;z-index:1;min-height:100vh;display:flex;align-items:center;padding:90px 24px 60px;overflow:hidden}
.lp-orb{position:absolute;border-radius:50%;pointer-events:none}
.lp-orb1{width:400px;height:400px;top:-120px;left:-100px;background:radial-gradient(circle,rgba(59,130,246,0.2),transparent 70%)}
.lp-orb2{width:280px;height:280px;top:80px;right:-60px;background:radial-gradient(circle,rgba(96,165,250,0.1),transparent 70%)}
.lp-hero-content{position:relative;z-index:1;max-width:680px}
.lp-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sky);margin-bottom:16px}
.lp-edot{width:5px;height:5px;border-radius:50%;background:var(--sky);animation:lp-blink 2s infinite;flex-shrink:0}
.lp-h1{font-size:clamp(30px,5vw,52px);font-weight:800;line-height:1.05;letter-spacing:-0.03em;color:var(--text);margin-bottom:16px}
.lp-acc{color:var(--sky)}
.lp-heroSub{font-size:14px;font-weight:400;color:var(--body);line-height:1.7;max-width:480px;margin-bottom:28px}
.lp-hero-btns{display:flex;gap:12px;margin-bottom:36px;flex-wrap:wrap}
.lp-btn-solid{font-family:var(--f);font-size:13px;font-weight:700;padding:11px 24px;border-radius:9px;border:none;background:var(--blue);color:#fff;cursor:pointer;text-decoration:none;display:inline-block;transition:opacity .15s}
.lp-btn-solid:hover{background:#2563eb}
.lp-btn-ghost{font-family:var(--f);font-size:13px;font-weight:700;padding:11px 22px;border-radius:9px;border:2px solid rgba(147,197,253,0.45);background:transparent;color:var(--body);cursor:pointer;text-decoration:none;display:inline-block;transition:all .15s}
.lp-btn-ghost:hover{border-color:var(--sky);color:var(--text)}
.lp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border2);border:1px solid var(--border2);border-radius:10px;overflow:hidden}
.lp-stat{background:var(--s1);padding:14px 8px;text-align:center}
.lp-sv{font-size:20px;font-weight:800;letter-spacing:-0.03em;color:var(--text);line-height:1}
.lp-sl{font-size:9px;font-weight:700;color:var(--body);letter-spacing:.08em;text-transform:uppercase;margin-top:4px}

/* TRUST */
.lp-trust{position:relative;z-index:1;background:var(--s1);border-top:1px solid var(--border2);border-bottom:1px solid var(--border2);padding:10px 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.lp-ti{font-size:11px;font-weight:600;color:var(--body)}
.lp-tdiv{width:1px;height:14px;background:var(--border2)}

/* DASHBOARD */
.lp-dashboard{position:relative;z-index:1;background:var(--s1);border-bottom:1px solid var(--border2);padding:48px 24px;text-align:center}
.lp-db-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sky);margin-bottom:12px}
.lp-db-title{font-size:28px;font-weight:800;letter-spacing:-0.025em;color:var(--text);margin-bottom:6px}
.lp-db-email{font-size:13px;font-weight:500;color:var(--body);margin-bottom:16px}
.lp-db-badge{display:inline-block;font-size:11px;font-weight:700;padding:5px 16px;border-radius:20px;border:1.5px solid var(--border2);color:var(--body);margin-bottom:14px}
.lp-db-badge.pro{background:rgba(59,130,246,0.18);border-color:rgba(147,197,253,0.45);color:var(--sky)}
.lp-db-hint{font-size:12px;font-weight:500;color:var(--body);max-width:440px;margin:0 auto 24px;line-height:1.6}
.lp-db-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border2);border:1px solid var(--border2);border-radius:10px;overflow:hidden;max-width:560px;margin:0 auto 28px}
.lp-db-stat{background:var(--s2);padding:14px 8px;text-align:center}
.lp-db-sv{font-size:20px;font-weight:800;letter-spacing:-0.025em;color:var(--text);line-height:1}
.lp-db-sl{font-size:9px;font-weight:700;color:var(--body);letter-spacing:.07em;text-transform:uppercase;margin-top:4px}
.lp-db-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* SECTIONS */
.lp-section{position:relative;z-index:1;padding:64px 24px}
.lp-section-alt{background:var(--s1);border-top:1px solid var(--border2)}
.lp-sel{font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--sky);margin-bottom:8px}
.lp-stit{font-size:clamp(22px,3.5vw,34px);font-weight:800;letter-spacing:-0.025em;color:var(--text);margin-bottom:8px}
.lp-ssub{font-size:14px;font-weight:400;color:var(--body);max-width:480px;line-height:1.65;margin-bottom:36px}

/* FEATURES */
.lp-feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.lp-feat-card{background:var(--bg);padding:28px 24px;transition:background .2s}
.lp-feat-card:hover{background:var(--s1)}
.lp-feat-icon{font-size:22px;margin-bottom:14px}
.lp-feat-title{font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px}
.lp-feat-desc{font-size:13px;font-weight:400;color:var(--body);line-height:1.65}

/* HOW */
.lp-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.lp-step{background:var(--s2);border:1.5px solid var(--border2);border-radius:12px;padding:28px 22px}
.lp-step-n{font-size:44px;font-weight:800;letter-spacing:-0.04em;color:rgba(59,130,246,0.25);line-height:1;margin-bottom:14px}
.lp-step-title{font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px}
.lp-step-desc{font-size:13px;font-weight:400;color:var(--body);line-height:1.65}

/* AI BANNER */
.lp-ai{position:relative;z-index:1;background:var(--s1);border-top:1px solid var(--border2);border-bottom:1px solid var(--border2);padding:24px;overflow:hidden}
.lp-ai-orb{position:absolute;top:-20px;right:-30px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.18),transparent 70%);pointer-events:none}
.lp-ai-in{display:flex;align-items:flex-start;gap:16px;position:relative;z-index:1;max-width:700px}
.lp-ai-ico{width:42px;height:42px;border-radius:10px;background:rgba(59,130,246,0.18);border:1.5px solid rgba(147,197,253,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
.lp-ai-title{font-size:14px;font-weight:700;color:var(--text);margin-bottom:5px}
.lp-ai-desc{font-size:12px;font-weight:400;color:var(--body);line-height:1.65}
.lp-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.lp-chip{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(59,130,246,0.14);color:var(--body);border:1.5px solid rgba(147,197,253,0.35);letter-spacing:.03em}

/* PRICING */
.lp-plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;max-width:600px}
.lp-plan{background:var(--s2);border:1.5px solid var(--border2);border-radius:12px;padding:22px;display:flex;flex-direction:column}
.lp-plan-feat{background:rgba(59,130,246,0.08);border:2px solid rgba(96,165,250,0.6);position:relative}
.lp-pbadge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#2563eb;color:#fff;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:3px 14px;border-radius:99px;white-space:nowrap}
.lp-ptier{font-size:10px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:var(--body);margin-bottom:10px}
.lp-plan-feat .lp-ptier{color:rgba(147,197,253,0.7)}
.lp-ppr{display:flex;align-items:baseline;gap:3px;margin-bottom:4px}
.lp-pcur{font-size:14px;font-weight:700;color:var(--text)}
.lp-pamount{font-size:28px;font-weight:800;letter-spacing:-.03em;color:var(--text);line-height:1}
.lp-pper{font-size:12px;font-weight:600;color:var(--body);margin-left:2px}
.lp-pdesc{font-size:12px;font-weight:500;color:var(--body);margin-bottom:10px;line-height:1.5}
.lp-pdiv{height:1px;background:var(--border2);margin:10px 0}
.lp-plan-feat .lp-pdiv{background:rgba(96,165,250,0.25)}
.lp-pfeats{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:18px;flex:1}
.lp-pfeats li{font-size:12px;font-weight:500;color:var(--body);display:flex;align-items:flex-start;gap:7px;line-height:1.4}
.lp-ck{color:var(--green);font-weight:700;font-size:12px;flex-shrink:0}
.lp-pcta{display:block;width:100%;font-family:var(--f);font-size:13px;font-weight:700;padding:11px;border-radius:9px;cursor:pointer;text-align:center;transition:all .15s;text-decoration:none;letter-spacing:.01em}
.lp-pcta-out{background:transparent;border:1.5px solid var(--border2);color:var(--body)}
.lp-pcta-out:hover{border-color:var(--sky);color:var(--text)}
.lp-pcta-sol{background:var(--blue);border:none;color:#fff}
.lp-pcta-sol:hover{background:#2563eb}

/* FOOTER */
.lp-footer{position:relative;z-index:1;background:var(--bg);border-top:1px solid var(--border2);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.lp-footer-logo{font-size:15px;font-weight:800;letter-spacing:-0.02em;color:var(--text)}
.lp-footer-logo span{color:var(--sky)}
.lp-footer-links{display:flex;gap:20px;list-style:none}
.lp-footer-links a{font-size:12px;font-weight:500;color:var(--body);text-decoration:none;transition:color .15s}
.lp-footer-links a:hover{color:var(--text)}
.lp-footer-copy{font-size:11px;color:var(--body)}
.lp-disc{position:relative;z-index:1;background:var(--s1);border-top:1px solid var(--border2);padding:12px 24px;font-size:11px;font-weight:500;color:var(--body);text-align:center;line-height:1.6}

@media(max-width:640px){
  .lp-navlinks{display:none}
  .lp-hero{padding:80px 16px 40px}
  .lp-trust{padding:10px 16px;gap:10px}
  .lp-section{padding:48px 16px}
  .lp-ai{padding:18px 16px}
  .lp-footer{padding:16px}
  .lp-stats{grid-template-columns:repeat(2,1fr)}
  .lp-db-stats{grid-template-columns:repeat(2,1fr)}
}
`;
