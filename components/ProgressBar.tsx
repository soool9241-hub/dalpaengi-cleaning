'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  size?: 'sm' | 'md';
  color?: 'moss' | 'blue' | 'orange';
}

export default function ProgressBar({ current, total, label, size = 'md', color = 'moss' }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  const colorMap = {
    moss: 'bg-moss-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
  };

  const bgMap = {
    moss: 'bg-moss-100',
    blue: 'bg-blue-100',
    orange: 'bg-orange-100',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className={`text-bark-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</span>
          <span className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'} text-bark-700`}>
            {current}/{total} ({percent}%)
          </span>
        </div>
      )}
      <div className={`w-full ${bgMap[color]} rounded-full overflow-hidden ${size === 'sm' ? 'h-2' : 'h-3'}`}>
        <div
          className={`${colorMap[color]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
