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

type ViewMode = 'date' | 'month' | 'year' | 'person';

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('cleaning_sessions')
      .select('*')
      .order('session_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setSessions((data || []) as Session[]);
        setLoading(false);
      });
  }, []);

  // 필터 적용
  const filtered = sessions.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  // 유틸
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0'];
    return `${d.getMonth() + 1}\uC6D4 ${d.getDate()}\uC77C (${days[d.getDay()]})`;
  };

  const getMonth = (dateStr: string) => dateStr.slice(0, 7); // 2026-03
  const getYear = (dateStr: string) => dateStr.slice(0, 4); // 2026

  const formatMonth = (ym: string) => {
    const [y, m] = ym.split('-');
    return `${y}\uB144 ${parseInt(m)}\uC6D4`;
  };

  const getZoneNames = (zoneIds: string[] | null): string => {
    if (!zoneIds) return `\uC804\uCCB4 ${ZONES.length}\uAD6C\uC5ED`;
    return zoneIds.map(id => ZONES.find(z => z.id === id)).filter(Boolean).map(z => z!.name).join(', ');
  };

  const allDates = Array.from(new Set(sessions.map(s => s.session_date))).sort();
  const dateToRound: Record<string, number> = {};
  allDates.forEach((date, i) => { dateToRound[date] = i + 1; });

  const cleanerNames = Array.from(new Set(sessions.map(s => s.cleaner_name)));

  // 날짜별 그룹
  const groupByDate = () => {
    const grouped: Record<string, Session[]> = {};
    filtered.forEach(s => {
      if (!grouped[s.session_date]) grouped[s.session_date] = [];
      grouped[s.session_date].push(s);
    });
    return grouped;
  };

  // 월별 그룹
  const groupByMonth = () => {
    const grouped: Record<string, Session[]> = {};
    filtered.forEach(s => {
      const m = getMonth(s.session_date);
      if (!grouped[m]) grouped[m] = [];
      grouped[m].push(s);
    });
    return grouped;
  };

  // 연도별 그룹
  const groupByYear = () => {
    const grouped: Record<string, Session[]> = {};
    filtered.forEach(s => {
      const y = getYear(s.session_date);
      if (!grouped[y]) grouped[y] = [];
      grouped[y].push(s);
    });
    return grouped;
  };

  // 사람별 그룹
  const groupByPerson = () => {
    const grouped: Record<string, Session[]> = {};
    filtered.forEach(s => {
      if (!grouped[s.cleaner_name]) grouped[s.cleaner_name] = [];
      grouped[s.cleaner_name].push(s);
    });
    return grouped;
  };

  // 통계
  const getStats = (list: Session[]) => {
    const total = list.length;
    const done = list.filter(s => s.status === 'reviewed').length;
    const rejected = list.filter(s => s.status === 'rejected').length;
    return { total, done, rejected };
  };

  // 세션 카드
  const SessionCard = ({ session }: { session: Session }) => {
    const statusInfo = STATUS_MAP[session.status] || { label: session.status, class: 'badge' };
    return (
      <button
        onClick={() => router.push(`/review/${session.id}`)}
        className="w-full p-3 bg-white rounded-xl shadow-sm text-left hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold text-xs">
              {session.cleaner_name.slice(-1)}
            </div>
            <div>
              <p className="font-medium text-bark-800 text-sm">{session.cleaner_name}</p>
              <p className="text-[10px] text-bark-400">{getZoneNames(session.assigned_zones)}</p>
            </div>
          </div>
          <span className={statusInfo.class}>{statusInfo.label}</span>
        </div>
      </button>
    );
  };

  // 날짜별 뷰
  const renderDateView = () => {
    const grouped = groupByDate();
    return Object.entries(grouped).map(([date, list]) => (
      <div key={date}>
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-bold text-white bg-moss-600 rounded-full px-2 py-0.5">
            {dateToRound[date]}{'\uD68C\uCC28'}
          </span>
          <span className="text-sm font-semibold text-bark-700">{formatDate(date)}</span>
          <span className="text-xs text-bark-400">{list.length}{'\uAC74'}</span>
        </div>
        <div className="space-y-1.5">{list.map(s => <SessionCard key={s.id} session={s} />)}</div>
      </div>
    ));
  };

  // 월별 뷰
  const renderMonthView = () => {
    const grouped = groupByMonth();
    if (selectedMonth) {
      const list = grouped[selectedMonth] || [];
      // 선택된 월 안에서 날짜별 그룹
      const byDate: Record<string, Session[]> = {};
      list.forEach(s => {
        if (!byDate[s.session_date]) byDate[s.session_date] = [];
        byDate[s.session_date].push(s);
      });
      return (
        <>
          <button onClick={() => setSelectedMonth(null)} className="text-sm text-moss-600 mb-2">
            &lsaquo; {'\uC6D4\uBCC4 \uBAA9\uB85D'}
          </button>
          <h2 className="text-lg font-bold text-bark-800 mb-3">{formatMonth(selectedMonth)}</h2>
          {Object.entries(byDate).map(([date, dList]) => (
            <div key={date} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-bold text-white bg-moss-600 rounded-full px-2 py-0.5">
                  {dateToRound[date]}{'\uD68C\uCC28'}
                </span>
                <span className="text-sm font-semibold text-bark-700">{formatDate(date)}</span>
              </div>
              <div className="space-y-1.5">{dList.map(s => <SessionCard key={s.id} session={s} />)}</div>
            </div>
          ))}
        </>
      );
    }

    return Object.entries(grouped).map(([month, list]) => {
      const stats = getStats(list);
      const dates = new Set(list.map(s => s.session_date));
      return (
        <button
          key={month}
          onClick={() => setSelectedMonth(month)}
          className="w-full p-4 bg-white rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-bark-800">{formatMonth(month)}</p>
              <p className="text-xs text-bark-400">{dates.size}{'\uD68C\uCC28'} / {stats.total}{'\uAC74'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-moss-600">{'\uC644\uB8CC'} {stats.done}</p>
              {stats.rejected > 0 && <p className="text-xs text-red-500">{'\uBC18\uB824'} {stats.rejected}</p>}
            </div>
          </div>
        </button>
      );
    });
  };

  // 연도별 뷰
  const renderYearView = () => {
    const grouped = groupByYear();
    if (selectedYear) {
      const list = grouped[selectedYear] || [];
      const byMonth: Record<string, Session[]> = {};
      list.forEach(s => {
        const m = getMonth(s.session_date);
        if (!byMonth[m]) byMonth[m] = [];
        byMonth[m].push(s);
      });
      return (
        <>
          <button onClick={() => setSelectedYear(null)} className="text-sm text-moss-600 mb-2">
            &lsaquo; {'\uC5F0\uB3C4\uBCC4 \uBAA9\uB85D'}
          </button>
          <h2 className="text-lg font-bold text-bark-800 mb-3">{selectedYear}{'\uB144'}</h2>
          {Object.entries(byMonth).map(([month, mList]) => {
            const stats = getStats(mList);
            const dates = new Set(mList.map(s => s.session_date));
            return (
              <button
                key={month}
                onClick={() => { setViewMode('month'); setSelectedMonth(month); setSelectedYear(null); }}
                className="w-full p-4 bg-white rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow mb-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-bark-800">{formatMonth(month)}</p>
                    <p className="text-xs text-bark-400">{dates.size}{'\uD68C\uCC28'} / {stats.total}{'\uAC74'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-moss-600">{'\uC644\uB8CC'} {stats.done}</p>
                    {stats.rejected > 0 && <p className="text-xs text-red-500">{'\uBC18\uB824'} {stats.rejected}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </>
      );
    }

    return Object.entries(grouped).map(([year, list]) => {
      const stats = getStats(list);
      const months = new Set(list.map(s => getMonth(s.session_date)));
      const dates = new Set(list.map(s => s.session_date));
      return (
        <button
          key={year}
          onClick={() => setSelectedYear(year)}
          className="w-full p-4 bg-white rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-bark-800 text-lg">{year}{'\uB144'}</p>
              <p className="text-xs text-bark-400">{months.size}{'\uAC1C\uC6D4'} / {dates.size}{'\uD68C\uCC28'} / {stats.total}{'\uAC74'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-moss-600">{'\uC644\uB8CC'} {stats.done}</p>
              {stats.rejected > 0 && <p className="text-xs text-red-500">{'\uBC18\uB824'} {stats.rejected}</p>}
            </div>
          </div>
        </button>
      );
    });
  };

  // 사람별 뷰
  const renderPersonView = () => {
    const grouped = groupByPerson();
    if (selectedPerson) {
      const list = grouped[selectedPerson] || [];
      const byDate: Record<string, Session[]> = {};
      list.forEach(s => {
        if (!byDate[s.session_date]) byDate[s.session_date] = [];
        byDate[s.session_date].push(s);
      });
      const stats = getStats(list);
      return (
        <>
          <button onClick={() => setSelectedPerson(null)} className="text-sm text-moss-600 mb-2">
            &lsaquo; {'\uC0AC\uB78C\uBCC4 \uBAA9\uB85D'}
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold text-xl">
              {selectedPerson.slice(-1)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-bark-800">{selectedPerson}</h2>
              <p className="text-xs text-bark-400">
                {'\uCD1D'} {stats.total}{'\uAC74'} / {'\uC644\uB8CC'} {stats.done} / {'\uBC18\uB824'} {stats.rejected}
              </p>
            </div>
          </div>
          {Object.entries(byDate).map(([date, dList]) => (
            <div key={date} className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-bold text-white bg-moss-600 rounded-full px-2 py-0.5">
                  {dateToRound[date]}{'\uD68C\uCC28'}
                </span>
                <span className="text-sm font-semibold text-bark-700">{formatDate(date)}</span>
              </div>
              <div className="space-y-1.5">{dList.map(s => <SessionCard key={s.id} session={s} />)}</div>
            </div>
          ))}
        </>
      );
    }

    return Object.entries(grouped).map(([name, list]) => {
      const stats = getStats(list);
      const dates = new Set(list.map(s => s.session_date));
      return (
        <button
          key={name}
          onClick={() => setSelectedPerson(name)}
          className="w-full p-4 bg-white rounded-2xl shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold">
              {name.slice(-1)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-bark-800">{name}</p>
              <p className="text-xs text-bark-400">{dates.size}{'\uD68C\uCC28'} / {stats.total}{'\uAC74'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-moss-600">{'\uC644\uB8CC'} {stats.done}</p>
              {stats.rejected > 0 && <p className="text-xs text-red-500">{'\uBC18\uB824'} {stats.rejected}</p>}
            </div>
          </div>
        </button>
      );
    });
  };

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'date', label: '\uB0A0\uC9DC\uBCC4' },
    { value: 'month', label: '\uC6D4\uBCC4' },
    { value: 'year', label: '\uC5F0\uB3C4\uBCC4' },
    { value: 'person', label: '\uC0AC\uB78C\uBCC4' },
  ];

  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold text-bark-800">{'\uCCAD\uC18C \uC774\uB825'}</h1>

      {/* View Mode Tabs */}
      <div className="flex gap-1 bg-bark-100 rounded-xl p-1">
        {viewModes.map(m => (
          <button
            key={m.value}
            onClick={() => { setViewMode(m.value); setSelectedPerson(null); setSelectedMonth(null); setSelectedYear(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
              ${viewMode === m.value ? 'bg-white text-moss-700 shadow-sm' : 'text-bark-500'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { value: 'all', label: '\uC804\uCCB4' },
          { value: 'in_progress', label: '\uC9C4\uD589' },
          { value: 'completed', label: '\uB300\uAE30' },
          { value: 'reviewed', label: '\uC644\uB8CC' },
          { value: 'rejected', label: '\uBC18\uB824' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors
              ${filterStatus === f.value ? 'bg-moss-600 text-white' : 'bg-bark-100 text-bark-500'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-bark-400 px-1">
        {'\uCD1D'} {filtered.length}{'\uAC74'} / {cleanerNames.length}{'\uBA85'} / {allDates.length}{'\uD68C\uCC28'}
      </p>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8 text-bark-400 animate-pulse">{'\uB85C\uB529...'}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-bark-400 py-8">{'\uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'}</div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'date' && renderDateView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'year' && renderYearView()}
          {viewMode === 'person' && renderPersonView()}
        </div>
      )}
    </div>
  );
}
