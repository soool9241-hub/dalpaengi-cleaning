'use client';

import { useState } from 'react';

interface TaskItemProps {
  sessionId: string;
  zoneId: string;
  taskIndex: number;
  taskText: string;
  isChecked: boolean;
  onToggle: (taskIndex: number, isChecked: boolean) => void;
}

export default function TaskItem({
  taskIndex,
  taskText,
  isChecked,
  onToggle,
}: TaskItemProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    onToggle(taskIndex, !isChecked);
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left
        ${isChecked ? 'bg-moss-50' : 'bg-white hover:bg-bark-50'}
        ${loading ? 'opacity-50' : ''}`}
    >
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
        ${isChecked ? 'bg-moss-500 border-moss-500' : 'border-bark-300'}`}>
        {isChecked && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm leading-relaxed ${isChecked ? 'text-bark-400 line-through' : 'text-bark-700'}`}>
        {taskText}
      </span>
    </button>
  );
}
