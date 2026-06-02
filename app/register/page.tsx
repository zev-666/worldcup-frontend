"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.session) {
      localStorage.setItem("sb-access-token", data.session.access_token);
      alert("註冊成功！");
      router.push("/");
    } else {
      alert("註冊成功！請至信箱確認驗證信，再回來登入。");
      router.push("/login");
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">WC26<span>DATA</span></div>
          <h1 className="auth-title">建立帳號</h1>
          <p className="auth-sub">免費使用 · 1X2 預測功能</p>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
            </div>
            <div className="auth-field">
              <label className="auth-label">密碼（至少 6 位）</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6} className="auth-input" />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "處理中..." : "立即註冊"}
            </button>
          </form>

          {/* 功能對比 */}
          <div className="auth-features">
            {[
              { badge: "FREE", text: "1X2 勝平負預測", pro: false },
              { badge: "FREE", text: "104 場賽事資料", pro: false },
              { badge: "PRO", text: "大小球、讓球、BTTS", pro: true },
              { badge: "PRO", text: "詳細賠率市場", pro: true },
            ].map((f) => (
              <div key={f.text} className="auth-feature-row">
                <span className={`auth-badge ${f.pro ? "pro" : ""}`}>{f.badge}</span>
                <span className="auth-feature-text">{f.text}</span>
              </div>
            ))}
          </div>

          <p className="auth-switch">
            已有帳號？<a href="/login" className="auth-link">立即登入</a>
          </p>
          <p className="auth-disclaimer">⚠ 數據僅供分析參考，非投注建議</p>
        </div>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.auth-bg{
  min-height:100vh;background:#07090B;
  display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:'Inter','Noto Sans TC',sans-serif;
}
.auth-card{
  background:#0C1014;border:1px solid #1C2530;border-radius:14px;
  padding:44px 36px;width:100%;max-width:420px;text-align:center;
  position:relative;overflow:hidden;
}
.auth-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent 5%,rgba(0,194,122,.4) 50%,transparent 95%);
}
.auth-logo{
  font-size:20px;font-weight:700;letter-spacing:.1em;
  color:#DDE4EC;margin-bottom:20px;display:flex;align-items:center;
  justify-content:center;gap:6px;
}
.auth-logo::before{
  content:'';width:7px;height:7px;border-radius:50%;
  background:#00C27A;box-shadow:0 0 8px rgba(0,194,122,.6);
}
.auth-logo span{color:#00C27A}
.auth-title{font-size:20px;font-weight:700;color:#DDE4EC;margin-bottom:4px;letter-spacing:-.01em}
.auth-sub{font-size:11px;color:#607080;margin-bottom:28px;font-family:'IBM Plex Mono',monospace;letter-spacing:.08em}
.auth-form{display:flex;flex-direction:column;gap:14px;text-align:left}
.auth-field{display:flex;flex-direction:column;gap:5px}
.auth-label{font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.1em;color:#607080;text-transform:uppercase}
.auth-input{
  background:#111820;border:1px solid #1C2530;color:#DDE4EC;
  padding:11px 14px;font-size:14px;outline:none;border-radius:7px;
  transition:border-color .15s;font-family:'Inter',sans-serif;
}
.auth-input:focus{border-color:#00C27A}
.auth-input::placeholder{color:#2A3840}
.auth-error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#EF4444;font-size:12px;padding:9px 12px;border-radius:6px}
.auth-btn{
  background:#00C27A;color:#050A07;border:none;padding:12px;
  font-size:14px;font-weight:700;cursor:pointer;border-radius:7px;
  transition:opacity .15s;font-family:'Inter',sans-serif;margin-top:2px;
}
.auth-btn:hover{opacity:.85}
.auth-btn:disabled{opacity:.45;cursor:not-allowed}
.auth-features{
  margin-top:20px;border:1px solid #1C2530;border-radius:8px;
  padding:14px;display:flex;flex-direction:column;gap:8px;text-align:left;
}
.auth-feature-row{display:flex;align-items:center;gap:10px}
.auth-badge{
  font-size:10px;font-family:'IBM Plex Mono',monospace;letter-spacing:.08em;
  padding:2px 8px;border-radius:4px;border:1px solid #1C2530;
  color:#607080;background:#0F1820;flex-shrink:0;
}
.auth-badge.pro{color:#00C27A;border-color:rgba(0,194,122,.25);background:rgba(0,194,122,.08)}
.auth-feature-text{font-size:13px;color:#607080}
.auth-switch{margin-top:20px;font-size:13px;color:#607080}
.auth-link{color:#00C27A;text-decoration:none;margin-left:4px}
.auth-link:hover{color:#3B9EFF}
.auth-disclaimer{margin-top:16px;font-size:11px;color:#1C2530;font-family:'IBM Plex Mono',monospace}
`;
