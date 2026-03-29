'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ZONES } from '@/lib/zones';
import type { CleaningSession, CleaningCheck, CleaningMedia } from '@/lib/types';
import MediaGrid from '@/components/MediaGrid';
import ProgressBar from '@/components/ProgressBar';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<CleaningSession | null>(null);
  const [checks, setChecks] = useState<CleaningCheck[]>([]);
  const [media, setMedia] = useState<CleaningMedia[]>([]);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    const [sessionRes, checksRes, mediaRes] = await Promise.all([
      supabase.from('cleaning_sessions').select('*').eq('id', sessionId).single(),
      supabase.from('cleaning_checks').select('*').eq('session_id', sessionId).order('task_index'),
      supabase.from('cleaning_media').select('*').eq('session_id', sessionId).order('uploaded_at'),
    ]);
    if (sessionRes.data) setSession(sessionRes.data as CleaningSession);
    if (checksRes.data) setChecks(checksRes.data as CleaningCheck[]);
    if (mediaRes.data) setMedia(mediaRes.data as CleaningMedia[]);
  }, [sessionId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReview = async (action: 'approve' | 'reject') => {
    if (!reviewerName.trim()) {
      alert('검수자 이름을 입력해주세요');
      return;
    }
    if (action === 'reject' && !reviewNotes.trim()) {
      alert('반려 사유를 입력해주세요');
      return;
    }

    const confirmMsg = action === 'approve'
      ? '이 청소를 승인하시겠습니까?'
      : '이 청소를 반려하시겠습니까?\n청소자에게 반려 알림이 발송됩니다.';
    if (!confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/session/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action,
          reviewerName: reviewerName.trim(),
          reviewNotes: reviewNotes.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      alert(action === 'approve' ? '검수 승인 완료!' : '반려 처리 완료!');
      router.push('/review');
    } catch {
      alert('처리 실패. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-bark-500">로딩 중...</div>
      </div>
    );
  }

  const totalChecked = checks.filter(c => c.is_checked).length;
  const isAlreadyReviewed = session.status === 'reviewed' || session.status === 'rejected';

  // Calculate duration
  let duration = '';
  if (session.started_at && session.completed_at) {
    const diff = new Date(session.completed_at).getTime() - new Date(session.started_at).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    duration = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  }

  return (
    <div className="px-4 py-4 space-y-4 pb-8">
      <button onClick={() => router.push('/review')} className="text-sm text-bark-500 flex items-center gap-1">
        &lsaquo; 검수 목록으로
      </button>

      {/* Session Info */}
      <div className="card space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-bark-800">검수 상세</h1>
          <span className={
            session.status === 'reviewed' ? 'badge-reviewed' :
            session.status === 'rejected' ? 'badge-rejected' :
            'badge-complete'
          }>
            {session.status === 'reviewed' ? '승인' :
             session.status === 'rejected' ? '반려' : '검수대기'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-bark-500">청소자:</span> <span className="font-medium">{session.cleaner_name}</span></div>
          <div><span className="text-bark-500">날짜:</span> <span className="font-medium">{session.session_date}</span></div>
          {duration && <div><span className="text-bark-500">소요시간:</span> <span className="font-medium">{duration}</span></div>}
          <div><span className="text-bark-500">미디어:</span> <span className="font-medium">{media.length}건</span></div>
        </div>
        <ProgressBar current={totalChecked} total={checks.length} label="체크리스트" />
      </div>

      {/* Review Notes (if already reviewed) */}
      {isAlreadyReviewed && session.review_notes && (
        <div className={`rounded-xl p-4 ${session.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className="text-sm font-medium mb-1">
            {session.status === 'rejected' ? '반려 사유' : '검수 메모'}
          </p>
          <p className="text-sm">{session.review_notes}</p>
          <p className="text-xs text-bark-500 mt-2">검수자: {session.reviewer_name}</p>
        </div>
      )}

      {/* Zone by Zone Review */}
      {ZONES.map(zone => {
        const zoneChecks = checks.filter(c => c.zone_id === zone.id);
        const zoneMedia = media.filter(m => m.zone_id === zone.id);
        const zoneChecked = zoneChecks.filter(c => c.is_checked).length;
        const allDone = zoneChecked === zoneChecks.length;

        return (
          <div key={zone.id} className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{zone.icon}</span>
                <h2 className="font-semibold text-bark-800">{zone.name}</h2>
              </div>
              <span className={`text-sm font-medium ${allDone ? 'text-moss-600' : 'text-orange-500'}`}>
                {zoneChecked}/{zoneChecks.length}
              </span>
            </div>

            {/* Unchecked tasks warning */}
            {!allDone && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-orange-600 font-medium">미완료 항목:</p>
                {zoneChecks.filter(c => !c.is_checked).map(c => (
                  <p key={c.id} className="text-xs text-orange-700 ml-2">- {c.task_text}</p>
                ))}
              </div>
            )}

            {/* Media */}
            {zoneMedia.length > 0 ? (
              <MediaGrid mediaList={zoneMedia} readOnly />
            ) : (
              <p className="text-sm text-red-500">사진/영상 미업로드</p>
            )}
          </div>
        );
      })}

      {/* Review Actions */}
      {!isAlreadyReviewed && (
        <div className="card space-y-3 border-2 border-moss-200">
          <h2 className="font-semibold text-bark-800">검수 처리</h2>

          <div>
            <label className="block text-sm text-bark-600 mb-1">검수자 이름 *</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="검수자 이름"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-bark-600 mb-1">메모 (반려 시 필수)</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="검수 메모 / 반려 사유"
              className="input-field min-h-[80px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleReview('reject')}
              disabled={submitting}
              className="btn-danger"
            >
              {submitting ? '...' : '반려'}
            </button>
            <button
              onClick={() => handleReview('approve')}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? '...' : '승인'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
