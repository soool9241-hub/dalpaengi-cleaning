'use client';

import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import type { CleaningMedia } from '@/lib/types';

interface MediaUploaderProps {
  sessionId: string;
  zoneId: string;
  photoHint: string;
  onUpload: (media: CleaningMedia) => void;
}

export default function MediaUploader({ sessionId, zoneId, photoHint, onUpload }: MediaUploaderProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const uploadFile = async (file: File, mediaType: 'photo' | 'video') => {
    setUploading(true);
    try {
      let fileToUpload = file;

      if (mediaType === 'photo' && file.type.startsWith('image/')) {
        setProgress('이미지 압축 중...');
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
      }

      setProgress('업로드 중...');
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('sessionId', sessionId);
      formData.append('zoneId', zoneId);
      formData.append('mediaType', mediaType);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '업로드 실패');
      }

      const { media } = await res.json();
      onUpload(media);
      setProgress('');
    } catch (err) {
      alert(`업로드 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'photo' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i], mediaType);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
        촬영 가이드: {photoHint}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="btn-outline text-sm !px-2 !py-2.5 !min-h-0 flex-col gap-1"
        >
          <span className="text-lg">📸</span>
          <span>카메라</span>
        </button>
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={uploading}
          className="btn-outline text-sm !px-2 !py-2.5 !min-h-0 flex-col gap-1"
        >
          <span className="text-lg">🖼</span>
          <span>앨범</span>
        </button>
        <button
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading}
          className="btn-outline text-sm !px-2 !py-2.5 !min-h-0 flex-col gap-1"
        >
          <span className="text-lg">🎬</span>
          <span>영상</span>
        </button>
      </div>

      {uploading && (
        <div className="text-center text-sm text-moss-600 py-2 animate-pulse">
          {progress || '처리 중...'}
        </div>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'photo')}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, 'photo')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'video')}
      />
    </div>
  );
}
