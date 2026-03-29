'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface Stats {
  todaySessions: number;
  inProgress: number;
  completed: number;
  reviewed: number;
  rejected: number;
  totalCleaners: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    todaySessions: 0, inProgress: 0, completed: 0, reviewed: 0, rejected: 0, totalCleaners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0];

      const [sessionsRes, cleanersRes] = await Promise.all([
        supabase.from('cleaning_sessions').select('status').eq('session_date', today),
        supabase.from('cleaners').select('id').eq('is_active', true),
      ]);

      const sessions = sessionsRes.data || [];
      setStats({
        todaySessions: sessions.length,
        inProgress: sessions.filter(s => s.status === 'in_progress').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        reviewed: sessions.filter(s => s.status === 'reviewed').length,
        rejected: sessions.filter(s => s.status === 'rejected').length,
        totalCleaners: cleanersRes.data?.length || 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const menuItems = [
    {
      href: '/admin/assign',
      icon: '\uD83D\uDCCB',
      title: '\uCCAD\uC18C \uBC30\uC815',
      desc: '\uAD6C\uC5ED\uBCC4 \uCCAD\uC18C\uC790 \uBC30\uC815 \uBC0F \uC138\uC158 \uC0DD\uC131',
      color: 'bg-moss-100 text-moss-700',
    },
    {
      href: '/admin/cleaners',
      icon: '\uD83D\uDC64',
      title: '\uCCAD\uC18C\uC790 \uAD00\uB9AC',
      desc: '\uCCAD\uC18C\uC790 \uCD94\uAC00/\uC0AD\uC81C',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      href: '/admin/history',
      icon: '\uD83D\uDCC6',
      title: '\uC774\uB825 \uAD00\uB9AC',
      desc: '\uCCAD\uC18C\uC790\uBCC4/\uB0A0\uC9DC\uBCC4 \uC774\uB825 \uC870\uD68C',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      href: '/review',
      icon: '\u2705',
      title: '\uAC80\uC218\uD558\uAE30',
      desc: '\uC644\uB8CC\uB41C \uCCAD\uC18C \uAC80\uC218',
      color: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-bark-800">{'\uAD00\uB9AC\uC790'}</h1>
          <p className="text-sm text-bark-400">{'\uB2EC\uD399\uC774\uC544\uC9C0\uD2B8 \uCCAD\uC18C \uAD00\uB9AC'}</p>
        </div>
        <div className="text-3xl">{'\uD83D\uDC0C'}</div>
      </div>

      {/* Today Stats */}
      <div className="card">
        <h2 className="text-sm font-semibold text-bark-500 mb-3">{'\uC624\uB298 \uD604\uD669'}</h2>
        {loading ? (
          <div className="text-center text-bark-400 py-4 animate-pulse">{'\uB85C\uB529...'}</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              <p className="text-xs text-orange-500">{'\uC9C4\uD589 \uC911'}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              <p className="text-xs text-blue-500">{'\uAC80\uC218 \uB300\uAE30'}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{stats.reviewed}</p>
              <p className="text-xs text-green-500">{'\uAC80\uC218 \uC644\uB8CC'}</p>
            </div>
          </div>
        )}
        {!loading && stats.rejected > 0 && (
          <div className="mt-2 text-center p-2 bg-red-50 rounded-xl">
            <span className="text-sm text-red-600 font-medium">{'\uBC18\uB824'} {stats.rejected}{'\uAC74'}</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="space-y-3">
        {menuItems.map(item => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-bark-800">{item.title}</p>
              <p className="text-xs text-bark-400">{item.desc}</p>
            </div>
            <span className="text-bark-300 text-xl">&rsaquo;</span>
          </button>
        ))}
      </div>
    </div>
  );
}
