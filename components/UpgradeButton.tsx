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
      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
    >
      ⚡ 升級 Pro 解鎖完整賠率
    </button>
  );
}
