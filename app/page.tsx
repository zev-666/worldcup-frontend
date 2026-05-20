"use client";

import { useEffect, useState } from "react";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  stage: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://worldcup-api-jryd.onrender.com/matches?limit=104")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const formatTaipeiTime = (utcStr: string) => {
    const date = new Date(utcStr);
    return date.toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-xl animate-pulse">載入比賽資料中...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-red-400 text-xl">錯誤：{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        FIFA World Cup 2026 賽程
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full max-w-5xl mx-auto border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-4 py-2 text-left">主隊</th>
              <th className="border border-gray-700 px-4 py-2 text-left">客隊</th>
              <th className="border border-gray-700 px-4 py-2 text-left">開賽時間 (台北)</th>
              <th className="border border-gray-700 px-4 py-2 text-left">階段</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-800 transition-colors">
                <td className="border border-gray-700 px-4 py-2">{match.home_team}</td>
                <td className="border border-gray-700 px-4 py-2">{match.away_team}</td>
                <td className="border border-gray-700 px-4 py-2">
                  {formatTaipeiTime(match.kickoff_utc)}
                </td>
                <td className="border border-gray-700 px-4 py-2">
                  {match.stage || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}