'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ZONES } from '@/lib/zones';
import type { CleaningSession, CleaningCheck, CleaningMedia, ZoneProgress } from '@/lib/types';
import SessionHeader from '@/components/SessionHeader';
import ZoneCard from '@/components/ZoneCard';

export default function CleanSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<CleaningSession | null>(null);
  const [checks, setChecks] = useState<CleaningCheck[]>([]);
  const [media, setMedia] = useState<CleaningMedia[]>([]);
  const [completing, setCompleting] = useState(false);

  const loadData = useCallback(async () => {
    const [sessionRes, checksRes, mediaRes] = await Promise.all([
      supabase.from('cleaning_sessions').select('*').eq('id', sessionId).single(),
      supabase.from('cleaning_checks').select('*').eq('session_id', sessionId),
      supabase.from('cleaning_media').select('*').eq('session_id', sessionId),
    ]);
    if (sessionRes.data) setSession(sessionRes.data as CleaningSession);
    if (checksRes.data) setChecks(checksRes.data as CleaningCheck[]);
    if (mediaRes.data) setMedia(mediaRes.data as CleaningMedia[]);
  }, [sessionId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Refresh when navigating back
  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  const getZoneProgress = (zoneId: string): ZoneProgress => {
    const zone = ZONES.find(z => z.id === zoneId)!;
    const zoneChecks = checks.filter(c => c.zone_id === zoneId);
    const zoneMedia = media.filter(m => m.zone_id === zoneId);
    const checkedTasks = zoneChecks.filter(c => c.is_checked).length;
    const photoCount = zoneMedia.filter(m => m.media_type === 'photo').length;
    const videoCount = zoneMedia.filter(m => m.media_type === 'video').length;

    return {
      zoneId,
      totalTasks: zone.tasks.length,
      checkedTasks,
      photoCount,
      videoCount,
      isComplete: checkedTasks === zone.tasks.length && (photoCount + videoCount) >= zone.minPhotos,
    };
  };

  // Filter zones by assignment if applicable
  const assignedZoneIds = (session as unknown as Record<string, unknown>)?.assigned_zones as string[] | null;
  const activeZones = assignedZoneIds
    ? ZONES.filter(z => assignedZoneIds.includes(z.id))
    : ZONES;
  const activeInterior = activeZones.filter(z => z.category === 'interior');
  const activeExterior = activeZones.filter(z => z.category === 'exterior');
  const activeMinPhotos = activeZones.reduce((sum, z) => sum + z.minPhotos, 0);

  const totalChecked = checks.filter(c => c.is_checked).length;
  const totalTasks = checks.length;
  const totalMedia = media.length;
  const allZonesComplete = activeZones.every(z => getZoneProgress(z.id).isComplete);

  const handleComplete = async () => {
    if (!allZonesComplete) {
      alert('모든 구역의 체크리스트와 사진 인증을 완료해주세요.');
      return;
    }
    if (!confirm('청소를 완료하시겠습니까?\n운영자에게 검수 요청 SMS가 발송됩니다.')) return;

    setCompleting(true);
    try {
      const res = await fetch('/api/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error();
      alert('청소 완료! 운영자에게 검수 요청이 발송되었습니다.');
      router.push('/');
    } catch {
      alert('완료 처리 실패. 다시 시도해주세요.');
    } finally {
      setCompleting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-bark-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <button onClick={() => router.push('/')} className="text-sm text-bark-500 flex items-center gap-1">
        &lsaquo; 홈으로
      </button>

      <SessionHeader
        cleanerName={session.cleaner_name}
        totalTasks={totalTasks}
        checkedTasks={totalChecked}
        totalMedia={totalMedia}
        requiredMedia={activeMinPhotos}
      />

      {/* Interior Zones */}
      {activeInterior.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-bark-600 mb-2 px-1">{'\uD83D\uDCCB \uB0B4\uBD80'} ({activeInterior.length}{'\uAD6C\uC5ED'})</h2>
          <div className="space-y-2">
            {activeInterior.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                sessionId={sessionId}
                progress={getZoneProgress(zone.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Exterior Zones */}
      {activeExterior.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-bark-600 mb-2 px-1">{'\uD83C\uDFD5\uFE0F \uC678\uBD80'} ({activeExterior.length}{'\uAD6C\uC5ED'})</h2>
          <div className="space-y-2">
            {activeExterior.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                sessionId={sessionId}
                progress={getZoneProgress(zone.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Complete Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-bark-100 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleComplete}
            disabled={!allZonesComplete || completing}
            className="btn-primary w-full"
          >
            {completing
              ? '처리 중...'
              : allZonesComplete
                ? '청소 완료 + 검수 요청'
                : `\uBBF8\uC644\uB8CC \uAD6C\uC5ED ${activeZones.filter(z => !getZoneProgress(z.id).isComplete).length}\uAC1C`}
          </button>
        </div>
      </div>
    </div>
  );
}
