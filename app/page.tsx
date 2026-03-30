'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ZONES } from '@/lib/zones';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
}

interface Session {
  id: string;
  cleaner_name: string;
  cleaner_phone: string | null;
  session_date: string;
  status: string;
  assigned_zones: string[] | null;
}

export default function HomePage() {
  const router = useRouter();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cleanersRes, sessionsRes] = await Promise.all([
        fetch('/api/cleaners').then(r => r.json()),
        supabase
          .from('cleaning_sessions')
          .select('*')
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false }),
      ]);
      setCleaners(cleanersRes.cleaners || []);
      if (sessionsRes.data) setActiveSessions(sessionsRes.data as Session[]);
      setLoadingData(false);
    };
    load();
  }, []);

  // 청소자별 활성 세션 매칭
  const getCleanerSession = (cleaner: Cleaner): Session | null => {
    return activeSessions.find(s => s.cleaner_name === cleaner.name) || null;
  };

  // 배정 구역 이름 가져오기
  const getZoneNames = (zoneIds: string[] | null): string => {
    if (!zoneIds) return `\uC804\uCCB4 ${ZONES.length}\uAD6C\uC5ED`;
    return zoneIds
      .map(id => ZONES.find(z => z.id === id))
      .filter(Boolean)
      .map(z => z!.name)
      .join(', ');
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 pt-4">
        <div className="text-5xl">{'\uD83D\uDC0C'}</div>
        <h1 className="text-xl font-bold text-bark-800">{'\uB2EC\uD399\uC774\uC544\uC9C0\uD2B8'}</h1>
        <p className="text-sm text-bark-400">{'\uCCAD\uC18C \uAD00\uB9AC \uC2DC\uC2A4\uD15C'}</p>
      </div>

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
        <div className="space-y-3">
          {cleaners.map((cleaner) => {
            const session = getCleanerSession(cleaner);
            const hasAssignment = !!session;
            const zoneCount = session?.assigned_zones?.length || (session ? ZONES.length : 0);

            return (
              <div key={cleaner.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* 청소자 헤더 */}
                <div className="flex items-center gap-3 p-4 pb-2">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg
                    ${hasAssignment ? 'bg-moss-100 text-moss-700' : 'bg-bark-100 text-bark-400'}`}>
                    {cleaner.name.slice(-1)}
                  </div>
                  <div>
                    <p className="font-semibold text-bark-800">{cleaner.name}</p>
                    <p className="text-xs text-bark-400">
                      {cleaner.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                    </p>
                  </div>
                </div>

                {hasAssignment ? (
                  <>
                    {/* 배정된 구역 표시 */}
                    <div className="px-4 py-2">
                      <p className="text-xs text-bark-500 mb-1.5">
                        {'\uBC30\uC815 \uAD6C\uC5ED'} ({zoneCount}{'\uAC1C'})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(session.assigned_zones || ZONES.map(z => z.id)).map(zoneId => {
                          const zone = ZONES.find(z => z.id === zoneId);
                          if (!zone) return null;
                          return (
                            <span key={zoneId} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-moss-50 text-moss-700 rounded-full text-[11px]">
                              <span>{zone.icon}</span>
                              <span>{zone.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* 청소 시작/이어하기 버튼 */}
                    <div className="px-4 pb-4 pt-2">
                      <button
                        onClick={() => router.push(`/clean/${session.id}`)}
                        className="btn-primary w-full"
                      >
                        {'\uCCAD\uC18C \uC2DC\uC791\uD558\uAE30'} &rsaquo;
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-xs text-bark-400 text-center py-3">
                      {'\uBC30\uC815\uB41C \uAD6C\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
