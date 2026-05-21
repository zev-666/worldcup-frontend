'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Match {
  id: number
  home_team: string
  away_team: string
  match_date?: string
}

interface DetailedOdds {
  asian_handicap: any
  over_under: any
  btts: any
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [detailedCache, setDetailedCache] = useState<Record<number, DetailedOdds>>({})
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('supabase_token')
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) setUser(data)
        })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/`)
      .then(res => res.json())
      .then(data => {
        setMatches(Array.isArray(data) ? data : data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fetchDetailed = async (matchId: number) => {
    const token = localStorage.getItem('supabase_token')
    if (!token || !user || user.tier !== 'pro') return
    if (detailedCache[matchId]) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/odds/detailed/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const json = await res.json()
      setDetailedCache(prev => ({ ...prev, [matchId]: json }))
    }
  }

  if (loading) return <div>載入比賽中...</div>

  return (
    <main style={{ padding: '2rem' }}>
      {/* ===== 導覽列 ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>比賽列表</h1>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: '1rem' }}>
                {user.email}（{user.tier === 'pro' ? 'Pro 會員' : '免費會員'}）
              </span>
              <button onClick={() => {
                localStorage.removeItem('supabase_token')
                window.location.reload()
              }}>登出</button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} style={{ marginRight: '0.5rem' }}>登入</button>
              <button onClick={() => router.push('/register')}>註冊</button>
            </>
          )}
        </div>
      </div>

      {/* ===== 比賽列表 ===== */}
      {matches.length === 0 && <p>暫無比賽</p>}
      {matches.map(match => (
        <div key={match.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <h3>{match.home_team} vs {match.away_team}</h3>
          {match.match_date && <p>日期：{match.match_date}</p>}
          
          <div style={{ marginTop: '0.5rem' }}>
            {user?.tier === 'pro' ? (
              <div>
                <button onClick={() => fetchDetailed(match.id)}>
                  載入詳細賠率
                </button>
                {detailedCache[match.id] && (
                  <div>
                    <p>亞洲盤：{JSON.stringify(detailedCache[match.id].asian_handicap)}</p>
                    <p>大小球：{JSON.stringify(detailedCache[match.id].over_under)}</p>
                    <p>BTTS：{JSON.stringify(detailedCache[match.id].btts)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>{user ? '🔒 升級 Pro 解鎖詳細賠率' : '🔒 登入後解鎖詳細賠率'}</p>
            )}
          </div>
        </div>
      ))}
    </main>
  )
}