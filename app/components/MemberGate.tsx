"use client";
import UpgradeButton from "./UpgradeButton";

interface MemberGateProps {
  userEmail?: string;
  label?: string;
}

export default function MemberGate({
  userEmail,
  label = "大小球、讓球、BTTS 詳細賠率",
}: MemberGateProps) {
  return (
    <div style={{
      border: "1px solid rgba(255,193,7,.2)",
      background: "rgba(255,193,7,.04)",
      borderRadius: "10px",
      padding: "20px",
      textAlign: "center",
      marginTop: "14px",
    }}>
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔒</div>
      <p style={{
        fontSize: "13px", fontWeight: 600,
        color: "#DDE4EC", marginBottom: "4px",
      }}>
        Pro 會員專屬
      </p>
      <p style={{
        fontSize: "12px", color: "#607080", marginBottom: "14px", lineHeight: 1.6,
      }}>
        {label}
      </p>
      <UpgradeButton userEmail={userEmail} />
      <p style={{
        fontSize: "11px", color: "#2A3840", marginTop: "12px",
      }}>
        ⚠ 所有數據僅供分析參考，非投注建議
      </p>
    </div>
  );
}
