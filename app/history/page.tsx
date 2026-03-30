'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ZONES } from '@/lib/zones';

interface Session {
  id: string;
  cleaner_name: string;
  session_date: string;
  status: string;
  assigned_zones: string[] | null;
  completed_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  in_progress: { label: '\uC9C4\uD589 \uC911', class: 'badge-progress' },
  completed: { label: '\uAC80\uC218 \uB300\uAE30', class: 'badge-complete' },
  reviewed: { label: '\uAC80\uC218 \uC644\uB8CC', class: 'badge-reviewed' },
  rejected: { label: '\uBC18\uB824', class: 'badge-rejected' },
};

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCleaner, setFilterCleaner] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [cleanerNames, setCleanerNames] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('cleaning_sessions')
        .select('*')
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200);

      const list = (data || []) as Session[];
      setSessions(list);
      setCleanerNames(Array.from(new Set(list.map(s => s.cleaner_name))));
      setDates(Array.from(new Set(list.map(s => s.session_date))).sort().reverse());
      setLoading(false);
    };
    load();
  }, []);

  const filtered = sessions.filter(s => {
    if (filterCleaner !== 'all' && s.cleaner_name !== filterCleaner) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterDate !== 'all' && s.session_date !== filterDate) return false;
    return true;
  });

  // 날짜별 그룹핑
  const grouped: Record<string, Session[]> = {};
  filtered.forEach(s => {
    if (!grouped[s.session_date]) grouped[s.session_date] = [];
    grouped[s.session_date].push(s);
  });

  // 전체 회차 계산 (오래된 순으로 번호 매김)
  const allDates = Array.from(new Set(sessions.map(s => s.session_date))).sort();
  const dateToRound: Record<string, number> = {};
  allDates.forEach((date, i) => { dateToRound[date] = i + 1; });

  const getZoneNames = (zoneIds: string[] | null): string => {
    if (!zoneIds) return `\uC804\uCCB4 ${ZONES.length}\uAD6C\uC5ED`;
    return zoneIds
      .map(id => ZONES.find(z => z.id === id))
      .filter(Boolean)
      .map(z => z!.name)
      .join(', ');
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0'];
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayName = days[d.getDay()];
    return `${month}\uC6D4 ${day}\uC77C (${dayName})`;
  };

  return (
    <div className="px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-bark-800">{'\uCCAD\uC18C \uC774\uB825'}</h1>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="flex-1 input-field text-sm !py-2"
          >
            <option value="all">{'\uB0A0\uC9DC \uC804\uCCB4'}</option>
            {dates.map(date => (
              <option key={date} value={date}>{formatDate(date)}</option>
            ))}
          </select>
        </div>
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
      </div>

      <p className="text-xs text-bark-400 px-1">{'\uCD1D'} {filtered.length}{'\uAC74'} / {allDates.length}{'\uD68C\uCC28'}</p>

      {loading ? (
        <div className="text-center py-8 text-bark-400 animate-pulse">{'\uB85C\uB529...'}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card text-center text-bark-400 py-8">{'\uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'}</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateSessions]) => {
            const round = dateToRound[date];
            return (
              <div key={date}>
                {/* 날짜 헤더 */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-bold text-white bg-moss-600 rounded-full px-2 py-0.5">
                    {round}{'\uD68C\uCC28'}
                  </span>
                  <span className="text-sm font-semibold text-bark-700">{formatDate(date)}</span>
                  <span className="text-xs text-bark-400">{dateSessions.length}{'\uAC74'}</span>
                </div>

                {/* 해당 날짜 세션들 */}
                <div className="space-y-2">
                  {dateSessions.map(session => {
                    const statusInfo = STATUS_MAP[session.status] || { label: session.status, class: 'badge' };
                    return (
                      <button
                        key={session.id}
                        onClick={() => router.push(`/review/${session.id}`)}
                        className="w-full p-4 bg-white rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold text-sm">
                              {session.cleaner_name.slice(-1)}
                            </div>
                            <div>
                              <p className="font-semibold text-bark-800 text-sm">{session.cleaner_name}</p>
                              <p className="text-[11px] text-bark-400">
                                {getZoneNames(session.assigned_zones)}
                              </p>
                            </div>
                          </div>
                          <span className={statusInfo.class}>{statusInfo.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
