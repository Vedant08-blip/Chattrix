import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store';
import { X, Send, Shield, ShieldCheck, Mail } from 'lucide-react';
import type { Presence } from '../types';

export const UserProfileModal: React.FC = () => {
  const {
    userProfileModalId,
    setUserProfileModalId,
    users,
    currentUser,
    communities,
    selectDM,
    sendMessage
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve target user profile details
  let targetUser = null;
  if (userProfileModalId) {
    if (userProfileModalId === currentUser.id) {
      targetUser = {
        ...currentUser,
        mutualServers: communities.map(c => c.name),
        presence: 'online' as Presence
      };
    } else {
      targetUser = users[userProfileModalId];
    }
  }

  // Focus input on open
  useEffect(() => {
    if (userProfileModalId && targetUser?.id !== currentUser.id) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
    setMessageText('');
  }, [userProfileModalId, targetUser?.id, currentUser.id]);

  if (!userProfileModalId || !targetUser) return null;

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || targetUser.id === currentUser.id) return;

    // Switch view to this user's DM
    selectDM(targetUser.id);
    
    // Post the message
    sendMessage(messageText.trim(), null);
    
    // Clear and close
    setMessageText('');
    setUserProfileModalId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        onClick={() => setUserProfileModalId(null)}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200" 
      />

      {/* Profile Card Container */}
      <div className="relative w-full max-w-[340px] bg-[#1e1f22] rounded-xl border border-[#2b2d31]/80 shadow-2xl overflow-hidden text-[#dbdee1] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Top Banner Cover */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative flex-shrink-0">
          <button
            onClick={() => setUserProfileModalId(null)}
            className="absolute top-3 right-3 p-1 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details area */}
        <div className="px-4 pb-4 relative -mt-12 flex flex-col text-left">
          
          {/* Large Avatar */}
          <div className="relative w-20 h-20 mb-3.5">
            <img
              src={targetUser.avatar}
              alt=""
              className="w-20 h-20 rounded-full border-4 border-[#1e1f22] bg-gray-700 object-cover"
            />
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1e1f22] ${getPresenceColor(targetUser.presence)}`} />
          </div>

          {/* User names and badges */}
          <div className="bg-[#2b2d31] p-3 rounded-lg border border-[#3f4147]/20 flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base font-extrabold text-white truncate leading-tight">
                  {targetUser.name}
                </span>
                {targetUser.role === 'Admin' && (
                  <span title="Admin" className="flex items-center text-[#f23f43] flex-shrink-0"><ShieldCheck className="w-4 h-4" /></span>
                )}
                {targetUser.role === 'Mod' && (
                  <span title="Moderator" className="flex items-center text-purple-400 flex-shrink-0"><Shield className="w-4 h-4" /></span>
                )}
              </div>
              <span className="text-[10px] text-[#949ba4] leading-normal font-semibold">
                {getPresenceLabel(targetUser.presence)}
              </span>
            </div>

            {/* Custom Status */}
            <div>
              <span className="text-[9px] font-bold text-[#b5bac1] uppercase tracking-wider block mb-1">
                Custom Status
              </span>
              <p className="text-xs text-[#dbdee1] font-medium leading-snug">
                {targetUser.statusText || 'No custom status set'}
              </p>
            </div>

            {/* Mutual Servers list */}
            <div>
              <span className="text-[9px] font-bold text-[#b5bac1] uppercase tracking-wider block mb-1">
                Mutual Servers
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {targetUser.mutualServers?.map((srv) => {
                  const initials = srv.split(' ').map(w => w[0]).join('');
                  return (
                    <div
                      key={srv}
                      title={srv}
                      className="w-7 h-7 rounded-full bg-[#1e1f22] border border-[#2b2d31] flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:bg-[#5865f2] transition-colors"
                    >
                      {initials}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Chat Input Box (Not for self) */}
          {targetUser.id !== currentUser.id && (
            <form onSubmit={handleSendMessage} className="mt-4 flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-[#b5bac1] uppercase tracking-wider">
                Send Quick Message
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Message @${targetUser.name}`}
                  className="w-full bg-[#2b2d31] text-[#dbdee1] text-xs px-3 py-2.5 pr-8 rounded focus:outline-none border border-transparent focus:border-[#5865f2] transition-colors font-normal"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className={`absolute right-2.5 top-2.5 transition-colors focus:outline-none ${
                    messageText.trim() ? 'text-[#5865f2] hover:text-[#4752c4]' : 'text-[#4e5058]'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
