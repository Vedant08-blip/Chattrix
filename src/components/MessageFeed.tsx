import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store';
import type { Message } from '../types';
import { Reply, Smile, Trash2, Edit2, CornerUpLeft, Users } from 'lucide-react';

interface MessageFeedProps {
  onReplySelect: (message: Message) => void;
}

export const MessageFeed: React.FC<MessageFeedProps> = ({ onReplySelect }) => {
  const {
    activeDMId,
    activeCommunityId,
    activeChannelId,
    viewMode,
    messages,
    users,
    currentUser,
    typingUsers,
    toggleReaction,
    deleteMessage,
    editMessage,
    communities
  } = useChatStore();

  const chatKey = viewMode === 'dms' 
    ? `dm_${activeDMId}` 
    : `channel_${activeChannelId}`;

  const currentMessages = messages[chatKey] || [];
  const feedEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States for Editing
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // States for Reactions Popover per message
  const [activeReactPopoverId, setActiveReactPopoverId] = useState<string | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Scroll to bottom on channel switch or messages update
  useEffect(() => {
    scrollToBottom('instant');
  }, [chatKey]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentMessages.length]);

  // Date Divider Helpers
  const formatDateHeader = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatMessageTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageDateTime = (isoString: string) => {
    const dateHeader = formatDateHeader(isoString);
    const time = formatMessageTime(isoString);
    return `${dateHeader} at ${time}`;
  };

  // Keyboard handlers for edit input
  const handleEditKeyDown = (e: React.KeyboardEvent, messageId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editContent.trim()) {
        editMessage(messageId, editContent.trim());
      }
      setEditingMessageId(null);
    } else if (e.key === 'Escape') {
      setEditingMessageId(null);
    }
  };

  // Popular Emojis for Reactions
  const reactionEmojis = ['👍', '❤️', '😂', '🔥', '🎉', '👀', '🚀', '😮'];

  // Typing Indicator Message Builder
  const getTypingText = () => {
    const typers = typingUsers[chatKey] || [];
    if (typers.length === 0) return null;

    const names = typers.map(id => users[id]?.name || 'Someone');
    if (names.length === 1) {
      return <span><strong>{names[0]}</strong> is typing...</span>;
    } else if (names.length === 2) {
      return <span><strong>{names[0]}</strong> and <strong>{names[1]}</strong> are typing...</span>;
    } else {
      return <span><strong>Several people</strong> are typing...</span>;
    }
  };

  // Check if messages can be grouped (same sender, same day, within 3 minutes)
  const shouldGroup = (msg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return false;
    if (msg.senderId !== prevMsg.senderId) return false;
    if (msg.replyTo) return false; // Don't group if it's a reply
    if (prevMsg.isDeleted || msg.isDeleted) return false;

    const timeDiff = new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime();
    const isSameDay = new Date(msg.timestamp).toDateString() === new Date(prevMsg.timestamp).toDateString();
    
    return isSameDay && timeDiff < 3 * 60 * 1000; // 3 minutes
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#313338] relative custom-scrollbar select-text"
      onClick={() => setActiveReactPopoverId(null)}
    >
      
      {/* If no chat is open */}
      {(!activeDMId && !activeChannelId) && (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-[#404249] flex items-center justify-center text-white mb-4">
            <Users className="w-8 h-8 text-[#b5bac1]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome to Chattrix!</h2>
          <p className="text-sm text-[#949ba4] max-w-sm">
            Select a direct message from the sidebar or click a community server to start chatting with other developers and gamers.
          </p>
        </div>
      )}

      {/* Message List */}
      {(activeDMId || activeChannelId) && (
        <div className="flex flex-col min-h-full justify-end">
          
          {/* Header introduction inside chat stream */}
          <div className="pb-6 mb-6 border-b border-[#3f4147]/50 text-left">
            <div className="w-16 h-16 rounded-full bg-[#404249] flex items-center justify-center text-white mb-4">
              {viewMode === 'dms' ? (
                <img 
                  src={users[activeDMId || '']?.avatar} 
                  alt="" 
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-[#dbdee1]">#</span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              {viewMode === 'dms' 
                ? users[activeDMId || '']?.name 
                : `#${communities.find(c => c.id === activeCommunityId)?.channels.find(ch => ch.id === activeChannelId)?.name}`}
            </h1>
            <p className="text-sm text-[#949ba4]">
              {viewMode === 'dms' 
                ? `This is the beginning of your direct message history with ${users[activeDMId || '']?.name}.`
                : `This is the start of the #${communities.find(c => c.id === activeCommunityId)?.channels.find(ch => ch.id === activeChannelId)?.name} channel.`}
            </p>
          </div>

          {/* Messages Stream */}
          <div className="space-y-1">
            {currentMessages.map((msg, index) => {
              const prevMsg = index > 0 ? currentMessages[index - 1] : null;
              const isGrouped = shouldGroup(msg, prevMsg);
              const showDateDivider = prevMsg 
                ? new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString()
                : true;

              const isMe = msg.senderId === currentUser.id;
              const isPopoverOpen = activeReactPopoverId === msg.id;

              return (
                <div key={msg.id} className="flex flex-col">
                  {/* Date Divider Line */}
                  {showDateDivider && (
                    <div className="flex items-center my-4 select-none">
                      <div className="flex-1 h-[1px] bg-[#3f4147]" />
                      <span className="px-2 text-xs font-semibold text-[#949ba4] bg-[#313338] transform-none">
                        {formatDateHeader(msg.timestamp)}
                      </span>
                      <div className="flex-1 h-[1px] bg-[#3f4147]" />
                    </div>
                  )}

                  {/* Message Reply Header Line */}
                  {msg.replyTo && (
                    <div className="flex items-center gap-2 ml-14 mb-1 text-xs text-[#b5bac1] select-none text-left">
                      <div className="w-8 h-4 border-l-2 border-t-2 border-[#4e5058] rounded-tl-md mr-1 flex-shrink-0" />
                      <CornerUpLeft className="w-3 h-3 text-[#949ba4]" />
                      <span className="font-bold text-[#dbdee1]">{msg.replyTo.senderName}</span>
                      <span className="truncate max-w-[250px] sm:max-w-[400px] text-[#949ba4] hover:text-[#dbdee1] cursor-pointer">
                        {msg.replyTo.content}
                      </span>
                    </div>
                  )}

                  {/* Main Message Block */}
                  <div className={`relative flex gap-4 px-4 py-1 -mx-4 hover:bg-[#2e3035]/50 group text-left ${
                    editingMessageId === msg.id ? 'bg-[#2e3035]/30' : ''
                  }`}>
                    {/* Hover Actions Toolbar */}
                    {!msg.isDeleted && editingMessageId !== msg.id && (
                      <div className="absolute right-4 -top-3.5 hidden group-hover:flex items-center bg-[#313338] border border-[#232428] rounded shadow-md h-8 z-20 overflow-visible">
                        {/* React Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReactPopoverId(isPopoverOpen ? null : msg.id);
                            }}
                            title="Add Reaction"
                            className="p-2 hover:bg-[#35373c] text-[#b5bac1] hover:text-white transition-colors"
                          >
                            <Smile className="w-4 h-4" />
                          </button>

                          {/* Reactions dropdown selection */}
                          {isPopoverOpen && (
                            <div 
                              className="absolute bottom-9 right-0 bg-[#2b2d31] border border-[#1f2023] rounded-lg shadow-xl p-2 flex gap-1 z-30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {reactionEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    toggleReaction(msg.id, emoji);
                                    setActiveReactPopoverId(null);
                                  }}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-[#3f4147] rounded transition-colors text-base"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reply Button */}
                        <button
                          onClick={() => onReplySelect(msg)}
                          title="Reply"
                          className="p-2 hover:bg-[#35373c] text-[#b5bac1] hover:text-white transition-colors border-l border-[#232428]"
                        >
                          <Reply className="w-4 h-4" />
                        </button>

                        {/* Edit Button (Only Me) */}
                        {isMe && (
                          <button
                            onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditContent(msg.content);
                            }}
                            title="Edit Message"
                            className="p-2 hover:bg-[#35373c] text-[#b5bac1] hover:text-white transition-colors border-l border-[#232428]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button (Only Me) */}
                        {isMe && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            title="Delete Message"
                            className="p-2 hover:bg-[#35373c] text-red-400 hover:bg-red-500/10 transition-colors border-l border-[#232428]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Avatar Column */}
                    <div className="w-10 flex-shrink-0 select-none">
                      {!isGrouped ? (
                        <img
                          src={msg.senderId === currentUser.id ? currentUser.avatar : msg.senderAvatar}
                          alt=""
                          className="w-10 h-10 rounded-full bg-gray-600 object-cover mt-0.5"
                        />
                      ) : (
                        // Bouncing timestamp visible on hover for grouped consecutive messages
                        <span className="hidden group-hover:block text-[9px] text-[#949ba4] text-center w-full mt-2 select-none">
                          {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      {/* Name & Timestamp Header */}
                      {!isGrouped && (
                        <div className="flex items-baseline gap-2 mb-0.5 select-none">
                          <span className="font-semibold text-white hover:underline cursor-pointer text-sm">
                            {msg.senderId === currentUser.id ? currentUser.name : msg.senderName}
                          </span>
                          <span className="text-[10px] text-[#949ba4]">
                            {formatMessageDateTime(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      {/* Content Text */}
                      {editingMessageId === msg.id ? (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, msg.id)}
                            className="w-full bg-[#383a40] text-[#dbdee1] text-sm px-3 py-2 rounded focus:outline-none border border-[#5865f2]"
                            autoFocus
                          />
                          <div className="text-[10px] text-[#b5bac1] mt-1 select-none">
                            escape to <button onClick={() => setEditingMessageId(null)} className="text-[#5865f2] hover:underline">cancel</button> • enter to <button onClick={() => {
                              if (editContent.trim()) editMessage(msg.id, editContent.trim());
                              setEditingMessageId(null);
                            }} className="text-[#5865f2] hover:underline">save</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className={`text-sm break-words whitespace-pre-wrap ${
                            msg.isDeleted ? 'text-[#949ba4] italic' : 'text-[#dbdee1]'
                          }`}>
                            {msg.content}
                            {msg.isEdited && !msg.isDeleted && (
                              <span className="text-[10px] text-[#949ba4] ml-1 select-none">(edited)</span>
                            )}
                          </p>

                          {/* File Attachment Rendering */}
                          {msg.fileAttachment && (
                            <div className="mt-2.5 max-w-[320px] bg-[#2b2d31] rounded-md border border-[#1f2023] overflow-hidden">
                              {msg.fileAttachment.type.startsWith('image') ? (
                                <img
                                  src={msg.fileAttachment.url}
                                  alt={msg.fileAttachment.name}
                                  className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                />
                              ) : (
                                <div className="p-3 flex items-center gap-3">
                                  <div className="w-10 h-10 bg-[#313338] flex items-center justify-center rounded text-[#dbdee1] font-bold text-xs uppercase select-none">
                                    {msg.fileAttachment.name.split('.').pop() || 'file'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-white truncate">
                                      {msg.fileAttachment.name}
                                    </div>
                                    <div className="text-xs text-[#949ba4]">
                                      {msg.fileAttachment.size}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reactions List */}
                          {msg.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 select-none">
                              {msg.reactions.map((r) => {
                                const hasUserReacted = r.userIds.includes(currentUser.id);
                                return (
                                  <button
                                    key={r.emoji}
                                    onClick={() => toggleReaction(msg.id, r.emoji)}
                                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors border ${
                                      hasUserReacted
                                        ? 'bg-[#5865f2]/10 border-[#5865f2] text-[#5865f2]'
                                        : 'bg-[#2b2d31] border-[#2b2d31] hover:bg-[#35373c] text-[#b5bac1]'
                                    }`}
                                  >
                                    <span>{r.emoji}</span>
                                    <span className="font-semibold">{r.count}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Typing Indicator Display */}
          {getTypingText() && (
            <div className="flex items-center gap-2 text-xs text-[#949ba4] select-none ml-14 py-2 text-left">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              {getTypingText()}
            </div>
          )}

          <div ref={feedEndRef} />
        </div>
      )}
    </div>
  );
};
