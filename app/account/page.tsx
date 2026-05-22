'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 讀取 localStorage 中的 token 與使用者資訊
    const token = localStorage.getItem('sb-access-token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 向後端取得會員資料
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          // token 無效或過期
          localStorage.removeItem('sb-access-token');
          router.push('/login');
        }
      } catch (err) {
        console.error('取得會員資料失敗', err);
      }
    };
    fetchUser();
  }, [router]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('sb-access-token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // 導向 Stripe 付款頁面
      } else {
        setMessage('無法啟動付款流程，請稍後再試。');
      }
    } catch (err) {
      setMessage('連線錯誤，請檢查網路。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <p className="text-center mt-10">載入中...</p>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">我的帳號</h1>
      <div className="bg-white shadow rounded p-4 mb-6">
        <p><strong>Email：</strong>{user.email}</p>
        <p>
          <strong>方案：</strong>
          {user.tier === 'pro' ? (
            <span className="text-green-600 font-semibold">Pro 會員</span>
          ) : (
            <span className="text-gray-500">Free 會員</span>
          )}
        </p>
      </div>

      {user.tier === 'free' && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h2 className="text-lg font-semibold mb-2">升級到 Pro</h2>
          <p className="text-gray-600 mb-4">解鎖完整賠率分析、預測功能與更多數據。</p>
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '處理中...' : '立即升級 (NT$100)'}
          </button>
          {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
      )}

      {user.tier === 'pro' && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-700">你已是 Pro 會員，享有完整功能！</p>
        </div>
      )}
    </main>
  );
}