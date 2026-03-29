'use client';

import ProgressBar from './ProgressBar';

interface SessionHeaderProps {
  cleanerName: string;
  totalTasks: number;
  checkedTasks: number;
  totalMedia: number;
  requiredMedia: number;
}

export default function SessionHeader({
  cleanerName,
  totalTasks,
  checkedTasks,
  totalMedia,
  requiredMedia,
}: SessionHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-bark-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐌</span>
          <div>
            <h1 className="font-bold text-bark-800">달팽이아지트</h1>
            <p className="text-xs text-bark-500">청소자: {cleanerName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-moss-700">
            {checkedTasks === totalTasks ? '전체 완료!' : '진행 중'}
          </div>
        </div>
      </div>

      <ProgressBar
        current={checkedTasks}
        total={totalTasks}
        label="체크리스트"
        color={checkedTasks === totalTasks ? 'moss' : 'orange'}
      />

      <ProgressBar
        current={totalMedia}
        total={requiredMedia}
        label="사진/영상"
        size="sm"
        color={totalMedia >= requiredMedia ? 'moss' : 'blue'}
      />
    </div>
  );
}
