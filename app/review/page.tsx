'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { SessionSummary } from '@/lib/types';

export default function ReviewListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('cleaning_session_summary')
      .select('*')
      .eq('status', 'completed')
      .order('session_date', { ascending: false })
      .then(({ data }) => {
        if (data) setSessions(data as SessionSummary[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => router.push('/')} className="text-sm text-bark-500 flex items-center gap-1">
        &lsaquo; 홈으로
      </button>

      <div className="flex items-center gap-2">
        <span className="text-2xl">📋</span>
        <h1 className="text-xl font-bold text-bark-800">검수 대기</h1>
      </div>

      {loading ? (
        <div className="text-center py-8 text-bark-400 animate-pulse">로딩 중...</div>
      ) : sessions.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-bark-500">검수 대기 중인 세션이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => router.push(`/review/${s.id}`)}
              className="card w-full text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-bark-800">{s.cleaner_name}</p>
                  <p className="text-sm text-bark-500">{s.session_date}</p>
                  <div className="flex gap-3 text-xs text-bark-500">
                    <span>체크 {s.tasks_done}/{s.tasks_total}</span>
                    <span>사진 {s.photo_count}장</span>
                    <span>영상 {s.video_count}개</span>
                  </div>
                </div>
                <span className="badge-complete">검수대기</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
