'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export default function CleanersManagePage() {
  const router = useRouter();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);

  const loadCleaners = async () => {
    const res = await fetch('/api/cleaners');
    const data = await res.json();
    setCleaners(data.cleaners || []);
    setLoading(false);
  };

  useEffect(() => { loadCleaners(); }, []);

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      alert('\uC774\uB984\uACFC \uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/cleaners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      setName('');
      setPhone('');
      loadCleaners();
    } catch {
      alert('\uCD94\uAC00 \uC2E4\uD328');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (cleaner: Cleaner) => {
    if (!confirm(`${cleaner.name}\uB2D8\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`)) return;
    try {
      const res = await fetch(`/api/cleaners/${cleaner.id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('\uC0AD\uC81C \uC2E4\uD328');
        return;
      }
      loadCleaners();
    } catch {
      alert('\uC0AD\uC81C \uC2E4\uD328');
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <button onClick={() => router.push('/admin')} className="text-sm text-bark-500">
        &lsaquo; {'\uAD00\uB9AC\uC790'}
      </button>

      <h1 className="text-xl font-bold text-bark-800">{'\uCCAD\uC18C\uC790 \uAD00\uB9AC'}</h1>

      {/* Add Form */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-bark-600">{'\uCCAD\uC18C\uC790 \uCD94\uAC00'}</h2>
        <input
          type="text"
          placeholder={'\uC774\uB984'}
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-field"
        />
        <input
          type="tel"
          placeholder={'\uC804\uD654\uBC88\uD638 (01012345678)'}
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAdd} disabled={adding} className="btn-primary w-full">
          {adding ? '\uCD94\uAC00 \uC911...' : '\uCCAD\uC18C\uC790 \uCD94\uAC00'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-bark-600 px-1">
          {'\uB4F1\uB85D\uB41C \uCCAD\uC18C\uC790'} ({cleaners.length}{'\uBA85'})
        </h2>
        {loading ? (
          <div className="card text-center text-bark-400 animate-pulse">{'\uB85C\uB529...'}</div>
        ) : cleaners.length === 0 ? (
          <div className="card text-center text-bark-400">{'\uB4F1\uB85D\uB41C \uCCAD\uC18C\uC790\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4'}</div>
        ) : (
          cleaners.map(cleaner => (
            <div key={cleaner.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-moss-100 rounded-full flex items-center justify-center text-moss-700 font-bold">
                  {cleaner.name.slice(-1)}
                </div>
                <div>
                  <p className="font-semibold text-bark-800">{cleaner.name}</p>
                  <p className="text-xs text-bark-400">
                    {cleaner.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(cleaner)}
                className="text-sm text-red-500 hover:text-red-700 px-3 py-1"
              >
                {'\uC0AD\uC81C'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
