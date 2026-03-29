'use client';

import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: '\u{1F9F9}', label: '\uCCAD\uC18C' },
  { href: '/review', icon: '\u2705', label: '\uAC80\uC218' },
  { href: '/history', icon: '\uD83D\uDCCB', label: '\uC774\uB825' },
  { href: '/manual', icon: '\uD83C\uDFAC', label: '\uB9E4\uB274\uC5BC' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // 청소 진행 중 페이지에서는 내비 숨김
  if (pathname.startsWith('/clean/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-bark-200 z-50">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 transition-colors
                ${isActive
                  ? 'text-moss-700'
                  : 'text-bark-400 hover:text-bark-600'
                }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
