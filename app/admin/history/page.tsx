'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface Session {
  id: string;
  cleaner_name: string;
  session_date: string;
  status: string;
  assigned_zones: string[] | null;
  completed_at: string | null;
  reviewed_at: string | null;
  reviewer_name: string | null;
  review_notes: string | null;
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  in_progress: { label: '\uC9C4\uD589 \uC911', class: 'badge-progress' },
  completed: { label: '\uAC80\uC218 \uB300\uAE30', class: 'badge-complete' },
  reviewed: { label: '\uAC80\uC218 \uC644\uB8CC', class: 'badge-reviewed' },
  rejected: { label: '\uBC18\uB824', class: 'badge-rejected' },
};

export default function AdminHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCleaner, setFilterCleaner] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cleanerNames, setCleanerNames] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('cleaning_sessions')
        .select('*')
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);

      const list = (data || []) as Session[];
      setSessions(list);
      setCleanerNames(Array.from(new Set(list.map(s => s.cleaner_name))));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = sessions.filter(s => {
    if (filterCleaner !== 'all' && s.cleaner_name !== filterCleaner) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const handleDelete = async (session: Session) => {
    if (!confirm(`${session.cleaner_name} (${session.session_date}) \uC138\uC158\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;

    // Delete child records first, then session
    await supabase.from('cleaning_media').delete().eq('session_id', session.id);
    await supabase.from('cleaning_checks').delete().eq('session_id', session.id);
    await supabase.from('cleaning_sessions').delete().eq('id', session.id);

    setSessions(prev => prev.filter(s => s.id !== session.id));
  };

  return (
    <div className="px-4 py-6 space-y-5">
      <button onClick={() => router.push('/admin')} className="text-sm text-bark-500">
        &lsaquo; {'\uAD00\uB9AC\uC790'}
      </button>

      <h1 className="text-xl font-bold text-bark-800">{'\uC774\uB825 \uAD00\uB9AC'}</h1>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={filterCleaner}
          onChange={e => setFilterCleaner(e.target.value)}
          className="flex-1 input-field text-sm !py-2"
        >
          <option value="all">{'\uCCAD\uC18C\uC790 \uC804\uCCB4'}</option>
          {cleanerNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="flex-1 input-field text-sm !py-2"
        >
          <option value="all">{'\uC0C1\uD0DC \uC804\uCCB4'}</option>
          <option value="in_progress">{'\uC9C4\uD589 \uC911'}</option>
          <option value="completed">{'\uAC80\uC218 \uB300\uAE30'}</option>
          <option value="reviewed">{'\uAC80\uC218 \uC644\uB8CC'}</option>
          <option value="rejected">{'\uBC18\uB824'}</option>
        </select>
      </div>

      {/* Results */}
      <p className="text-xs text-bark-400 px-1">{filtered.length}{'\uAC74'}</p>

      {loading ? (
        <div className="card text-center text-bark-400 animate-pulse">{'\uB85C\uB529...'}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-bark-400">{'\uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4'}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(session => {
            const statusInfo = STATUS_MAP[session.status] || { label: session.status, class: 'badge' };
            return (
              <div key={session.id} className="p-4 bg-white rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold text-sm">
                      {session.cleaner_name.slice(-1)}
                    </div>
                    <div>
                      <p className="font-semibold text-bark-800 text-sm">{session.cleaner_name}</p>
                      <p className="text-xs text-bark-400">{session.session_date}</p>
                    </div>
                  </div>
                  <span className={statusInfo.class}>{statusInfo.label}</span>
                </div>

                {session.assigned_zones && (
                  <p className="text-xs text-bark-400">
                    {'\uBC30\uC815 \uAD6C\uC5ED'}: {session.assigned_zones.length}{'\uAC1C'}
                  </p>
                )}

                {session.reviewer_name && (
                  <p className="text-xs text-bark-500">
                    {'\uAC80\uC218'}: {session.reviewer_name}
                    {session.review_notes && ` - ${session.review_notes}`}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  {session.status === 'completed' && (
                    <button
                      onClick={() => router.push(`/review/${session.id}`)}
                      className="text-xs text-moss-600 font-medium hover:underline"
                    >
                      {'\uAC80\uC218\uD558\uAE30'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(session)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    {'\uC0AD\uC81C'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
