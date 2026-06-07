import { useState } from 'react';
import { ServerSidebar } from './components/ServerSidebar';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageFeed } from './components/MessageFeed';
import { MessageInput } from './components/MessageInput';
import { RightPanel } from './components/RightPanel';
import { MobileDrawer } from './components/MobileDrawer';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ScreenshareFeed } from './components/ScreenshareFeed';
import { useChatStore } from './store';
import type { Message } from './types';

function App() {
  const { theme } = useChatStore();
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);

  const handleReplySelect = (message: Message) => {
    setReplyMessage(message);
  };

  const handleCancelReply = () => {
    setReplyMessage(null);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-[#1e1f22] text-[#dbdee1] font-sans antialiased relative theme-${theme}`}>
      {/* Settings Modal Customizer overlay */}
      <SettingsModal />

      {/* User Profile popover card overlay */}
      <UserProfileModal />

      {/* Mobile Drawer (visible for screen widths < 768px) */}
      <MobileDrawer />

      {/* Desktop Left Sidebars (visible for screen widths >= 768px) */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <ServerSidebar />
        <Sidebar />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header Bar */}
        <ChatHeader />

        {/* Messaging Area & Right Sidebar */}
        <div className="flex-1 flex min-h-0 min-w-0 relative">
          {/* Scrollable messages container and keyboard input */}
          <div className="flex-1 flex flex-col min-w-0 h-full border-r border-[#1f2023]/20">
            <ScreenshareFeed />
            <MessageFeed onReplySelect={handleReplySelect} />
            <MessageInput 
              replyMessage={replyMessage} 
              onCancelReply={handleCancelReply} 
            />
          </div>

          {/* Desktop Right Panel (visible for screen widths >= 1024px, toggled via header button) */}
          <div className="hidden lg:flex h-full flex-shrink-0">
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

