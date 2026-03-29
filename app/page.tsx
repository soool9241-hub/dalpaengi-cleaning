'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { CLEANERS, type RegisteredCleaner } from '@/lib/cleaners';
import type { CleaningSession } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState('');
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

  const handleStart = async (cleaner: RegisteredCleaner) => {
    setLoading(true);
    setSelectedName(cleaner.name);
    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleanerName: cleaner.name,
          cleanerPhone: cleaner.phone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '세션 생성 실패');
      }

      const { session } = await res.json();
      router.push(`/clean/${session.id}`);
    } catch (e) {
      alert(`세션 생성 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
      setSelectedName('');
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

      {/* Cleaner Selection */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-bark-700 text-center">청소자 선택</h2>

        <div className="space-y-2">
          {CLEANERS.map((cleaner) => (
            <button
              key={cleaner.phone}
              onClick={() => handleStart(cleaner)}
              disabled={loading}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
                ${loading && selectedName === cleaner.name
                  ? 'border-moss-500 bg-moss-50'
                  : 'border-bark-200 hover:border-moss-400 hover:bg-moss-50/50'
                }
                ${loading && selectedName !== cleaner.name ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold text-lg">
                  {cleaner.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-bark-800">{cleaner.name}</p>
                  <p className="text-xs text-bark-500">{cleaner.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</p>
                </div>
              </div>
              {loading && selectedName === cleaner.name ? (
                <span className="text-sm text-moss-600 animate-pulse">시작 중...</span>
              ) : (
                <span className="text-sm text-moss-600 font-medium">청소 시작 &rsaquo;</span>
              )}
            </button>
          ))}
        </div>
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
                <span className="badge-progress">이어하기 &rsaquo;</span>
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
