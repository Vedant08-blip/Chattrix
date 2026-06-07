import React from 'react';
import { useChatStore } from '../store';
import { Compass, Plus, MessageSquare } from 'lucide-react';

export const ServerSidebar: React.FC = () => {
  const {
    communities,
    activeCommunityId,
    viewMode,
    selectCommunity,
    setHomeView,
    unreadCounts
  } = useChatStore();

  const getChannelUnreads = (channelId: string) => {
    return unreadCounts[`channel_${channelId}`] || 0;
  };

  const isHomeActive = viewMode === 'dms';

  return (
    <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0 h-full select-none">
      
      {/* Home / DM Icon */}
      <button
        onClick={setHomeView}
        title="Direct Messages"
        className="relative group focus:outline-none flex justify-center w-full"
      >
        {/* Left vertical indicator pill */}
        <div className={`absolute left-0 top-3 w-1 bg-white rounded-r-md transition-all duration-200 origin-left ${
          isHomeActive 
            ? 'h-10 opacity-100 scale-100' 
            : 'h-0 opacity-0 scale-50 group-hover:h-5 group-hover:opacity-100 group-hover:scale-100'
        }`} />

        <div className={`w-12 h-12 flex items-center justify-center rounded-3xl transition-all duration-200 ${
          isHomeActive
            ? 'bg-[#5865f2] text-white rounded-2xl'
            : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white hover:rounded-2xl'
        }`}>
          <MessageSquare className="w-6 h-6" />
        </div>
      </button>

      {/* Separator line */}
      <div className="w-8 h-[2px] bg-[#35363c] rounded my-1 flex-shrink-0" />

      {/* Scrollable Server List */}
      <div className="flex-1 w-full space-y-2 overflow-y-auto custom-scrollbar flex flex-col items-center">
        {communities.map((c) => {
          const isActive = activeCommunityId === c.id;
          const communityUnreads = c.channels.reduce((acc, ch) => acc + getChannelUnreads(ch.id), 0);

          return (
            <button
              key={c.id}
              onClick={() => selectCommunity(c.id)}
              title={c.name}
              className="relative group focus:outline-none flex justify-center w-full"
            >
              {/* Left white indicator pill */}
              <div className={`absolute left-0 top-3 w-1 bg-white rounded-r-md transition-all duration-200 origin-left ${
                isActive
                  ? 'h-10 opacity-100 scale-100'
                  : 'h-0 opacity-0 scale-50 group-hover:h-5 group-hover:opacity-100 group-hover:scale-100'
              }`} />

              <div className={`w-12 h-12 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-[#5865f2] text-white rounded-2xl'
                  : 'bg-[#313338] text-[#dbdee1] hover:bg-[#5865f2] hover:text-white hover:rounded-2xl'
              }`}>
                {c.icon}
              </div>

              {/* Unread badge overlay */}
              {communityUnreads > 0 && !isActive && (
                <div className="absolute top-0 right-2 w-3.5 h-3.5 bg-[#f23f43] rounded-full border-2 border-[#1e1f22]" />
              )}
            </button>
          );
        })}

        {/* Create Server Button */}
        <button
          onClick={() => alert("Server creation mockup! Connect backend to support adding custom guilds.")}
          title="Add a Server"
          className="group focus:outline-none flex justify-center w-full mt-1"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-3xl bg-[#313338] text-[#23a55a] transition-all duration-200 hover:bg-[#23a55a] hover:text-white hover:rounded-2xl">
            <Plus className="w-6 h-6" />
          </div>
        </button>

        {/* Explore Servers Button */}
        <button
          onClick={() => alert("Explore servers mockup!")}
          title="Explore Discoverable Servers"
          className="group focus:outline-none flex justify-center w-full"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-3xl bg-[#313338] text-[#23a55a] transition-all duration-200 hover:bg-[#23a55a] hover:text-white hover:rounded-2xl">
            <Compass className="w-6 h-6" />
          </div>
        </button>
      </div>

    </div>
  );
};
