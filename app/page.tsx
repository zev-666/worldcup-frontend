"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [ctaVisible, setCtaVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  /* ── Auth ── */
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
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
      if (session?.user) { setUser(session.user); }
      else { setUser(null); setTier(""); }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTier("");
  };

  /* ── Particle canvas (Landing only) ── */
  useEffect(() => {
    if (user || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let particles: any[] = [];
    const mouse = { x: -999, y: -999 };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 7000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 1.4 + 0.8,
          hue: Math.random() < 0.5 ? 270 : 190,
          alpha: Math.random() * 0.5 + 0.2,
          life: Math.random(),
          speed: Math.random() * 0.003 + 0.002,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.life += p.speed;
        const pulse = 0.5 + 0.5 * Math.sin(p.life * Math.PI * 2);
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { p.vx += (dx / dist) * 0.03; p.vy += (dy / dist) * 0.03; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.alpha * pulse})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2},70%,65%,${(1 - d / 80) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [user]);

  /* ── Sticky CTA on scroll ── */
  useEffect(() => {
    if (user) return;
    const handler = () => { if (window.scrollY > 500) setCtaVisible(true); };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [user]);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ background: "#09090B", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#4A4960", letterSpacing: "0.12em" }}>
        LOADING...
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     已登入：會員儀表板
  ════════════════════════════════════════ */
  if (user) return (
    <>
      <style>{DASHBOARD_CSS}</style>
      <div className="db-root">
        {/* Nav */}
        <nav className="db-nav">
          <span className="db-logo">WC26<span>DATA</span></span>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="/matches" className="db-navlink">比賽列表</a>
            <button onClick={handleLogout} className="db-logout">登出</button>
          </div>
        </nav>

        {/* Hero welcome */}
        <div className="db-hero">
          <div className="db-eyebrow">
            <span className="db-dot"></span>
            {tier === "pro" ? "PRO MEMBER" : "FREE MEMBER"}
          </div>
          <h1 className="db-welcome">歡迎回來</h1>
          <p className="db-email">{user.email}</p>

          <div className="db-tier-badge" data-tier={tier}>
            {tier === "pro" ? "⚡ Pro 方案" : "Free 方案"}
          </div>

          {tier !== "pro" && (
            <p className="db-upgrade-hint">
              升級 Pro 解鎖亞洲讓球、BTTS、即時賠率快照與盤口警示
              <a href="#pricing" className="db-upgrade-link">查看方案 →</a>
            </p>
          )}
        </div>

        {/* Quick stats */}
        <div className="db-grid">
          <div className="db-card">
            <div className="db-card-num violet">104</div>
            <div className="db-card-label">World Cup 總賽事</div>
          </div>
          <div className="db-card">
            <div className="db-card-num cyan">61.2<small>%</small></div>
            <div className="db-card-label">1X2 命中率</div>
          </div>
          <div className="db-card">
            <div className="db-card-num white">+4.7<small>%</small></div>
            <div className="db-card-label">平均 CLV</div>
          </div>
          <div className="db-card">
            <div className="db-card-num violet">6/11</div>
            <div className="db-card-label">開賽日期</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="db-actions">
          <a href="/matches" className="db-btn-primary">查看今日賽事</a>
          {tier === "pro"
            ? <a href="/matches" className="db-btn-ghost">賠率監控 ⚡</a>
            : <a href="#pricing" className="db-btn-ghost">升級 Pro</a>
          }
        </div>

        {/* Disclaimer */}
        <div className="db-disclaimer">
          ⚠ 所有預測結果為機率數值，不構成投注建議。請理性評估風險。
        </div>
      </div>
    </>
  );

  /* ════════════════════════════════════════
     未登入：Landing Page
  ════════════════════════════════════════ */
  return (
    <>
      <style>{LANDING_CSS}</style>

      {/* Nav */}
      <nav className="lp-nav">
        <span className="lp-logo">WC26<span>DATA</span></span>
        <ul className="lp-navlinks">
          <li><a href="#features">功能</a></li>
          <li><a href="#markets">賠率市場</a></li>
          <li><a href="#pricing">方案</a></li>
        </ul>
        <a href="/login" className="lp-nav-cta">登入 / 註冊</a>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-grid-deco"></div>
        <canvas ref={canvasRef} className="lp-canvas"></canvas>
        <div className="lp-hero-content">
          <div className="lp-eyebrow">FIFA World Cup 2026 · 機率分析平台</div>
          <h1 className="lp-title">
            DATA<br />
            DRIVES<br />
            <span className="lp-accent">INSIGHT</span>
          </h1>
          <p className="lp-desc">
            機器學習驅動的世界盃賽事分析。XGBoost 預測模型、即時賠率監控、
            歷史回測引擎——把數據轉化為可執行的分析洞見。
          </p>
          <div className="lp-actions">
            <a href="/register" className="lp-btn-primary">免費開始使用</a>
            <a href="/login" className="lp-btn-ghost">已有帳號？登入</a>
          </div>
        </div>
      </section>

      {/* Live strip */}
      <div className="lp-strip">
        <span className="lp-live-badge"><span className="lp-live-dot"></span>LIVE</span>
        {[
          ["104", "World Cup 賽事"],
          ["61.2%", "1X2 命中率"],
          ["+4.7%", "平均 CLV"],
          ["2.45", "平均進球預測"],
          ["6/11", "開賽日期"],
        ].map(([num, label]) => (
          <div key={label} className="lp-strip-stat">
            <span className="lp-strip-num">{num}</span>
            <span className="lp-strip-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Features Bento */}
      <section id="features" className="lp-section">
        <div className="lp-section-label">核心功能</div>
        <h2 className="lp-section-title">數據即視覺</h2>
        <p className="lp-section-sub">每個模組以最關鍵的數字開場。讓數據本身成為故事的主角。</p>

        <div className="lp-bento">
          <div className="lp-card lp-span4">
            <span className="lp-num lp-violet">73<small>%</small></span>
            <div className="lp-card-title">大小球命中率</div>
            <div className="lp-card-desc">Poisson 迴歸模型在 2022 世界盃歷史回測中的最佳表現。</div>
            <div className="lp-conf-bar"><div className="lp-conf-fill" style={{ width: "73%" }}></div></div>
            <span className="lp-tag lp-tag-violet">O/U 2.5 模型</span>
          </div>

          <div className="lp-card lp-span8">
            <div className="lp-card-title" style={{ marginBottom: 16 }}>
              預測市場覆蓋
            </div>
            <div className="lp-market-grid">
              {[
                ["1X2", "勝平負", "XGBoost", "violet", "FREE"],
                ["O/U", "大小球", "Poisson", "cyan", "FREE"],
                ["HCP", "亞洲讓球", "讓球轉換", "violet", "PRO"],
                ["BTTS", "雙方進球", "LightGBM", "cyan", "PRO"],
              ].map(([code, name, model, color, badge]) => (
                <div key={code} className="lp-market-card">
                  <div className={`lp-market-code lp-${color}`}>{code}</div>
                  <div className="lp-market-name">{name}</div>
                  <div className="lp-market-model">{model}</div>
                  <span className={`lp-market-badge ${badge === "PRO" ? "lp-badge-pro" : "lp-badge-free"}`}>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-card lp-span6">
            <span className="lp-num lp-white" style={{ fontSize: "clamp(40px,4.5vw,64px)" }}>CLV</span>
            <div className="lp-card-title">收盤線價值追蹤</div>
            <div className="lp-card-desc">比較模型預測機率與市場收盤賠率，量化預測優勢。歷史 CLV 均值 <span style={{ color: "var(--lp-cyan-glow)" }}>+4.7%</span>（2022 WC 回測）。</div>
          </div>

          <div className="lp-card lp-span6">
            <span className="lp-num" style={{ fontSize: "clamp(40px,4vw,58px)", color: "#EF4444", textShadow: "0 0 30px rgba(239,68,68,.4)" }}>⚡ 警示</span>
            <div className="lp-card-title">即時盤口監控</div>
            <div className="lp-card-desc">偵測快速跳盤（30 分鐘內 &gt; 0.15）與跨書商賠率差距（&gt; 20%），Email / LINE 即時通知。</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span className="lp-tag lp-tag-violet">跳盤偵測</span>
              <span className="lp-tag lp-tag-cyan">跨書商比對</span>
            </div>
          </div>

          <div className="lp-card lp-span12" style={{ textAlign: "center", padding: "48px 32px" }}>
            <div className="lp-card-desc" style={{ marginBottom: 8 }}>回測 ROI（2022 世界盃 · 64 場 · 固定注碼 2%）</div>
            <span className="lp-num lp-violet">+8.3<small style={{ fontSize: ".45em", color: "var(--lp-muted)" }}>%</small></span>
            <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 24, flexWrap: "wrap" }}>
              {[["64", "總注數"], ["58.4%", "命中率"], ["9.2%", "最大回撤"]].map(([v, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "var(--lp-cyan-glow)" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "var(--lp-muted)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="lp-section" style={{ background: "var(--lp-surface)" }}>
        <div className="lp-section-label">訂閱方案</div>
        <h2 className="lp-section-title">選擇你的層級</h2>

        <div className="lp-tier-grid">
          {[
            {
              label: "FREE TIER", price: "0", period: "永久免費", featured: false,
              features: ["1X2 勝平負預測", "O/U 大小球預測", "基礎 ELO 評分", "賽事列表與結果"],
              locked: ["亞洲讓球（HCP）", "BTTS 雙方進球", "即時賠率快照", "盤口異常警示", "回測引擎"],
              cta: "免費註冊", href: "/register",
            },
            {
              label: "PRO TIER", price: "299", period: "每月 / 世界盃期間有效", featured: true,
              features: ["包含所有免費功能", "亞洲讓球（HCP）分析", "BTTS 雙方進球預測", "即時賠率快照（30min 更新）", "跨書商最佳賠率比對", "盤口異常警示", "完整回測引擎 + 資金曲線", "CLV 追蹤與分析", "Email / LINE 通知"],
              locked: [],
              cta: "升級 Pro", href: "/register",
            },
          ].map((t) => (
            <div key={t.label} className={`lp-tier-card ${t.featured ? "lp-tier-featured" : ""}`}>
              {t.featured && <div className="lp-featured-badge">推薦方案</div>}
              <div className="lp-tier-label">{t.label}</div>
              <div className="lp-tier-price">${t.price}</div>
              <div className="lp-tier-period">{t.period}</div>
              <ul className="lp-tier-features">
                {t.features.map(f => <li key={f}>{f}</li>)}
                {t.locked.map(f => <li key={f} className="lp-locked">{f}</li>)}
              </ul>
              <a href={t.href} className={t.featured ? "lp-btn-primary lp-block" : "lp-btn-ghost lp-block"}>{t.cta}</a>
            </div>
          ))}
        </div>

        <div className="lp-disclaimer">
          <strong>免責聲明：</strong>本平台所有預測結果為機率數值，基於歷史數據與統計模型，
          不構成任何投注建議、財務建議或獲利保證。歷史回測結果不代表未來表現。請理性評估風險。
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <span className="lp-footer-logo">WC26DATA</span>
        <span className="lp-footer-note">© 2026 · FIFA WORLD CUP DATA ANALYTICS · 機率分析，非投注建議</span>
      </footer>

      {/* Sticky CTA */}
      <div className={`lp-sticky-cta ${ctaVisible ? "lp-cta-visible" : ""}`}>
        <div>
          <div className="lp-cta-text">準備好了嗎？6 月 11 日開賽</div>
          <div className="lp-cta-sub">104 場賽事 · XGBoost 預測 · 即時賠率監控</div>
        </div>
        <a href="/register" className="lp-cta-btn">立即免費開始</a>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   CSS: Landing Page
════════════════════════════════════════ */
const LANDING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

:root {
  --lp-void: #09090B;
  --lp-surface: #111115;
  --lp-surface2: #18181E;
  --lp-border: #2a2a35;
  --lp-violet: #7C3AED;
  --lp-violet-glow: #A78BFA;
  --lp-cyan: #06B6D4;
  --lp-cyan-glow: #67E8F9;
  --lp-text: #F1F0F5;
  --lp-muted: #8B8A99;
  --lp-dim: #4A4960;
}

body { background: var(--lp-void); color: var(--lp-text); margin: 0; }

/* Nav */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 64px;
  background: rgba(9,9,11,.85); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--lp-border);
}
.lp-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: .12em; color: var(--lp-text); }
.lp-logo span { color: var(--lp-cyan-glow); }
.lp-navlinks { display: flex; gap: 32px; list-style: none; margin: 0; padding: 0; }
.lp-navlinks a { font-family: 'Noto Sans TC', sans-serif; font-size: 13px; color: var(--lp-muted); text-decoration: none; transition: color .2s; }
.lp-navlinks a:hover { color: var(--lp-text); }
.lp-nav-cta {
  font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: .08em;
  color: var(--lp-cyan-glow); background: transparent;
  border: 1px solid var(--lp-cyan); padding: 8px 20px;
  text-decoration: none; transition: background .2s, color .2s;
}
.lp-nav-cta:hover { background: var(--lp-cyan); color: var(--lp-void); }

/* Hero */
.lp-hero {
  position: relative; min-height: 100vh;
  display: flex; align-items: center; padding: 0 48px; overflow: hidden;
}
.lp-canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; }
.lp-grid-deco {
  position: absolute; inset: 0; z-index: 0;
  background-image: linear-gradient(rgba(42,42,53,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,53,.4) 1px, transparent 1px);
  background-size: 64px 64px;
}
.lp-hero-content { position: relative; z-index: 2; max-width: 680px; }
.lp-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: .18em;
  text-transform: uppercase; color: var(--lp-violet-glow); margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
}
.lp-eyebrow::before { content: ''; display: block; width: 32px; height: 1px; background: var(--lp-violet-glow); }
.lp-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(64px, 9vw, 120px); line-height: .92;
  letter-spacing: .02em; color: var(--lp-text); margin-bottom: 28px;
}
.lp-accent { -webkit-text-stroke: 1px var(--lp-cyan-glow); color: transparent; }
.lp-desc { font-size: 16px; color: var(--lp-muted); max-width: 480px; margin-bottom: 40px; line-height: 1.8; }
.lp-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.lp-btn-primary {
  font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: .08em;
  background: linear-gradient(135deg, var(--lp-violet), var(--lp-cyan));
  color: #fff; border: none; padding: 14px 32px; cursor: pointer;
  text-decoration: none; display: inline-block; transition: opacity .2s, transform .15s;
}
.lp-btn-primary:hover { opacity: .88; transform: translateY(-1px); }
.lp-btn-ghost {
  font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: .06em;
  color: var(--lp-muted); border: 1px solid var(--lp-border); padding: 14px 32px;
  text-decoration: none; display: inline-block; transition: border-color .2s, color .2s;
}
.lp-btn-ghost:hover { border-color: var(--lp-violet-glow); color: var(--lp-text); }
.lp-block { display: block; text-align: center; }

/* Strip */
.lp-strip {
  position: relative; z-index: 2;
  border-top: 1px solid var(--lp-border); border-bottom: 1px solid var(--lp-border);
  background: rgba(124,58,237,.05); padding: 14px 48px;
  display: flex; gap: 48px; overflow-x: auto; flex-wrap: wrap;
}
.lp-live-badge {
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .14em; color: #EF4444;
  background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); padding: 3px 8px;
  white-space: nowrap; display: flex; align-items: center; gap: 6px;
}
.lp-live-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #EF4444;
  animation: lp-pulse 1.5s ease-in-out infinite;
}
@keyframes lp-pulse { 0%,100%{opacity:1}50%{opacity:.3} }
.lp-strip-stat { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
.lp-strip-num { font-family: 'DM Mono', monospace; font-size: 14px; color: var(--lp-cyan-glow); }
.lp-strip-label { font-size: 12px; color: var(--lp-muted); }

/* Section */
.lp-section { padding: 96px 48px; position: relative; z-index: 1; }
.lp-section-label {
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .2em;
  text-transform: uppercase; color: var(--lp-violet-glow); margin-bottom: 14px;
}
.lp-section-title {
  font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px, 5vw, 58px);
  letter-spacing: .04em; line-height: 1; margin-bottom: 16px; color: var(--lp-text);
}
.lp-section-sub { font-size: 15px; color: var(--lp-muted); max-width: 560px; line-height: 1.8; margin-bottom: 56px; }

/* Bento */
.lp-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.lp-card {
  background: var(--lp-surface); border: 1px solid var(--lp-border); padding: 32px;
  position: relative; overflow: hidden; transition: border-color .3s, transform .3s;
}
.lp-card::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(124,58,237,.04), transparent 60%);
  pointer-events: none;
}
.lp-card:hover { border-color: var(--lp-violet); transform: translateY(-2px); }
.lp-span4 { grid-column: span 4; }
.lp-span6 { grid-column: span 6; }
.lp-span8 { grid-column: span 8; }
.lp-span12 { grid-column: span 12; }
.lp-num {
  font-family: 'Bebas Neue', sans-serif; font-size: clamp(52px, 6vw, 80px);
  display: block; margin-bottom: 16px; line-height: 1;
}
.lp-num small { font-size: .45em; color: var(--lp-muted); }
.lp-violet { color: var(--lp-violet-glow); text-shadow: 0 0 40px rgba(167,139,250,.5); }
.lp-cyan { color: var(--lp-cyan-glow); text-shadow: 0 0 40px rgba(103,232,249,.5); }
.lp-white { color: #ffffff; text-shadow: 0 0 30px rgba(255,255,255,.2); }
.lp-card-title { font-size: 14px; font-weight: 500; color: var(--lp-text); margin-bottom: 6px; }
.lp-card-desc { font-size: 13px; color: var(--lp-muted); line-height: 1.7; }
.lp-tag {
  display: inline-block; font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: .12em; padding: 4px 10px; border: 1px solid; margin-top: 16px;
}
.lp-tag-violet { color: var(--lp-violet-glow); border-color: rgba(167,139,250,.3); background: rgba(124,58,237,.08); }
.lp-tag-cyan { color: var(--lp-cyan-glow); border-color: rgba(103,232,249,.3); background: rgba(6,182,212,.08); }
.lp-conf-bar { height: 4px; background: var(--lp-border); margin-top: 16px; }
.lp-conf-fill { height: 100%; background: linear-gradient(90deg, var(--lp-violet), var(--lp-cyan)); transition: width 1s ease; }

/* Market grid */
.lp-market-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.lp-market-card { border: 1px solid var(--lp-border); padding: 16px; background: var(--lp-surface2); }
.lp-market-code { font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: .14em; margin-bottom: 8px; font-weight: 500; }
.lp-market-name { font-size: 13px; font-weight: 500; color: var(--lp-text); margin-bottom: 4px; }
.lp-market-model { font-size: 11px; color: var(--lp-muted); margin-bottom: 8px; }
.lp-market-badge { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .1em; padding: 2px 8px; border: 1px solid; }
.lp-badge-free { color: var(--lp-muted); border-color: var(--lp-border); }
.lp-badge-pro { color: var(--lp-violet-glow); border-color: rgba(167,139,250,.4); background: rgba(124,58,237,.1); }

/* Tier cards */
.lp-tier-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 56px; }
.lp-tier-card { border: 1px solid var(--lp-border); padding: 36px 32px; position: relative; transition: border-color .3s; }
.lp-tier-featured { border-color: var(--lp-violet); background: linear-gradient(135deg, rgba(124,58,237,.06), transparent); }
.lp-featured-badge {
  position: absolute; top: -1px; right: 24px;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .12em;
  background: linear-gradient(90deg, var(--lp-violet), var(--lp-cyan)); color: #fff; padding: 4px 12px;
}
.lp-tier-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .16em; color: var(--lp-muted); margin-bottom: 12px; }
.lp-tier-price { font-family: 'Bebas Neue', sans-serif; font-size: 56px; line-height: 1; color: var(--lp-text); margin-bottom: 4px; }
.lp-tier-period { font-size: 12px; color: var(--lp-muted); margin-bottom: 28px; }
.lp-tier-features { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 10px; }
.lp-tier-features li { font-size: 13px; color: var(--lp-muted); display: flex; gap: 10px; align-items: flex-start; line-height: 1.5; }
.lp-tier-features li::before { content: '▸'; color: var(--lp-violet-glow); flex-shrink: 0; }
.lp-locked { color: var(--lp-dim) !important; }
.lp-locked::before { color: var(--lp-dim) !important; }

