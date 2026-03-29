'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { CleaningSession } from '@/lib/types';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [resumeSessions, setResumeSessions] = useState<CleaningSession[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cleanersRes, sessionsRes] = await Promise.all([
        fetch('/api/cleaners').then(r => r.json()),
        supabase
          .from('cleaning_sessions')
          .select('*')
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      setCleaners(cleanersRes.cleaners || []);
      if (sessionsRes.data) setResumeSessions(sessionsRes.data as CleaningSession[]);
      setLoadingData(false);
    };
    load();
  }, []);

  const handleStart = async (cleaner: Cleaner) => {
    setLoading(true);
    setSelectedId(cleaner.id);
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
        throw new Error(err.error || '\uC138\uC158 \uC0DD\uC131 \uC2E4\uD328');
      }

      const { session } = await res.json();
      router.push(`/clean/${session.id}`);
    } catch (e) {
      alert(`\uC138\uC158 \uC0DD\uC131 \uC2E4\uD328: ${e instanceof Error ? e.message : '\uC54C \uC218 \uC5C6\uB294 \uC624\uB958'}`);
    } finally {
      setLoading(false);
      setSelectedId('');
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 pt-6">
        <div className="text-5xl">{'\uD83D\uDC0C'}</div>
        <h1 className="text-xl font-bold text-bark-800">{'\uB2EC\uD399\uC774\uC544\uC9C0\uD2B8'}</h1>
        <p className="text-sm text-bark-400">{'\uCCAD\uC18C \uAD00\uB9AC \uC2DC\uC2A4\uD15C'}</p>
      </div>

      {/* Resume Sessions */}
      {resumeSessions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-bark-500 px-1">{'\uC9C4\uD589 \uC911\uC778 \uCCAD\uC18C'}</h2>
          {resumeSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => router.push(`/clean/${session.id}`)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  {session.cleaner_name[0]}
                </div>
                <div className="text-left">
                  <p className="font-medium text-bark-800">{session.cleaner_name}</p>
                  <p className="text-xs text-bark-400">{session.session_date}</p>
                </div>
              </div>
              <span className="badge-progress">{'\uC774\uC5B4\uD558\uAE30'} &rsaquo;</span>
            </button>
          ))}
        </div>
      )}

      {/* Cleaner Selection - New Session */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-bark-500 px-1">{'\uC0C8 \uCCAD\uC18C \uC2DC\uC791'}</h2>
        {loadingData ? (
          <div className="p-8 text-center text-bark-400 animate-pulse">{'\uB85C\uB529...'}</div>
        ) : cleaners.length === 0 ? (
          <div className="card text-center text-bark-400 space-y-2">
            <p>{'\uB4F1\uB85D\uB41C \uCCAD\uC18C\uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4'}</p>
            <button
              onClick={() => router.push('/admin/cleaners')}
              className="text-sm text-moss-600 underline"
            >
              {'\uCCAD\uC18C\uC790 \uB4F1\uB85D\uD558\uAE30'}
            </button>
          </div>
        ) : (
          cleaners.map((cleaner) => (
            <button
              key={cleaner.id}
              onClick={() => handleStart(cleaner)}
              disabled={loading}
              className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white border-2 transition-all shadow-sm
                ${loading && selectedId === cleaner.id
                  ? 'border-moss-500 bg-moss-50'
                  : 'border-transparent hover:border-moss-300'
                }
                ${loading && selectedId !== cleaner.id ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold">
                  {cleaner.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-bark-800">{cleaner.name}</p>
                  <p className="text-xs text-bark-400">{cleaner.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</p>
                </div>
              </div>
              {loading && selectedId === cleaner.id ? (
                <span className="text-sm text-moss-600 animate-pulse">{'\uC2DC\uC791 \uC911...'}</span>
              ) : (
                <span className="text-moss-600 text-xl">&rsaquo;</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
