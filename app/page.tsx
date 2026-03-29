'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { CleaningSession } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeSessions, setResumeSessions] = useState<CleaningSession[]>([]);

  useEffect(() => {
    supabase
      .from('cleaning_sessions')
      .select('*')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setResumeSessions(data as CleaningSession[]);
      });
  }, []);

  const handleStart = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleanerName: name.trim(), cleanerPhone: phone.trim() }),
      });

      if (!res.ok) throw new Error('세션 생성 실패');

      const { session } = await res.json();
      router.push(`/clean/${session.id}`);
    } catch {
      alert('세션 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 pt-8">
        <div className="text-6xl">🐌</div>
        <h1 className="text-2xl font-bold text-bark-800">달팽이아지트</h1>
        <p className="text-bark-500">청소 관리 시스템</p>
      </div>

      {/* Start Form */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-bark-700 text-center">청소 시작</h2>

        <div>
          <label className="block text-sm text-bark-600 mb-1">이름 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="청소자 이름"
            className="input-field"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm text-bark-600 mb-1">전화번호 (검수 결과 수신용)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="input-field"
          />
        </div>

        <button
          onClick={handleStart}
          disabled={loading || !name.trim()}
          className="btn-primary w-full"
        >
          {loading ? '생성 중...' : '청소 시작하기'}
        </button>
      </div>

      {/* Resume Sessions */}
      {resumeSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-bark-600 px-1">진행 중인 세션</h3>
          {resumeSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => router.push(`/clean/${session.id}`)}
              className="card w-full text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-bark-800">{session.cleaner_name}</p>
                  <p className="text-xs text-bark-500">{session.session_date}</p>
                </div>
                <span className="badge-progress">진행중</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/review')}
          className="card text-center hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-1">📋</div>
          <p className="text-sm font-medium text-bark-700">검수하기</p>
        </button>
        <button
          onClick={() => router.push('/history')}
          className="card text-center hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-1">📊</div>
          <p className="text-sm font-medium text-bark-700">청소 이력</p>
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push('/manual')}
          className="text-sm text-bark-400 underline"
        >
          매뉴얼 영상 관리
        </button>
      </div>
    </div>
  );
}
