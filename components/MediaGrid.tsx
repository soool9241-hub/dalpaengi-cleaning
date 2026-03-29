'use client';

import { useState } from 'react';
import type { CleaningMedia } from '@/lib/types';

interface MediaGridProps {
  mediaList: CleaningMedia[];
  onDelete?: (media: CleaningMedia) => void;
  readOnly?: boolean;
}

export default function MediaGrid({ mediaList, onDelete, readOnly = false }: MediaGridProps) {
  const [lightbox, setLightbox] = useState<CleaningMedia | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (media: CleaningMedia) => {
    if (!onDelete) return;
    if (!confirm('이 미디어를 삭제하시겠습니까?')) return;

    setDeleting(media.id);
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: media.id, storagePath: media.storage_path }),
      });

      if (res.ok) {
        onDelete(media);
      }
    } finally {
      setDeleting(null);
    }
  };

  if (mediaList.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {mediaList.map((media) => (
          <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden bg-bark-100 group">
            {media.media_type === 'photo' ? (
              <img
                src={media.public_url || ''}
                alt=""
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightbox(media)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center cursor-pointer bg-bark-200"
                onClick={() => setLightbox(media)}
              >
                <span className="text-3xl">🎬</span>
              </div>
            )}

            {!readOnly && onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(media); }}
                disabled={deleting === media.id}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full
                           text-xs flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition-opacity shadow-md"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl z-50 w-10 h-10 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            X
          </button>
          {lightbox.media_type === 'photo' ? (
            <img
              src={lightbox.public_url || ''}
              alt=""
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={lightbox.public_url || ''}
              controls
              autoPlay
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}
