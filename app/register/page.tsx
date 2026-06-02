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

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

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
          <p className="auth-sub">免費使用 1X2 預測功能</p>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">密碼（至少 6 位）</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "處理中..." : "立即註冊"}
            </button>
          </form>

          {/* 功能說明 */}
          <div className="auth-features">
            <div className="auth-feature-row">
              <span className="auth-feature-free">FREE</span>
              <span>1X2 勝平負預測</span>
            </div>
            <div className="auth-feature-row">
              <span className="auth-feature-free">FREE</span>
              <span>104 場賽事資料</span>
            </div>
            <div className="auth-feature-row">
              <span className="auth-feature-pro">PRO</span>
              <span>大小球、讓球、BTTS</span>
            </div>
            <div className="auth-feature-row">
              <span className="auth-feature-pro">PRO</span>
              <span>詳細賠率市場</span>
            </div>
          </div>

          <p className="auth-switch">
            已有帳號？{" "}
            <a href="/login" className="auth-link">立即登入</a>
          </p>

          <p className="auth-disclaimer">
            ⚠️ 本平台數據僅供分析，非投注建議
          </p>
        </div>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

.auth-bg {
  min-height: 100vh;
  background: #09090B;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-card {
  background: #111115;
  border: 1px solid #2a2a35;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
}
.auth-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  letter-spacing: .12em;
  color: #F1F0F5;
  margin-bottom: 24px;
}
.auth-logo span { color: #67E8F9; }
.auth-title {
  font-size: 22px;
  font-weight: 700;
  color: #F1F0F5;
  margin-bottom: 6px;
}
.auth-sub {
  font-size: 12px;
  color: #4A4960;
  font-family: 'DM Mono', monospace;
  letter-spacing: .06em;
  margin-bottom: 32px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}
.auth-field { display: flex; flex-direction: column; gap: 6px; }
.auth-label {
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  letter-spacing: .1em;
  color: #8B8A99;
  text-transform: uppercase;
}
.auth-input {
  background: #18181E;
  border: 1px solid #2a2a35;
  color: #F1F0F5;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color .2s;
  width: 100%;
  box-sizing: border-box;
}
.auth-input:focus { border-color: #7C3AED; }
.auth-input::placeholder { color: #4A4960; }
.auth-error {
  background: rgba(239,68,68,.1);
  border: 1px solid rgba(239,68,68,.3);
  color: #EF4444;
  font-size: 13px;
  padding: 10px 14px;
}
.auth-btn {
  background: linear-gradient(135deg, #7C3AED, #06B6D4);
  color: #fff;
  border: none;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .2s;
  font-family: 'DM Mono', monospace;
  letter-spacing: .08em;
  margin-top: 4px;
}
.auth-btn:hover { opacity: .85; }
.auth-btn:disabled { opacity: .5; cursor: not-allowed; }
.auth-features {
  margin-top: 28px;
  border: 1px solid #2a2a35;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}
.auth-feature-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #8B8A99;
}
.auth-feature-free {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: .1em;
  color: #8B8A99;
  border: 1px solid #2a2a35;
  padding: 2px 7px;
  flex-shrink: 0;
}
.auth-feature-pro {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: .1em;
  color: #A78BFA;
  border: 1px solid rgba(167,139,250,.4);
  background: rgba(124,58,237,.1);
  padding: 2px 7px;
  flex-shrink: 0;
}
.auth-switch {
  margin-top: 24px;
  font-size: 13px;
  color: #4A4960;
}
.auth-link { color: #A78BFA; text-decoration: none; }
.auth-link:hover { color: #67E8F9; }
.auth-disclaimer {
  margin-top: 20px;
  font-size: 11px;
  color: #2a2a35;
  font-family: 'DM Mono', monospace;
}
`;
