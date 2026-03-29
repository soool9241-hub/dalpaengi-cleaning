'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { SessionSummary } from '@/lib/types';

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  in_progress: { label: '진행중', class: 'badge-progress' },
  completed: { label: '검수대기', class: 'badge-complete' },
  reviewed: { label: '승인', class: 'badge-reviewed' },
  rejected: { label: '반려', class: 'badge-rejected' },
};

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const query = supabase
      .from('cleaning_session_summary')
      .select('*')
      .order('session_date', { ascending: false })
      .limit(50);

    if (statusFilter !== 'all') {
      query.eq('status', statusFilter);
    }

    query.then(({ data }) => {
      if (data) setSessions(data as SessionSummary[]);
      setLoading(false);
    });
  }, [statusFilter]);

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => router.push('/')} className="text-sm text-bark-500 flex items-center gap-1">
        &lsaquo; 홈으로
      </button>

      <div className="flex items-center gap-2">
        <span className="text-2xl">📊</span>
        <h1 className="text-xl font-bold text-bark-800">청소 이력</h1>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'all', label: '전체' },
          { value: 'in_progress', label: '진행중' },
          { value: 'completed', label: '검수대기' },
          { value: 'reviewed', label: '승인' },
          { value: 'rejected', label: '반려' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setLoading(true); }}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
              ${statusFilter === f.value
                ? 'bg-moss-600 text-white'
                : 'bg-bark-100 text-bark-600 hover:bg-bark-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Session List */}
      {loading ? (
        <div className="text-center py-8 text-bark-400 animate-pulse">로딩 중...</div>
      ) : sessions.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-bark-500">기록이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const status = STATUS_LABELS[s.status] || STATUS_LABELS.in_progress;
            return (
              <button
                key={s.id}
                onClick={() => router.push(`/review/${s.id}`)}
                className="card w-full text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-bark-800">{s.cleaner_name}</p>
                    <p className="text-xs text-bark-500">{s.session_date}</p>
                    <div className="flex gap-3 text-xs text-bark-500">
                      <span>체크 {s.tasks_done}/{s.tasks_total}</span>
                      <span>📷 {s.photo_count}</span>
                      <span>🎬 {s.video_count}</span>
                    </div>
                  </div>
                  <span className={status.class}>{status.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
