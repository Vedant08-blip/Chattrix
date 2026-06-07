import React, { useEffect } from 'react';
import { useChatStore } from '../store';
import { ServerSidebar } from './ServerSidebar';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

export const MobileDrawer: React.FC = () => {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useChatStore();

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        toggleMobileSidebar(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  if (!isMobileSidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden select-none">
      {/* Backdrop */}
      <div 
        onClick={() => toggleMobileSidebar(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 ease-out" 
      />

      {/* Drawer content (slides in from left) */}
      <div className="relative flex-shrink-0 w-[312px] h-full bg-[#2b2d31] flex z-10 shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
        {/* Close Button on top of sidebar */}
        <button
          onClick={() => toggleMobileSidebar(false)}
          className="absolute top-3 right-[-44px] w-9 h-9 flex items-center justify-center rounded-full bg-[#313338] text-[#dbdee1] border border-[#1f2023]/60 focus:outline-none hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebars inside drawer */}
        <div className="flex h-full w-full overflow-hidden">
          <ServerSidebar />
          <Sidebar />
        </div>
      </div>
    </div>
  );
};
