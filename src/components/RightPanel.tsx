import React from 'react';
import { useChatStore } from '../store';
import type { Presence } from '../types';
import { Shield, ShieldCheck, HelpCircle } from 'lucide-react';

export const RightPanel: React.FC = () => {
  const {
    activeDMId,
    activeCommunityId,
    viewMode,
    users,
    communities,
    isRightPanelOpen
  } = useChatStore();

  if (!isRightPanelOpen) return null;

  const getPresenceColor = (presence: Presence) => {
    switch (presence) {
      case 'online': return 'bg-[#23a55a]';
      case 'idle': return 'bg-[#f0b232]';
      case 'dnd': return 'bg-[#f23f43]';
      case 'offline': return 'bg-[#80848e]';
      default: return 'bg-[#80848e]';
    }
  };

  const getPresenceLabel = (presence: Presence) => {
    switch (presence) {
      case 'online': return 'Online';
      case 'idle': return 'Idle';
      case 'dnd': return 'Do Not Disturb';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

  const activeDMUser = viewMode === 'dms' && activeDMId ? users[activeDMId] : null;

  // Render DM profile card
  if (viewMode === 'dms') {
    if (!activeDMUser) {
      return (
        <div className="w-[240px] flex-shrink-0 bg-[#2b2d31] border-l border-[#1f2023] hidden lg:flex flex-col items-center justify-center p-4 text-[#949ba4] text-xs text-center select-none">
          <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
          Select a DM conversation to view profile details.
        </div>
      );
    }

    return (
      <div className="w-[240px] flex-shrink-0 bg-[#2b2d31] border-l border-[#1f2023] flex flex-col h-full overflow-y-auto custom-scrollbar select-none text-[#dbdee1]">
        {/* Banner header card */}
        <div className="h-16 bg-gradient-to-r from-indigo-500 to-purple-600 w-full relative flex-shrink-0" />
        
        {/* Avatar profile frame */}
        <div className="px-4 pb-4 relative flex flex-col -mt-9 text-left">
          <div className="relative w-18 h-18 mb-3">
            <img
              src={activeDMUser.avatar}
              alt={activeDMUser.name}
              className="w-18 h-18 rounded-full border-4 border-[#2b2d31] bg-gray-700 object-cover"
            />
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#2b2d31] ${getPresenceColor(activeDMUser.presence)}`} />
          </div>

          {/* User name & status details */}
          <h2 className="text-base font-bold text-white leading-tight mb-0.5">
            {activeDMUser.name}
          </h2>
          <span className="text-[10px] text-[#949ba4] leading-none mb-3">
            {getPresenceLabel(activeDMUser.presence)}
          </span>

          <div className="h-[1px] bg-[#3f4147]/60 w-full my-3" />

          {/* About me info box */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-[#b5bac1] uppercase tracking-wider block mb-1">
                Custom Status
              </span>
              <p className="text-xs text-[#dbdee1] bg-[#1e1f22] p-2 rounded">
                {activeDMUser.statusText || 'No custom status set'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#b5bac1] uppercase tracking-wider block mb-1">
                Mutual Servers
              </span>
              <div className="space-y-2 mt-1.5">
                {activeDMUser.mutualServers?.map((serverName) => {
                  const community = communities.find(c => c.name === serverName);
                  return (
                    <div key={serverName} className="flex items-center gap-2.5 hover:bg-[#35373c]/50 p-1 rounded cursor-pointer transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[#313338] flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0">
                        {community?.icon || serverName.split(' ').map(w => w[0]).join('')}
                      </div>
                      <span className="text-xs text-[#dbdee1] truncate">{serverName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Community member lists
  const activeCommunity = communities.find(c => c.id === activeCommunityId);
  const communityMembers = activeCommunity
    ? activeCommunity.members.map(id => users[id] || (id === 'me' ? {
        id: 'me',
        name: 'You',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
        presence: 'online',
        role: useChatStore.getState().currentUser.role
      } : null)).filter(Boolean) as any[]
    : [];

  const onlineMembers = communityMembers.filter(m => m.presence !== 'offline');
  const offlineMembers = communityMembers.filter(m => m.presence === 'offline');

  // Sort members helper: Admin -> Mod -> Member
  const sortMembers = (a: any, b: any) => {
    const roleWeight = { 'Admin': 3, 'Mod': 2, 'Member': 1 };
    const weightA = roleWeight[a.role as 'Admin' | 'Mod' | 'Member'] || 1;
    const weightB = roleWeight[b.role as 'Admin' | 'Mod' | 'Member'] || 1;
    if (weightB !== weightA) return weightB - weightA;
    return a.name.localeCompare(b.name);
  };

  const sortedOnline = [...onlineMembers].sort(sortMembers);
  const sortedOffline = [...offlineMembers].sort(sortMembers);

  return (
    <div className="w-[240px] flex-shrink-0 bg-[#2b2d31] border-l border-[#1f2023] flex flex-col h-full overflow-y-auto custom-scrollbar select-none text-[#dbdee1] py-4 px-3">
      {/* Online Section */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider px-2 mb-2 text-left">
          Online — {sortedOnline.length}
        </h3>
        <div className="space-y-0.5">
          {sortedOnline.map((member) => (
            <div
              key={member.id}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373c]/60 cursor-pointer group transition-colors text-left"
              title={`${member.name} (${member.role || 'Member'}) - "${member.statusText || 'No status'}"`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={member.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full bg-gray-700 object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#2b2d31] ${getPresenceColor(member.presence)}`} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col">
                <div className="flex items-center gap-1 min-w-0">
                  <span className={`text-sm font-medium truncate ${
                    member.role === 'Admin' 
                      ? 'text-[#f23f43] font-semibold' 
                      : member.role === 'Mod' 
                        ? 'text-purple-400 font-semibold' 
                        : 'text-[#dbdee1]'
                  }`}>
                    {member.name}
                  </span>
                  {member.role === 'Admin' && (
                    <span title="Admin" className="flex-shrink-0 flex items-center"><ShieldCheck className="w-3.5 h-3.5 text-[#f23f43]" /></span>
                  )}
                  {member.role === 'Mod' && (
                    <span title="Moderator" className="flex-shrink-0 flex items-center"><Shield className="w-3.5 h-3.5 text-purple-400" /></span>
                  )}
                </div>
                {member.statusText && (
                  <span className="text-[10px] text-[#949ba4] truncate group-hover:text-[#dbdee1] transition-colors leading-normal">
                    {member.statusText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Section */}
      <div>
        <h3 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider px-2 mb-2 text-left">
          Offline — {sortedOffline.length}
        </h3>
        <div className="space-y-0.5">
          {sortedOffline.map((member) => (
            <div
              key={member.id}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373c]/40 cursor-pointer group transition-colors text-left opacity-60 hover:opacity-100"
              title={`${member.name} (Offline)`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={member.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full bg-gray-700 object-cover filter grayscale"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#2b2d31] bg-[#80848e]" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm font-medium truncate text-[#949ba4]">
                    {member.name}
                  </span>
                  {member.role === 'Admin' && (
                    <span title="Admin" className="flex-shrink-0 flex items-center"><ShieldCheck className="w-3.5 h-3.5 text-[#949ba4]" /></span>
                  )}
                  {member.role === 'Mod' && (
                    <span title="Moderator" className="flex-shrink-0 flex items-center"><Shield className="w-3.5 h-3.5 text-[#949ba4]" /></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
