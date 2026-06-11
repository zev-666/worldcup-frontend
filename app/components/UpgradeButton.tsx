"use client";

interface UpgradeButtonProps {
  userEmail?: string;
}

export default function UpgradeButton({ userEmail }: UpgradeButtonProps) {
  const CHECKOUT_URL = "https://bestsaler666.gumroad.com/l/fzljib";

  const handleUpgrade = () => {
    const url = userEmail
      ? `${CHECKOUT_URL}?email=${encodeURIComponent(userEmail)}`
      : CHECKOUT_URL;
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