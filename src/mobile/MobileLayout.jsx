import { useEffect } from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { useTabContext } from './MobileTabContext';

export default function MobileLayout({ children, headerTitle, rootPath = '/' }) {
  const { getScrollPosition } = useTabContext();

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      const scrollPos = getScrollPosition(rootPath);
      mainContent.scrollTop = scrollPos;
    }
  }, [rootPath, getScrollPosition]);

  return (
    <div className="h-screen flex flex-col bg-[#080c18]">
      {/* Header */}
      <MobileHeader title={headerTitle} rootPath={rootPath} />

      {/* Content */}
      <main
        className="flex-1 overflow-y-auto overscroll-none"
        style={{
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {children}
      </main>

      {/* Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}