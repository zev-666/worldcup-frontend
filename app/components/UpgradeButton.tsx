"use client";

interface UpgradeButtonProps {
  userEmail?: string;
}

export default function UpgradeButton({ userEmail }: UpgradeButtonProps) {
  const baseUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || "";

  const handleUpgrade = () => {
    if (!baseUrl) {
      alert("升級連結尚未設定，請聯繫管理員。");
      return;
    }
    const url = userEmail
      ? `${baseUrl}?checkout[email]=${encodeURIComponent(userEmail)}`
      : baseUrl;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleUpgrade}
      style={{
        background: "#00C27A",
        color: "#050A07",
        border: "none",
        borderRadius: "7px",
        padding: "9px 20px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: ".02em",
        transition: "opacity .15s",
      }}
      onMouseOver={(e) => (e.currentTarget.style.opacity = ".85")}
      onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
    >
      ⚡ 升級 Pro 解鎖完整功能
    </button>
  );
}
