'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZONES, INTERIOR_ZONES, EXTERIOR_ZONES } from '@/lib/zones';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
}

interface Assignment {
  cleanerId: string;
  cleanerName: string;
  cleanerPhone: string;
  zoneIds: string[];
}

export default function AssignPage() {
  const router = useRouter();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/cleaners')
      .then(res => res.json())
      .then(data => {
        setCleaners(data.cleaners || []);
        setLoading(false);
      });
  }, []);

  const toggleZone = (cleanerId: string, zoneId: string) => {
    setAssignments(prev => {
      const current = prev[cleanerId] || [];
      const exists = current.includes(zoneId);

      // Remove this zone from all other cleaners first
      const updated = { ...prev };
      for (const cid of Object.keys(updated)) {
        if (cid !== cleanerId) {
          updated[cid] = updated[cid].filter(z => z !== zoneId);
        }
      }

      // Toggle for this cleaner
      updated[cleanerId] = exists
        ? current.filter(z => z !== zoneId)
        : [...current, zoneId];

      return updated;
    });
  };

  const getZoneAssignee = (zoneId: string): string | null => {
    for (const [cleanerId, zones] of Object.entries(assignments)) {
      if (zones.includes(zoneId)) return cleanerId;
    }
    return null;
  };

  const assignAll = (cleanerId: string) => {
    const allZoneIds = ZONES.map(z => z.id);
    // Clear all others, assign all to this cleaner
    const updated: Record<string, string[]> = {};
    updated[cleanerId] = allZoneIds;
    setAssignments(updated);
  };

  const totalAssigned = Object.values(assignments).reduce((sum, zones) => sum + zones.length, 0);

  const handleSubmit = async () => {
    const assignmentList: Assignment[] = [];
    for (const cleaner of cleaners) {
      const zones = assignments[cleaner.id];
      if (zones && zones.length > 0) {
        assignmentList.push({
          cleanerId: cleaner.id,
          cleanerName: cleaner.name,
          cleanerPhone: cleaner.phone,
          zoneIds: zones,
        });
      }
    }

    if (assignmentList.length === 0) {
      alert('\uCD5C\uC18C 1\uBA85\uC5D0\uAC8C \uAD6C\uC5ED\uC744 \uBC30\uC815\uD574\uC8FC\uC138\uC694');
      return;
    }

    if (totalAssigned < ZONES.length) {
      if (!confirm(`${ZONES.length - totalAssigned}\uAC1C \uAD6C\uC5ED\uC774 \uBBF8\uBC30\uC815\uC785\uB2C8\uB2E4. \uACC4\uC18D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: assignmentList }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const summary = data.results
        .map((r: { cleanerName: string; zoneCount: number }) => `${r.cleanerName}: ${r.zoneCount}\uAD6C\uC5ED`)
        .join('\n');
      alert(`\uBC30\uC815 \uC644\uB8CC!\n${summary}`);
      router.push('/admin');
    } catch (e) {
      alert(`\uBC30\uC815 \uC2E4\uD328: ${e instanceof Error ? e.message : '\uC54C \uC218 \uC5C6\uB294 \uC624\uB958'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderZoneList = (zones: typeof ZONES, label: string) => (
    <div>
      <h3 className="text-xs font-semibold text-bark-500 mb-2 px-1">{label}</h3>
      <div className="space-y-1">
        {zones.map(zone => {
          const assignee = getZoneAssignee(zone.id);
          const assignedCleaner = cleaners.find(c => c.id === assignee);
          return (
            <div key={zone.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
              <div className="flex items-center gap-2">
                <span>{zone.icon}</span>
                <span className="text-sm font-medium text-bark-800">{zone.name}</span>
              </div>
              <div className="flex gap-1">
                {cleaners.map(cleaner => {
                  const isAssigned = assignee === cleaner.id;
                  return (
                    <button
                      key={cleaner.id}
                      onClick={() => toggleZone(cleaner.id, zone.id)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all
                        ${isAssigned
                          ? 'bg-moss-600 text-white shadow-md'
                          : 'bg-bark-100 text-bark-400 hover:bg-bark-200'
                        }`}
                    >
                      {cleaner.name.slice(-1)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-bark-500">{'\uB85C\uB529...'}</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5 pb-28">
      <button onClick={() => router.push('/admin')} className="text-sm text-bark-500">
        &lsaquo; {'\uAD00\uB9AC\uC790'}
      </button>

      <div>
        <h1 className="text-xl font-bold text-bark-800">{'\uCCAD\uC18C \uBC30\uC815'}</h1>
        <p className="text-sm text-bark-400">{'\uAD6C\uC5ED\uBCC4\uB85C \uCCAD\uC18C\uC790\uB97C \uBC30\uC815\uD558\uC138\uC694'}</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-1">
        {cleaners.map(cleaner => (
          <div key={cleaner.id} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-moss-600 text-white text-xs font-bold flex items-center justify-center">
              {cleaner.name.slice(-1)}
            </div>
            <span className="text-sm text-bark-700">{cleaner.name}</span>
          </div>
        ))}
      </div>

      {/* Quick assign buttons */}
      <div className="flex gap-2">
        {cleaners.map(cleaner => (
          <button
            key={cleaner.id}
            onClick={() => assignAll(cleaner.id)}
            className="flex-1 text-xs py-2 px-3 bg-bark-100 text-bark-600 rounded-lg hover:bg-bark-200 transition-colors"
          >
            {cleaner.name} {'\uC804\uCCB4 \uBC30\uC815'}
          </button>
        ))}
      </div>

      {/* Zone Assignment Grid */}
      <div className="space-y-4">
        {renderZoneList(INTERIOR_ZONES, '\uD83C\uDFE0 \uB0B4\uBD80 (9\uAD6C\uC5ED)')}
        {renderZoneList(EXTERIOR_ZONES, '\uD83C\uDFD5\uFE0F \uC678\uBD80 (1\uAD6C\uC5ED)')}
      </div>

      {/* Summary & Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-bark-100 p-4">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex justify-between text-sm text-bark-600">
            <span>{'\uBC30\uC815\uB428'}: {totalAssigned}/{ZONES.length}{'\uAD6C\uC5ED'}</span>
            <span>
              {cleaners.map(c => {
                const count = (assignments[c.id] || []).length;
                return count > 0 ? `${c.name[0]}:${count}` : null;
              }).filter(Boolean).join(' / ')}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || totalAssigned === 0}
            className="btn-primary w-full"
          >
            {submitting ? '\uC0DD\uC131 \uC911...' : '\uCCAD\uC18C \uC138\uC158 \uC0DD\uC131'}
          </button>
        </div>
      </div>
    </div>
  );
}
