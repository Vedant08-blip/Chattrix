import React from 'react';
import { useChatStore } from '../store';
import { MessageSquare, Shield, ShieldAlert, Hash, Megaphone, Lock, ArrowLeft, Users } from 'lucide-react';
import type { Presence } from '../types';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    users,
    communities,
    activeDMId,
    activeCommunityId,
    activeChannelId,
    viewMode,
    unreadCounts,
    selectDM,
    selectCommunity,
    selectChannel,
    setHomeView,
    toggleAdminMode
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

  const getDMUnreads = (userId: string) => {
    return unreadCounts[`dm_${userId}`] || 0;
  };

  const getChannelUnreads = (channelId: string) => {
    return unreadCounts[`channel_${channelId}`] || 0;
  };

  const activeCommunity = communities.find(c => c.id === activeCommunityId);

  return (
    <div className="w-[240px] flex-shrink-0 bg-[#2b2d31] flex flex-col border-r border-[#1f2023] h-full select-none text-[#dbdee1]">
      
      {/* Dynamic Top Content */}
      <div className="flex-1 flex flex-col min-height-0 overflow-y-auto custom-scrollbar">
        {viewMode === 'dms' ? (
          // ================= DIRECT MESSAGES / HOMEPAGE VIEW =================
          <div className="flex flex-col h-full divide-y divide-[#1f2023]/30">
            {/* Top Half: Direct Messages */}
            <div className="flex-1 flex flex-col py-3 px-2 min-h-[50%]">
              <div className="flex items-center justify-between px-2 pb-2 text-xs font-bold text-[#949ba4] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Direct Messages
                </span>
              </div>
              <div className="space-y-0.5 overflow-y-auto pr-1">
                {Object.values(users)
                  .filter(u => u.id !== 'me' && u.mutualServers)
                  .map((u) => {
                    const isActive = activeDMId === u.id;
                    const unread = getDMUnreads(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => selectDM(u.id)}
                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors duration-150 text-left group ${
                          isActive
                            ? 'bg-[#404249] text-white'
                            : 'hover:bg-[#35373c] hover:text-[#dbdee1] text-[#949ba4]'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full bg-gray-600 object-cover"
                          />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2b2d31] ${getPresenceColor(u.presence)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium truncate ${unread > 0 ? 'text-white font-bold' : ''}`}>
                              {u.name}
                            </span>
                            {unread > 0 && (
                              <span className="bg-[#f23f43] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                {unread}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#949ba4] truncate font-normal group-hover:text-[#dbdee1] transition-colors">
                            {u.statusText || 'No status'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Half: Communities */}
            <div className="flex-1 flex flex-col py-3 px-2 min-h-[50%]">
              <div className="flex items-center justify-between px-2 pb-2 text-xs font-bold text-[#949ba4] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Communities
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3 overflow-y-auto px-1 py-1 pr-1 justify-items-center">
                {communities.map((c) => {
                  const isActive = activeCommunityId === c.id;
                  // Compute total unread for this community
                  const communityUnreads = c.channels.reduce((acc, ch) => acc + getChannelUnreads(ch.id), 0);
                  
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectCommunity(c.id)}
                      title={c.name}
                      className="relative focus:outline-none group"
                    >
                      <div className={`w-12 h-12 flex items-center justify-center text-base font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-[#5865f2] text-white rounded-2xl'
                          : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white hover:rounded-2xl'
                      }`}>
                        {c.icon}
                      </div>
                      
                      {/* Left white pill marker */}
                      <div className={`absolute left-[-10px] top-[14px] w-1.5 bg-white rounded-r-md transition-all duration-200 ${
                        isActive
                          ? 'h-5 opacity-100 scale-100'
                          : 'h-2 opacity-0 scale-50 group-hover:opacity-100 group-hover:h-3 group-hover:scale-100'
                      }`} />

                      {/* Unread badge indicator */}
                      {communityUnreads > 0 && (
                        <div className="absolute top-0 right-0 bg-[#f23f43] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-[#2b2d31]">
                          {communityUnreads}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // ================= COMMUNITY CHANNELS VIEW =================
          <div className="flex flex-col h-full">
            {/* Header with back button */}
            <div className="p-3.5 border-b border-[#1f2023] flex flex-col gap-2">
              <button
                onClick={setHomeView}
                className="flex items-center gap-1.5 text-xs font-bold text-[#b5bac1] hover:text-white uppercase tracking-wider text-left transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to DMs
              </button>
              <h2 className="text-base font-bold text-white truncate px-0.5 mt-1">
                {activeCommunity?.name}
              </h2>
            </div>

            {/* Channel List */}
            <div className="flex-1 py-4 px-2 space-y-0.5">
              <div className="px-2 pb-1.5 text-xs font-bold text-[#949ba4] uppercase tracking-wider">
                Channels
              </div>
              {activeCommunity?.channels.map((ch) => {
                const isActive = activeChannelId === ch.id;
                const unread = getChannelUnreads(ch.id);
                const isAnnouncements = ch.type === 'announcements';

                return (
                  <button
                    key={ch.id}
                    onClick={() => selectChannel(ch.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors duration-150 text-left group ${
                      isActive
                        ? 'bg-[#404249] text-white'
                        : 'hover:bg-[#35373c] hover:text-[#dbdee1] text-[#949ba4]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isAnnouncements ? (
                        <Megaphone className="w-4 h-4 flex-shrink-0 text-[#949ba4] group-hover:text-[#dbdee1]" />
                      ) : (
                        <Hash className="w-4 h-4 flex-shrink-0 text-[#949ba4] group-hover:text-[#dbdee1]" />
                      )}
                      <span className={`text-sm truncate ${isActive ? 'text-white' : ''} ${unread > 0 ? 'text-white font-bold' : ''}`}>
                        {ch.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAnnouncements && (
                        <span title="Announcements Only" className="flex items-center opacity-50 group-hover:opacity-100"><Lock className="w-3 h-3 text-[#949ba4]" /></span>
                      )}
                      {unread > 0 && (
                        <span className="bg-[#f23f43] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {unread}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-2.5 bg-[#232428] flex items-center justify-between border-t border-[#1f2023]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full bg-gray-700 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#232428] bg-[#23a55a]" />
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-[#949ba4] leading-none">
              Online
            </span>
          </div>
        </div>

        {/* Role Toggle Switch */}
        <button
          onClick={toggleAdminMode}
          title={`Switch to ${currentUser.role === 'Admin' ? 'Regular User' : 'Admin'} Mode`}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all duration-150 ${
            currentUser.role === 'Admin'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-[#313338] text-[#949ba4] border border-[#1f2023] hover:text-[#dbdee1] hover:bg-[#383a40]'
          }`}
        >
          {currentUser.role === 'Admin' ? (
            <>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-[#949ba4]" />
              <span>User</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
