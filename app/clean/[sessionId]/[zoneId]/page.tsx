'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ZONES } from '@/lib/zones';
import type { CleaningCheck, CleaningMedia, CleaningManual } from '@/lib/types';
import TaskItem from '@/components/TaskItem';
import MediaUploader from '@/components/MediaUploader';
import MediaGrid from '@/components/MediaGrid';
import ManualVideo from '@/components/ManualVideo';
import ProgressBar from '@/components/ProgressBar';

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const zoneId = params.zoneId as string;

  const zone = ZONES.find(z => z.id === zoneId);

  const [checks, setChecks] = useState<CleaningCheck[]>([]);
  const [mediaList, setMediaList] = useState<CleaningMedia[]>([]);
  const [manual, setManual] = useState<CleaningManual | null>(null);
  const [showManual, setShowManual] = useState(false);

  const loadData = useCallback(async () => {
    const [checksRes, mediaRes, manualRes] = await Promise.all([
      supabase
        .from('cleaning_checks')
        .select('*')
        .eq('session_id', sessionId)
        .eq('zone_id', zoneId)
        .order('task_index'),
      supabase
        .from('cleaning_media')
        .select('*')
        .eq('session_id', sessionId)
        .eq('zone_id', zoneId)
        .order('uploaded_at'),
      supabase
        .from('cleaning_manuals')
        .select('*')
        .eq('zone_id', zoneId)
        .single(),
    ]);
    if (checksRes.data) setChecks(checksRes.data as CleaningCheck[]);
    if (mediaRes.data) setMediaList(mediaRes.data as CleaningMedia[]);
    if (manualRes.data) setManual(manualRes.data as CleaningManual);
  }, [sessionId, zoneId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (taskIndex: number, isChecked: boolean) => {
    // Optimistic update
    setChecks(prev => prev.map(c =>
      c.task_index === taskIndex ? { ...c, is_checked: isChecked } : c
    ));

    await fetch('/api/check/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, zoneId, taskIndex, isChecked }),
    });
  };

  const handleMediaUpload = (media: CleaningMedia) => {
    setMediaList(prev => [...prev, media]);
  };

  const handleMediaDelete = (deleted: CleaningMedia) => {
    setMediaList(prev => prev.filter(m => m.id !== deleted.id));
  };

  if (!zone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-bark-500">구역을 찾을 수 없습니다</p>
      </div>
    );
  }

  const checkedCount = checks.filter(c => c.is_checked).length;
  const totalMedia = mediaList.length;
  const hasEnoughMedia = totalMedia >= zone.minPhotos;

  return (
    <div className="px-4 py-4 space-y-4 pb-8">
      {/* Header */}
      <button onClick={() => router.back()} className="text-sm text-bark-500 flex items-center gap-1">
        &lsaquo; 구역 목록으로
      </button>

      <div className="flex items-center gap-3">
        <span className="text-4xl">{zone.icon}</span>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-bark-800">{zone.name}</h1>
          <p className="text-xs text-bark-500">
            {zone.categoryLabel} | ~{zone.estimatedMinutes}분
          </p>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar
        current={checkedCount}
        total={checks.length}
        label="체크리스트"
        color={checkedCount === checks.length ? 'moss' : 'orange'}
      />

      {/* Manual Video Toggle */}
      <button
        onClick={() => setShowManual(!showManual)}
        className="w-full card flex items-center justify-between hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <span className="text-sm font-medium text-bark-700">매뉴얼 영상 보기</span>
        </div>
        <span className="text-bark-400 text-sm">{showManual ? '접기 ▲' : '펼치기 ▼'}</span>
      </button>

      {showManual && (
        <ManualVideo videoUrl={manual?.video_url || null} zoneName={zone.name} />
      )}

      {/* Checklist */}
      <div>
        <h2 className="text-sm font-semibold text-bark-600 mb-2 px-1">
          체크리스트 ({checkedCount}/{checks.length})
        </h2>
        <div className="space-y-1">
          {checks.map((check) => (
            <TaskItem
              key={check.id}
              sessionId={sessionId}
              zoneId={zoneId}
              taskIndex={check.task_index}
              taskText={check.task_text}
              isChecked={check.is_checked}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>

      {/* Media Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-bark-600 px-1">
          사진/영상 인증
          <span className={`ml-2 ${hasEnoughMedia ? 'text-moss-600' : 'text-orange-500'}`}>
            ({totalMedia}/{zone.minPhotos} {hasEnoughMedia ? '충족' : '필요'})
          </span>
        </h2>

        <MediaUploader
          sessionId={sessionId}
          zoneId={zoneId}
          photoHint={zone.photoHint}
          onUpload={handleMediaUpload}
        />

        <MediaGrid
          mediaList={mediaList}
          onDelete={handleMediaDelete}
        />
      </div>

      {/* Zone Complete Status */}
      {checkedCount === checks.length && hasEnoughMedia && (
        <div className="bg-moss-50 border border-moss-200 rounded-xl p-4 text-center">
          <span className="text-moss-700 font-semibold">이 구역 청소 완료!</span>
        </div>
      )}
    </div>
  );
}
