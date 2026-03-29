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
        throw new Error(err.error || '\uC138\uC158 \uC0DD\uC131 \uC2E4\uD328');
      }

      const { session } = await res.json();
      router.push(`/clean/${session.id}`);
    } catch (e) {
      alert(`\uC138\uC158 \uC0DD\uC131 \uC2E4\uD328: ${e instanceof Error ? e.message : '\uC54C \uC218 \uC5C6\uB294 \uC624\uB958'}`);
    } finally {
      setLoading(false);
      setSelectedName('');
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

      {/* Cleaner Selection */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-bark-500 px-1">{'\uCCAD\uC18C\uC790 \uC120\uD0DD'}</h2>
        {CLEANERS.map((cleaner) => (
          <button
            key={cleaner.phone}
            onClick={() => handleStart(cleaner)}
            disabled={loading}
            className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white border-2 transition-all shadow-sm
              ${loading && selectedName === cleaner.name
                ? 'border-moss-500 bg-moss-50'
                : 'border-transparent hover:border-moss-300'
              }
              ${loading && selectedName !== cleaner.name ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold text-lg">
                {cleaner.name[0]}
              </div>
              <div className="text-left">
                <p className="font-semibold text-bark-800">{cleaner.name}</p>
                <p className="text-xs text-bark-400">{cleaner.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</p>
              </div>
            </div>
            {loading && selectedName === cleaner.name ? (
              <span className="text-sm text-moss-600 animate-pulse">{'\uC2DC\uC791 \uC911...'}</span>
            ) : (
              <span className="text-moss-600 text-xl">&rsaquo;</span>
            )}
          </button>
        ))}
      </div>

      {/* Resume Sessions */}
      {resumeSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-bark-500 px-1">{'\uC9C4\uD589 \uC911\uC778 \uCCAD\uC18C'}</h2>
          {resumeSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => router.push(`/clean/${session.id}`)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
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
    </div>
  );
}
