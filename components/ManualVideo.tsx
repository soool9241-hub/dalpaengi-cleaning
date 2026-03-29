'use client';

interface ManualVideoProps {
  videoUrl: string | null;
  zoneName: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

  return url;
}

export default function ManualVideo({ videoUrl, zoneName }: ManualVideoProps) {
  if (!videoUrl) {
    return (
      <div className="bg-bark-50 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">🎬</div>
        <p className="text-sm text-bark-500">
          {zoneName} 매뉴얼 영상이 아직 등록되지 않았습니다
        </p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="rounded-xl overflow-hidden bg-black aspect-video">
      <iframe
        src={embedUrl || videoUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
