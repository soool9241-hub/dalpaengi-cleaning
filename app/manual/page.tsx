'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ZONES } from '@/lib/zones';
import type { CleaningManual } from '@/lib/types';
import ManualVideo from '@/components/ManualVideo';

export default function ManualPage() {
  const router = useRouter();
  const [manuals, setManuals] = useState<CleaningManual[]>([]);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('cleaning_manuals')
      .select('*')
      .then(({ data }) => {
        if (data) setManuals(data as CleaningManual[]);
      });
  }, []);

  const handleSave = async (zoneId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/manual/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId, videoUrl: editUrl.trim() }),
      });
      if (!res.ok) throw new Error();

      setManuals(prev => prev.map(m =>
        m.zone_id === zoneId ? { ...m, video_url: editUrl.trim() || null } : m
      ));
      setEditingZone(null);
      setEditUrl('');
    } catch {
      alert('저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-8">
      <button onClick={() => router.push('/')} className="text-sm text-bark-500 flex items-center gap-1">
        &lsaquo; 홈으로
      </button>

      <div className="flex items-center gap-2">
        <span className="text-2xl">🎬</span>
        <h1 className="text-xl font-bold text-bark-800">매뉴얼 영상 관리</h1>
      </div>

      <p className="text-sm text-bark-500">
        각 구역의 매뉴얼 영상 URL을 등록/수정합니다. YouTube, Google Drive 링크를 지원합니다.
      </p>

      <div className="space-y-4">
        {ZONES.map(zone => {
          const manual = manuals.find(m => m.zone_id === zone.id);
          const isEditing = editingZone === zone.id;

          return (
            <div key={zone.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{zone.icon}</span>
                  <h3 className="font-semibold text-bark-800">{zone.name}</h3>
                </div>
                <button
                  onClick={() => {
                    if (isEditing) {
                      setEditingZone(null);
                    } else {
                      setEditingZone(zone.id);
                      setEditUrl(manual?.video_url || '');
                    }
                  }}
                  className="text-sm text-moss-600 font-medium"
                >
                  {isEditing ? '취소' : '수정'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="YouTube 또는 Google Drive URL"
                    className="input-field text-sm"
                  />
                  <button
                    onClick={() => handleSave(zone.id)}
                    disabled={saving}
                    className="btn-primary w-full text-sm !py-2"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              ) : (
                <>
                  {manual?.video_url ? (
                    <ManualVideo videoUrl={manual.video_url} zoneName={zone.name} />
                  ) : (
                    <p className="text-sm text-bark-400">영상 미등록</p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
