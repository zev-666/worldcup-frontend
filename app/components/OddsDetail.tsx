"use client";

interface DetailedOdds {
  home_odds: number;
  away_odds: number;
  line: number;
  over_odds: number;
  under_odds: number;
  yes_odds: number;
  no_odds: number;
}

interface Props {
  homeTeam: string;
  awayTeam: string;
  odds: DetailedOdds;
}

export default function OddsDetail({ homeTeam, awayTeam, odds }: Props) {
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 0" }}>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        詳細賠率
      </p>

      {/* 讓球 */}
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>讓球市場</p>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", fontSize: 14, marginBottom: 16 }}>
        <thead style={{ background: "var(--color-background-secondary)" }}>
          <tr>
            <th style={thStyle}>隊伍</th>
            <th style={thStyle}>讓球</th>
            <th style={{ ...thStyle, textAlign: "right" }}>賠率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><Badge color="blue">主隊</Badge> {homeTeam}</td>
            <td style={{ ...tdStyle, color: "var(--color-text-secondary)" }}>-{odds.line} 球</td>
            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500, fontSize: 15 }}>{odds.home_odds.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={tdLastStyle}><Badge color="coral">客隊</Badge> {awayTeam}</td>
            <td style={{ ...tdLastStyle, color: "var(--color-text-secondary)" }}>+{odds.line} 球</td>
            <td style={{ ...tdLastStyle, textAlign: "right", fontWeight: 500, fontSize: 15 }}>{odds.away_odds.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* 大小球 */}
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>大小球市場（盤口 {odds.line} 球）</p>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", fontSize: 14, marginBottom: 16 }}>
        <thead style={{ background: "var(--color-background-secondary)" }}>
          <tr>
            <th style={thStyle}>選項</th>
            <th style={thStyle}>說明</th>
            <th style={{ ...thStyle, textAlign: "right" }}>賠率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><Badge color="green">大球</Badge> Over</td>
            <td style={{ ...tdStyle, color: "var(--color-text-secondary)" }}>總進球 {odds.line + 0.5} 球以上</td>
            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500, fontSize: 15 }}>{odds.over_odds.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={tdLastStyle}><Badge color="amber">小球</Badge> Under</td>
            <td style={{ ...tdLastStyle, color: "var(--color-text-secondary)" }}>總進球 {odds.line - 0.5} 球以下</td>
            <td style={{ ...tdLastStyle, textAlign: "right", fontWeight: 500, fontSize: 15 }}>{odds.under_odds.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* BTTS */}
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>雙隊得分（BTTS）</p>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", fontSize: 14, marginBottom: 12 }}>
        <thead style={{ background: "var(--color-background-secondary)" }}>
          <tr>
            <th style={thStyle}>選項</th>
            <th style={thStyle}>說明</th>
            <th style={{ ...thStyle, textAlign: "right" }}>賠率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><Badge color="green">是</Badge> Yes</td>
            <td style={{ ...tdStyle, color: "var(--color-text-secondary)" }}>兩隊都進球</td>
            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500, fontSize: 15 }}>{odds.yes_odds.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={tdLastStyle}><Badge color="red">否</Badge> No</td>
            <td style={{ ...tdLastStyle, color: "var(--color-text-secondary)" }}>至少一隊零封</td>
            <td style={{ ...tdLastStyle, textAlign: "right", fontWeight: 500, fontSize: 15 }}>{odds.no_odds.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
        資料僅供參考，不構成任何投注建議。
      </p>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue:  { bg: "#E6F1FB", text: "#0C447C" },
    coral: { bg: "#FAECE7", text: "#712B13" },
    green: { bg: "#EAF3DE", text: "#27500A" },
    amber: { bg: "#FAEEDA", text: "#633806" },
    red:   { bg: "#FCEBEB", text: "#791F1F" },
  };
  const c = colorMap[color];
  return (
    <span style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 500, background: c.bg, color: c.text, marginRight: 6 }}>
      {children}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  padding: "9px 14px", textAlign: "left", fontSize: 12,
  color: "var(--color-text-secondary)", fontWeight: 500,
  borderBottom: "0.5px solid var(--color-border-tertiary)",
};
const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: "0.5px solid var(--color-border-tertiary)",
  color: "var(--color-text-primary)",
};
const tdLastStyle: React.CSSProperties = {
  padding: "10px 14px",
  color: "var(--color-text-primary)",
};