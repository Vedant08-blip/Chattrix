import React, { useState } from 'react';
import { useChatStore } from '../store';
import { X, Shield } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    currentUser,
    isSettingsModalOpen,
    setSettingsModalOpen,
    updateUserProfile
  } = useChatStore();

  const [username, setUsername] = useState(currentUser.name);
  const [status, setStatus] = useState(currentUser.statusText || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const predefinedAvatars = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=me',
    'https://api.dicebear.com/7.x/bottts/svg?seed=antigravity',
    'https://api.dicebear.com/7.x/bottts/svg?seed=coder',
    'https://api.dicebear.com/7.x/bottts/svg?seed=gamer',
    'https://api.dicebear.com/7.x/bottts/svg?seed=glitch',
    'https://api.dicebear.com/7.x/bottts/svg?seed=neon'
  ];

  if (!isSettingsModalOpen) return null;

  const handleSave = () => {
    if (username.trim()) {
      updateUserProfile(username.trim(), status.trim(), avatar);
      setSettingsModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        onClick={() => setSettingsModalOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#313338] rounded-lg border border-[#1f2023]/60 shadow-2xl flex h-[480px] overflow-hidden text-[#dbdee1] animate-in zoom-in-95 duration-150">
        
        {/* Left Settings Sidebar */}
        <div className="w-[180px] bg-[#2b2d31] border-r border-[#1f2023]/30 p-4 flex flex-col gap-1.5 text-left">
          <div className="px-2 pb-1 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">
            User Settings
          </div>
          <button className="w-full text-xs font-semibold px-2 py-2 rounded bg-[#3f4147] text-white">
            My Profile
          </button>
          <button 
            onClick={() => alert("Mute/Deafen options are located in the bottom profile bar.")}
            className="w-full text-xs font-semibold px-2 py-2 rounded text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] transition-colors text-left"
          >
            Voice & Video
          </button>
          <button 
            onClick={() => alert("Appearance toggle is managed in CSS styles.")}
            className="w-full text-xs font-semibold px-2 py-2 rounded text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1] transition-colors text-left"
          >
            Appearance
          </button>
          <div className="flex-1" />
          <div className="text-[10px] text-[#949ba4] px-2">
            Chattrix Client v1.0.0
          </div>
        </div>

        {/* Right Settings Form Editor */}
        <div className="flex-1 p-6 flex flex-col min-h-0 text-left relative">
          
          {/* Close button */}
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#35373c] text-[#b5bac1] hover:text-white transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-white mb-6">User Profile settings</h2>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            
            {/* Nickname Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter display name"
                maxLength={24}
                className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm px-3 py-2 rounded focus:outline-none border border-transparent focus:border-[#5865f2] transition-colors"
              />
            </div>

            {/* Custom Status Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider">
                Custom Status Text
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="What is on your mind?"
                maxLength={48}
                className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm px-3 py-2 rounded focus:outline-none border border-transparent focus:border-[#5865f2] transition-colors"
              />
            </div>

            {/* Avatar Selector Grid */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider">
                Select Robot Avatar
              </label>
              <div className="grid grid-cols-6 gap-2.5">
                {predefinedAvatars.map((avUrl) => {
                  const isSelected = avatar === avUrl;
                  return (
                    <button
                      key={avUrl}
                      onClick={() => setAvatar(avUrl)}
                      className={`relative w-11 h-11 rounded-full overflow-hidden bg-[#2b2d31] border-2 transition-all p-0.5 focus:outline-none ${
                        isSelected 
                          ? 'border-[#5865f2] scale-105 shadow-md' 
                          : 'border-transparent hover:border-[#b5bac1]'
                      }`}
                    >
                      <img src={avUrl} alt="" className="w-full h-full object-cover rounded-full" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Profile Card Preview */}
            <div className="border border-[#1f2023]/40 bg-[#2b2d31] rounded-lg p-4 flex items-center gap-3">
              <img src={avatar} alt="" className="w-12 h-12 rounded-full bg-gray-700 object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white truncate text-sm">{username || 'Nickname'}</span>
                  <span className="text-[10px] bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/30 px-1 rounded flex items-center gap-0.5 font-bold uppercase leading-none py-0.5">
                    <Shield className="w-2.5 h-2.5" /> {currentUser.role}
                  </span>
                </div>
                <div className="text-xs text-[#949ba4] truncate mt-1">
                  Preview Status: "{status || 'Offline / Idle'}"
                </div>
              </div>
            </div>

          </div>

          {/* Footer Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#1f2023]/40">
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="text-sm font-semibold text-[#dbdee1] hover:underline px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!username.trim()}
              className={`text-sm font-semibold text-white px-5 py-2 rounded transition-colors ${
                username.trim() 
                  ? 'bg-[#5865f2] hover:bg-[#4752c4]' 
                  : 'bg-[#5865f2]/55 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
