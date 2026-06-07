import React from 'react';
import { useChatStore } from '../store';
import { 
  MessageSquare, 
  Hash, 
  Megaphone, 
  Lock, 
  Volume2, 
  Mic, 
  MicOff, 
  Headphones, 
  Settings, 
  PhoneOff,
  ChevronDown,
  Info
} from 'lucide-react';
import type { Presence } from '../types';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    users,
    communities,
    activeDMId,
    activeCommunityId,
    activeChannelId,
    activeVoiceChannelId,
    viewMode,
    unreadCounts,
    isMuted,
    isDeafened,
    selectDM,
    selectChannel,
    connectVoice,
    disconnectVoice,
    toggleMute,
    toggleDeafen,
    setSettingsModalOpen,
    setUserProfileModalId
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

  // Find active voice channel and server name details
  let connectedVoiceChannelName = '';
  let connectedVoiceServerName = '';
  if (activeVoiceChannelId) {
    for (const c of communities) {
      const ch = c.channels.find(channel => channel.id === activeVoiceChannelId);
      if (ch) {
        connectedVoiceChannelName = ch.name;
        connectedVoiceServerName = c.name;
        break;
      }
    }
  }

  return (
    <div className="w-[240px] flex-shrink-0 bg-[#2b2d31] flex flex-col border-r border-[#1f2023]/60 h-full select-none text-[#dbdee1]">
      
      {/* Sidebar Channels/DMs Scroll container */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        {viewMode === 'dms' ? (
          // ================= DIRECT MESSAGES LIST =================
          <div className="flex flex-col h-full py-3 px-2">
            {/* Find Conversation Input */}
            <div className="px-2 pb-4">
              <button 
                onClick={() => alert("Search conversation mockup!")}
                className="w-full bg-[#1e1f22] text-[#949ba4] text-xs py-1.5 px-2.5 rounded text-left border border-transparent hover:border-[#1f2023] transition-colors"
              >
                Find or start a conversation
              </button>
            </div>

            <div className="flex items-center justify-between px-2 pb-2 text-xs font-bold text-[#949ba4] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Direct Messages
              </span>
            </div>
            
            <div className="space-y-0.5 overflow-y-auto pr-0.5">
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
                          <span className={`text-sm font-semibold truncate ${unread > 0 ? 'text-white font-bold' : ''}`}>
                            {u.name}
                          </span>
                          {unread > 0 && (
                            <span className="bg-[#f23f43] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                              {unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#949ba4] truncate font-normal group-hover:text-[#dbdee1] transition-colors leading-normal mt-0.5">
                          {u.statusText || 'No status'}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        ) : (
          // ================= COMMUNITY CATEGORIES & CHANNELS =================
          <div className="flex flex-col h-full">
            {/* Server Header Card */}
            <div className="p-3.5 border-b border-[#1f2023] flex items-center justify-between hover:bg-[#35373c]/30 cursor-pointer transition-colors">
              <h2 className="text-sm font-bold text-white truncate px-0.5">
                {activeCommunity?.name}
              </h2>
              <ChevronDown className="w-4 h-4 text-[#dbdee1]" />
            </div>

            {/* Categorized Channels list */}
            <div className="flex-1 py-4 px-2 space-y-4">
              
              {/* Category 1: INFORMATION */}
              <div>
                <div className="px-2 pb-1 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-left">
                  Information
                </div>
                <div className="space-y-0.5">
                  {activeCommunity?.channels
                    .filter(ch => ch.type === 'announcements')
                    .map(ch => {
                      const isActive = activeChannelId === ch.id;
                      const unread = getChannelUnreads(ch.id);
                      return (
                        <button
                          key={ch.id}
                          onClick={() => selectChannel(ch.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors duration-150 text-left group ${
                            isActive
                              ? 'bg-[#404249] text-white'
                              : 'hover:bg-[#35373c] hover:text-[#dbdee1] text-[#949ba4]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Megaphone className="w-4 h-4 flex-shrink-0 text-[#949ba4] group-hover:text-[#dbdee1]" />
                            <span className={`text-sm truncate ${isActive ? 'text-white' : ''} ${unread > 0 ? 'text-white font-bold' : ''}`}>
                              {ch.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {currentUser.role !== 'Admin' && (
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

              {/* Category 2: TEXT CHANNELS */}
              <div>
                <div className="px-2 pb-1 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-left">
                  Text Channels
                </div>
                <div className="space-y-0.5">
                  {activeCommunity?.channels
                    .filter(ch => ch.type === 'text')
                    .map(ch => {
                      const isActive = activeChannelId === ch.id;
                      const unread = getChannelUnreads(ch.id);
                      return (
                        <button
                          key={ch.id}
                          onClick={() => selectChannel(ch.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors duration-150 text-left group ${
                            isActive
                              ? 'bg-[#404249] text-white'
                              : 'hover:bg-[#35373c] hover:text-[#dbdee1] text-[#949ba4]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Hash className="w-4 h-4 flex-shrink-0 text-[#949ba4] group-hover:text-[#dbdee1]" />
                            <span className={`text-sm truncate ${isActive ? 'text-white' : ''} ${unread > 0 ? 'text-white font-bold' : ''}`}>
                              {ch.name}
                            </span>
                          </div>
                          {unread > 0 && (
                            <span className="bg-[#f23f43] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              {unread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Category 3: VOICE CHANNELS */}
              <div>
                <div className="px-2 pb-1 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-left">
                  Voice Channels
                </div>
                <div className="space-y-0.5">
                  {activeCommunity?.channels
                    .filter(ch => ch.type === 'voice')
                    .map(ch => {
                      const isConnected = activeVoiceChannelId === ch.id;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => connectVoice(ch.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors duration-150 text-left group ${
                            isConnected
                              ? 'bg-[#23a55a]/10 text-[#23a55a]'
                              : 'hover:bg-[#35373c] hover:text-[#dbdee1] text-[#949ba4]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Volume2 className={`w-4 h-4 flex-shrink-0 ${isConnected ? 'text-[#23a55a]' : 'text-[#949ba4] group-hover:text-[#dbdee1]'}`} />
                            <span className="text-sm truncate">
                              {ch.name}
                            </span>
                          </div>
                          {isConnected && (
                            <span className="text-[10px] bg-[#23a55a]/20 px-1.5 py-0.5 rounded font-bold uppercase text-[#23a55a]">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Voice Connection Status Overlay Panel */}
      {activeVoiceChannelId && (
        <div className="p-3 bg-[#232428] border-t border-[#1f2023] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* Green bouncing voice level bars */}
              <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                <span className="w-0.5 h-1.5 bg-[#23a55a] rounded-sm animate-pulse-slow" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-3 bg-[#23a55a] rounded-sm animate-pulse-slow" style={{ animationDelay: '200ms' }} />
                <span className="w-0.5 h-2 bg-[#23a55a] rounded-sm animate-pulse-slow" style={{ animationDelay: '400ms' }} />
              </div>
              <div className="truncate text-left">
                <div className="text-[11px] font-bold text-[#23a55a] uppercase leading-none">
                  Voice Connected
                </div>
                <div className="text-xs text-[#949ba4] truncate font-medium mt-0.5">
                  {connectedVoiceChannelName} / {connectedVoiceServerName}
                </div>
              </div>
            </div>
            
            {/* Disconnect Voice button */}
            <button
              onClick={disconnectVoice}
              title="Disconnect"
              className="p-1.5 rounded-full hover:bg-red-500/10 text-[#f23f43] hover:text-red-500 transition-colors focus:outline-none flex-shrink-0"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Profile Bar */}
      <div className="p-2 bg-[#232428] flex items-center justify-between border-t border-[#1f2023] gap-1.5">
        <button
          onClick={() => setUserProfileModalId(currentUser.id)}
          className="flex items-center gap-2 min-w-0 p-1 rounded hover:bg-[#35373c]/50 transition-colors cursor-pointer text-left"
          title="Open User Profile Card"
        >
          <div className="relative flex-shrink-0">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-8 h-8 rounded-full bg-gray-700 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#232428] bg-[#23a55a]" />
          </div>
          <div className="min-w-0 flex flex-col leading-tight">
            <span className="text-xs font-bold text-white truncate">
              {currentUser.name}
            </span>
            <span className="text-[9px] text-[#949ba4] truncate">
              {currentUser.statusText || 'Online'}
            </span>
          </div>
        </button>

        {/* Mute, Deafen, and Settings Controls */}
        <div className="flex items-center gap-0.5 flex-shrink-0 text-[#b5bac1]">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
            className={`p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors focus:outline-none ${
              isMuted ? 'text-red-500 hover:text-red-400' : ''
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Deafen button */}
          <button
            onClick={toggleDeafen}
            title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
            className={`p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors focus:outline-none ${
              isDeafened ? 'text-red-500 hover:text-red-400' : ''
            }`}
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* Open Settings button */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            title="User Settings"
            className="p-1.5 rounded hover:bg-[#35373c] hover:text-white transition-colors focus:outline-none"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