/* Disclaimer */
.lp-disclaimer {
  background: rgba(239,68,68,.05); border: 1px solid rgba(239,68,68,.15);
  padding: 16px 24px; font-size: 12px; color: rgba(239,68,68,.7);
  font-family: 'DM Mono', monospace; letter-spacing: .04em; line-height: 1.7; margin-top: 48px;
}
.lp-disclaimer strong { color: rgba(239,68,68,.9); }

/* Sticky CTA */
.lp-sticky-cta {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
  background: rgba(124,58,237,.95); backdrop-filter: blur(12px);
  border-top: 1px solid rgba(167,139,250,.3); padding: 16px 48px;
  display: flex; align-items: center; justify-content: space-between;
  transform: translateY(100%); transition: transform .4s cubic-bezier(.22,1,.36,1);
}
.lp-cta-visible { transform: translateY(0) !important; }
.lp-cta-text { font-size: 15px; font-weight: 500; color: #fff; }
.lp-cta-sub { font-size: 12px; color: rgba(255,255,255,.6); font-family: 'DM Mono', monospace; letter-spacing: .06em; }
.lp-cta-btn {
  font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: .08em;
  background: var(--lp-cyan); color: var(--lp-void); border: none; padding: 12px 28px;
  cursor: pointer; font-weight: 500; text-decoration: none; transition: background .2s;
}
.lp-cta-btn:hover { background: var(--lp-cyan-glow); }

/* Footer */
.lp-footer {
  border-top: 1px solid var(--lp-border); padding: 40px 48px;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
}
.lp-footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: .12em; color: var(--lp-muted); }
.lp-footer-note { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--lp-dim); letter-spacing: .06em; }

