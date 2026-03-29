'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZONES } from '@/lib/zones';
import FloorPlan from '@/components/FloorPlan';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
}

// Cleaner별 고유 색상
const CLEANER_COLORS = [
  { bg: 'bg-moss-200 border-moss-500 text-moss-800', badge: 'bg-moss-600' },
  { bg: 'bg-blue-200 border-blue-500 text-blue-800', badge: 'bg-blue-600' },
  { bg: 'bg-orange-200 border-orange-500 text-orange-800', badge: 'bg-orange-600' },
  { bg: 'bg-purple-200 border-purple-500 text-purple-800', badge: 'bg-purple-600' },
  { bg: 'bg-pink-200 border-pink-500 text-pink-800', badge: 'bg-pink-600' },
];

export default function AssignPage() {
  const router = useRouter();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  // assignments: { zoneId: cleanerId }
  const [selectedCleaner, setSelectedCleaner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/cleaners')
      .then(res => res.json())
      .then(data => {
        const list = data.cleaners || [];
        setCleaners(list);
        if (list.length > 0) setSelectedCleaner(list[0].id);

        // 저장된 배정 불러오기
        try {
          const saved = localStorage.getItem('zone_assignments');
          if (saved) {
            const parsed = JSON.parse(saved) as Record<string, string>;
            // 유효한 청소자만 필터 (삭제된 청소자 제외)
            const validIds = new Set(list.map((c: Cleaner) => c.id));
            const filtered: Record<string, string> = {};
            for (const [zoneId, cleanerId] of Object.entries(parsed)) {
              if (validIds.has(cleanerId)) filtered[zoneId] = cleanerId;
            }
            setAssignments(filtered);
          }
        } catch { /* ignore */ }

        setLoading(false);
      });
  }, []);

  const getCleanerIndex = (cleanerId: string) =>
    cleaners.findIndex(c => c.id === cleanerId);

  const handleZoneClick = (zoneId: string) => {
    if (!selectedCleaner) return;

    setAssignments(prev => {
      const current = prev[zoneId];
      // 같은 청소자면 해제, 다르면 재배정
      if (current === selectedCleaner) {
        const next = { ...prev };
        delete next[zoneId];
        return next;
      }
      return { ...prev, [zoneId]: selectedCleaner };
    });
  };

  const getZoneColor = (zoneId: string): string => {
    const assignedTo = assignments[zoneId];
    if (!assignedTo) return 'bg-bark-50 border-bark-200 text-bark-500';
    const idx = getCleanerIndex(assignedTo) % CLEANER_COLORS.length;
    return CLEANER_COLORS[idx].bg;
  };

  const getZoneLabel = (zoneId: string): string | null => {
    const assignedTo = assignments[zoneId];
    if (!assignedTo) return null;
    const cleaner = cleaners.find(c => c.id === assignedTo);
    return cleaner ? cleaner.name.slice(-1) : null;
  };

  const assignAll = (cleanerId: string) => {
    const newAssign: Record<string, string> = {};
    ZONES.forEach(z => { newAssign[z.id] = cleanerId; });
    setAssignments(newAssign);
  };

  const clearAll = () => setAssignments({});

  const distributeEvenly = () => {
    const newAssign: Record<string, string> = {};
    const zoneIds = ZONES.map(z => z.id);
    zoneIds.forEach((zoneId, i) => {
      const cleanerIdx = i % cleaners.length;
      newAssign[zoneId] = cleaners[cleanerIdx].id;
    });
    setAssignments(newAssign);
  };

  const totalAssigned = Object.keys(assignments).length;

  // 청소자별 배정 수
  const perCleaner = cleaners.map(c => ({
    ...c,
    count: Object.values(assignments).filter(v => v === c.id).length,
  }));

  const handleSubmit = async () => {
    if (totalAssigned === 0) {
      alert('\uCD5C\uC18C 1\uAC1C \uAD6C\uC5ED\uC744 \uBC30\uC815\uD574\uC8FC\uC138\uC694');
      return;
    }

    if (totalAssigned < ZONES.length) {
      if (!confirm(`${ZONES.length - totalAssigned}\uAC1C \uAD6C\uC5ED\uC774 \uBBF8\uBC30\uC815\uC785\uB2C8\uB2E4. \uACC4\uC18D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;
    }

    // Group by cleaner
    const grouped: Record<string, string[]> = {};
    for (const [zoneId, cleanerId] of Object.entries(assignments)) {
      if (!grouped[cleanerId]) grouped[cleanerId] = [];
      grouped[cleanerId].push(zoneId);
    }

    const assignmentList = Object.entries(grouped).map(([cleanerId, zoneIds]) => {
      const cleaner = cleaners.find(c => c.id === cleanerId)!;
      return {
        cleanerId,
        cleanerName: cleaner.name,
        cleanerPhone: cleaner.phone,
        zoneIds,
      };
    });

    setSubmitting(true);
    try {
      // 배정 패턴 저장
      localStorage.setItem('zone_assignments', JSON.stringify(assignments));

      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: assignmentList }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(`\uBC30\uC815 \uC2E4\uD328: ${e instanceof Error ? e.message : '\uC54C \uC218 \uC5C6\uB294 \uC624\uB958'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-bark-500">{'\uB85C\uB529...'}</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5 pb-36">
      <button onClick={() => router.push('/admin')} className="text-sm text-bark-500">
        &lsaquo; {'\uAD00\uB9AC\uC790'}
      </button>

      <div>
        <h1 className="text-xl font-bold text-bark-800">{'\uCCAD\uC18C \uBC30\uC815'}</h1>
        <p className="text-sm text-bark-400">{'\uCCAD\uC18C\uC790\uB97C \uC120\uD0DD\uD558\uACE0 \uAD6C\uC5ED\uC744 \uD130\uCE58\uD558\uC138\uC694'}</p>
      </div>

      {/* Cleaner Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cleaners.map((cleaner, idx) => {
          const colorIdx = idx % CLEANER_COLORS.length;
          const isSelected = selectedCleaner === cleaner.id;
          const count = perCleaner[idx].count;
          return (
            <button
              key={cleaner.id}
              onClick={() => setSelectedCleaner(cleaner.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all
                ${isSelected
                  ? `${CLEANER_COLORS[colorIdx].bg} shadow-md scale-105`
                  : 'bg-white border-bark-200 text-bark-600'
                }`}
            >
              <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center ${CLEANER_COLORS[colorIdx].badge}`}>
                {cleaner.name.slice(-1)}
              </span>
              <span className="text-sm font-semibold">{cleaner.name}</span>
              {count > 0 && (
                <span className="text-xs bg-white/80 rounded-full px-1.5 py-0.5 font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={distributeEvenly}
          className="flex-1 text-[11px] py-1.5 bg-moss-100 text-moss-700 rounded-lg hover:bg-moss-200 font-semibold min-w-[80px]"
        >
          {'\uADE0\uB4F1 \uBD84\uBC30'}
        </button>
        {cleaners.map(c => (
          <button
            key={c.id}
            onClick={() => assignAll(c.id)}
            className="flex-1 text-[11px] py-1.5 bg-bark-100 text-bark-500 rounded-lg hover:bg-bark-200 min-w-[60px]"
          >
            {c.name.slice(-1)} {'\uC804\uCCB4'}
          </button>
        ))}
        <button
          onClick={clearAll}
          className="px-3 text-[11px] py-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100"
        >
          {'\uCD08\uAE30\uD654'}
        </button>
      </div>

      {/* Floor Plan */}
      <div className="card">
        <h2 className="text-sm font-semibold text-bark-600 mb-3">{'\uD3C9\uBA74\uB3C4 \uBC30\uCE58'}</h2>
        <FloorPlan
          onZoneClick={handleZoneClick}
          getZoneColor={getZoneColor}
          getZoneLabel={getZoneLabel}
        />
      </div>

      {/* Summary & Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-bark-100 p-4 z-50">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-bark-500">
              {'\uBC30\uC815'}: {totalAssigned}/{ZONES.length}{'\uAD6C\uC5ED'}
            </span>
            <span className="text-bark-600 font-medium">
              {perCleaner
                .filter(c => c.count > 0)
                .map(c => `${c.name.slice(-1)}:${c.count}`)
                .join('  ')}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || totalAssigned === 0}
            className="btn-primary w-full"
          >
            {submitting ? '\uC800\uC7A5 \uC911...' : '\uC800\uC7A5\uD558\uAE30'}
          </button>
          {saved && (
            <p className="text-center text-xs text-moss-600 font-medium animate-pulse">{'\uC800\uC7A5 \uC644\uB8CC! \uCCAD\uC18C \uC5C5\uBB34\uAC00 \uBC30\uBD84\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
