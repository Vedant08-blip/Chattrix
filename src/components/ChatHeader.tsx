import React from 'react';
import { useChatStore } from '../store';
import { Menu, Hash, Megaphone, Search, Users, SidebarClose, SidebarOpen, X } from 'lucide-react';
import type { Presence } from '../types';

export const ChatHeader: React.FC = () => {
  const {
    activeDMId,
    activeCommunityId,
    activeChannelId,
    viewMode,
    users,
    communities,
    isRightPanelOpen,
    toggleRightPanel,
    toggleMobileSidebar,
    searchQuery,
    setSearchQuery
  } = useChatStore();

  const getPresenceColor = (presence: Presence) => {
    switch (presence) {
      case 'online': return 'bg-[#23a55a]';
      case 'idle': return 'bg-[#f0b232]';
      case 'dnd': return 'bg-[#f23f43]';
      case 'offline': return 'bg-[#80848e]';
      default: return 'bg-[#80848e]';
    }
  };

  // Resolve active header details
  let headerTitle = '';
  let headerSubtitle = '';
  let iconElement: React.ReactNode = null;
  let activeDMUser = null;

  if (viewMode === 'dms') {
    if (activeDMId) {
      activeDMUser = users[activeDMId];
      if (activeDMUser) {
        headerTitle = activeDMUser.name;
        headerSubtitle = activeDMUser.statusText || 'Offline / Away';
        iconElement = (
          <div className="relative mr-2 flex-shrink-0">
            <img
              src={activeDMUser.avatar}
              alt={activeDMUser.name}
              className="w-6 h-6 rounded-full bg-gray-600 object-cover"
            />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#313338] ${getPresenceColor(activeDMUser.presence)}`} />
          </div>
        );
      }
    } else {
      headerTitle = 'Direct Messages';
      headerSubtitle = 'Select a conversation to start chatting';
      iconElement = <Users className="w-5 h-5 text-[#949ba4] mr-2" />;
    }
  } else if (viewMode === 'community' && activeCommunityId) {
    const community = communities.find(c => c.id === activeCommunityId);
    if (community && activeChannelId) {
      const channel = community.channels.find(ch => ch.id === activeChannelId);
      if (channel) {
        headerTitle = channel.name;
        headerSubtitle = channel.description;
        iconElement = channel.type === 'announcements' ? (
          <Megaphone className="w-5 h-5 text-[#949ba4] mr-2 flex-shrink-0" />
        ) : (
          <Hash className="w-5 h-5 text-[#949ba4] mr-2 flex-shrink-0" />
        );
      }
    }
  }

  return (
    <header className="h-12 bg-[#313338] border-b border-[#1f2023] flex items-center justify-between px-4 select-none text-[#dbdee1] flex-shrink-0 z-10 shadow-sm">
      {/* Left side: Hamburger (mobile) + Icon + Title + Description */}
      <div className="flex items-center min-w-0 mr-4">
        {/* Mobile Hamburger menu */}
        <button
          onClick={() => toggleMobileSidebar(true)}
          className="md:hidden p-1 mr-2 text-[#b5bac1] hover:text-[#dbdee1] transition-colors focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center min-w-0">
          {iconElement}
          <span className="font-bold text-white text-base truncate mr-3">
            {headerTitle}
          </span>
          {headerSubtitle && (
            <>
              <div className="hidden sm:block w-[1px] h-4 bg-[#3f4147] mx-2 flex-shrink-0" />
              <span className="hidden sm:block text-xs text-[#949ba4] truncate font-normal">
                {headerSubtitle}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side: Search + Toggle Right Sidebar button */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        {/* Active Search Input */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search active chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-36 lg:w-60 bg-[#1e1f22] text-[#dbdee1] text-xs px-2.5 py-1.5 pr-8 rounded focus:outline-none placeholder-[#949ba4] border border-transparent focus:border-[#5865f2] transition-colors"
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery('')}
              className="w-3.5 h-3.5 text-[#949ba4] hover:text-white absolute right-2 top-2 focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-[#949ba4] absolute right-2 top-2 pointer-events-none" />
          )}
        </div>

        {/* Member list toggle */}
        {(activeDMId || (activeCommunityId && activeChannelId)) && (
          <button
            onClick={toggleRightPanel}
            title={isRightPanelOpen ? "Hide Member List / Profile" : "Show Member List / Profile"}
            className={`p-1 transition-colors focus:outline-none ${
              isRightPanelOpen ? 'text-white' : 'text-[#b5bac1] hover:text-[#dbdee1]'
            }`}
          >
            {isRightPanelOpen ? (
              <SidebarClose className="w-5 h-5" />
            ) : (
              <SidebarOpen className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
