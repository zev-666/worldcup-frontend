"use client";

import UpgradeButton from "./UpgradeButton";

interface MemberGateProps {
  userEmail?: string;
  label?: string;
}

export default function MemberGate({
  userEmail,
  label = "讓球、大小球、BTTS 詳細賠率",
}: MemberGateProps) {
  return (
    <div className="relative rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
      <div className="text-3xl mb-2">🔒</div>
      <p className="text-sm font-semibold text-amber-800 mb-1">Pro 會員專屬</p>
      <p className="text-xs text-amber-600 mb-4">{label}</p>
      <UpgradeButton userEmail={userEmail} />
      <p className="text-xs text-gray-400 mt-3">
        ⚠️ 所有數據僅供分析參考，非投注建議。
      </p>
    </div>
  );
}
