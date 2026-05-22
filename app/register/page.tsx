'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      setError(error.message)
    } else {
      // 如果 Supabase 專案關閉信箱驗證，註冊後會直接拿到 session
      if (data.session) {
        // ✅ 寫入 token 以便其他頁面使用
        localStorage.setItem('sb-access-token', data.session.access_token)
        alert('註冊成功！')
        router.push('/')
      } else {
        // 若需信箱驗證，則引導至登入頁
        alert('註冊成功！請檢查信箱並完成驗證，然後前往登入。')
        router.push('/login')
      }
    }
  }

  return (
    <main style={{ maxWidth: '400px', margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>註冊</h1>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
              width: '100%',
            }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="密碼（至少 6 位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '16px',
              width: '100%',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: '#1a5490',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          註冊
        </button>
        {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
      </form>
      <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center' }}>
        已有帳號？ <a href="/login" style={{ color: '#1a5490' }}>登入</a>
      </p>
    </main>
  )
}