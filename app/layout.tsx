import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '달팽이아지트 청소 관리',
  description: '달팽이아지트 펜션 청소 체크리스트 및 검수 시스템',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <main className="max-w-lg mx-auto min-h-screen pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
