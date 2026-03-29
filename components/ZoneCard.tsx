'use client';

import Link from 'next/link';
import type { Zone } from '@/lib/zones';
import type { ZoneProgress } from '@/lib/types';
import ProgressBar from './ProgressBar';

interface ZoneCardProps {
  zone: Zone;
  sessionId: string;
  progress: ZoneProgress;
}

export default function ZoneCard({ zone, sessionId, progress }: ZoneCardProps) {
  const isAllChecked = progress.checkedTasks === progress.totalTasks;
  const hasEnoughPhotos = progress.photoCount + progress.videoCount >= zone.minPhotos;
  const isDone = isAllChecked && hasEnoughPhotos;

  return (
    <Link href={`/clean/${sessionId}/${zone.id}`}>
      <div className={`card hover:shadow-md transition-shadow ${isDone ? 'border-moss-300 bg-moss-50/50' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{zone.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-bark-800">{zone.name}</h3>
              {isDone && <span className="text-moss-600 text-sm font-medium">완료</span>}
            </div>

            <ProgressBar
              current={progress.checkedTasks}
              total={progress.totalTasks}
              size="sm"
              color={isDone ? 'moss' : 'orange'}
            />

            <div className="flex items-center gap-3 mt-2 text-xs text-bark-500">
              <span>~{zone.estimatedMinutes}분</span>
              <span className="flex items-center gap-1">
                {'*'.repeat(zone.difficulty)}{'*'.repeat(0)}
              </span>
              <span className={`flex items-center gap-0.5 ${hasEnoughPhotos ? 'text-moss-600' : 'text-bark-400'}`}>
                사진 {progress.photoCount + progress.videoCount}/{zone.minPhotos}
              </span>
              {zone.recommendVideo && (
                <span className="text-blue-500">영상 권장</span>
              )}
            </div>
          </div>

          <div className="text-bark-300 text-xl flex-shrink-0">&rsaquo;</div>
        </div>
      </div>
    </Link>
  );
}
