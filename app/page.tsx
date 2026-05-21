'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [user, setUser] = useState<{ id: string; email: string; tier: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('supabase_token')
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) setUser(data)
        })
        .catch(() => {})
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('supabase_token')
    setUser(null)
    router.refresh()
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>FIFA World Cup 2026 數據分析平台</h1>
      {user ? (
        <div>
          <p>已登入：{user.email}（{user.tier === 'pro' ? 'Pro 會員' : '免費會員'}）</p>
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : (
        <div>
          <button onClick={() => router.push('/login')}>登入</button>
          <button onClick={() => router.push('/register')}>註冊</button>
        </div>
      )}
      <button onClick={() => router.push('/matches')} style={{ marginTop: '1rem' }}>查看比賽</button>
    </main>
  )
}