@media (max-width: 900px) {
  .lp-nav { padding: 0 20px; }
  .lp-navlinks { display: none; }
  .lp-hero { padding: 80px 20px 40px; }
  .lp-section { padding: 64px 20px; }
  .lp-strip { padding: 14px 20px; gap: 20px; }
  .lp-span4, .lp-span6, .lp-span8 { grid-column: span 12; }
  .lp-market-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-sticky-cta { padding: 16px 20px; }
  .lp-footer { padding: 28px 20px; }
}
`;

/* ════════════════════════════════════════
   CSS: Dashboard (已登入)
════════════════════════════════════════ */
const DASHBOARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

.db-root {
  background: #09090B; min-height: 100vh; color: #F1F0F5;
  font-family: 'Noto Sans TC', sans-serif;
}
.db-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 64px;
  background: rgba(9,9,11,.9); backdrop-filter: blur(12px);
  border-bottom: 1px solid #2a2a35;
}
.db-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: .12em; color: #F1F0F5; }
.db-logo span { color: #67E8F9; }
.db-navlink { font-size: 13px; color: #8B8A99; text-decoration: none; transition: color .2s; }
.db-navlink:hover { color: #F1F0F5; }
.db-logout {
  font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: .08em;
  color: #8B8A99; background: transparent; border: 1px solid #2a2a35; padding: 7px 16px; cursor: pointer; transition: all .2s;
}
.db-logout:hover { border-color: #A78BFA; color: #F1F0F5; }
.db-hero {
  padding: 80px 48px 64px; text-align: center;
  background: linear-gradient(180deg, rgba(124,58,237,.06) 0%, transparent 100%);
}
.db-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: .18em;
  color: #A78BFA; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.db-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #A78BFA;
  animation: db-pulse 2s ease-in-out infinite;
}
@keyframes db-pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)} }
.db-welcome {
  font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 88px);
  letter-spacing: .04em; line-height: 1; color: #F1F0F5; margin-bottom: 12px;
}
.db-email { font-size: 15px; color: #8B8A99; margin-bottom: 20px; font-family: 'DM Mono', monospace; }
.db-tier-badge {
  display: inline-block; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: .12em;
  padding: 6px 20px; border: 1px solid; margin-bottom: 20px;
}
.db-tier-badge[data-tier="pro"] { color: #67E8F9; border-color: rgba(103,232,249,.4); background: rgba(6,182,212,.08); }
.db-tier-badge:not([data-tier="pro"]) { color: #8B8A99; border-color: #2a2a35; }
.db-upgrade-hint { font-size: 13px; color: #4A4960; margin-bottom: 0; }
.db-upgrade-link { color: #A78BFA; text-decoration: none; margin-left: 8px; }
.db-upgrade-link:hover { color: #67E8F9; }
.db-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px; padding: 0 48px 48px; max-width: 900px; margin: 0 auto;
}
.db-card {
  background: #111115; border: 1px solid #2a2a35; padding: 28px 24px;
  text-align: center; transition: border-color .3s;
}
.db-card:hover { border-color: #7C3AED; }
.db-card-num {
  font-family: 'Bebas Neue', sans-serif; font-size: 44px; line-height: 1; margin-bottom: 8px;
}
.db-card-num.violet { color: #A78BFA; text-shadow: 0 0 30px rgba(167,139,250,.4); }
.db-card-num.cyan { color: #67E8F9; text-shadow: 0 0 30px rgba(103,232,249,.4); }
.db-card-num.white { color: #fff; }
.db-card-num small { font-size: .5em; color: #8B8A99; }
.db-card-label { font-size: 12px; color: #8B8A99; letter-spacing: .04em; }
.db-actions {
  display: flex; gap: 16px; justify-content: center; padding: 0 48px 64px; flex-wrap: wrap;
}
.db-btn-primary {
  font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: .08em;
  background: linear-gradient(135deg, #7C3AED, #06B6D4); color: #fff; border: none;
  padding: 14px 32px; cursor: pointer; text-decoration: none; transition: opacity .2s;
}
.db-btn-primary:hover { opacity: .85; }
.db-btn-ghost {
  font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: .06em;
  color: #8B8A99; border: 1px solid #2a2a35; padding: 14px 32px;
  text-decoration: none; transition: border-color .2s, color .2s;
}
.db-btn-ghost:hover { border-color: #A78BFA; color: #F1F0F5; }
.db-disclaimer {
  margin: 0 48px 48px; background: rgba(239,68,68,.05); border: 1px solid rgba(239,68,68,.12);
  padding: 14px 20px; font-size: 11px; color: rgba(239,68,68,.6);
  font-family: 'DM Mono', monospace; letter-spacing: .04em;
}
@media (max-width: 768px) {
  .db-nav { padding: 0 20px; }
  .db-hero { padding: 60px 20px 40px; }
  .db-grid { padding: 0 20px 40px; }
  .db-actions { padding: 0 20px 40px; }
  .db-disclaimer { margin: 0 20px 40px; }
}
`;
