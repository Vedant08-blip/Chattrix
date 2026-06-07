import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store';
import type { Message, FileAttachment } from '../types';
import { Plus, Smile, Send, X, FileText, Image, Film, Lock } from 'lucide-react';

interface MessageInputProps {
  replyMessage: Message | null;
  onCancelReply: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ replyMessage, onCancelReply }) => {
  const {
    activeDMId,
    activeCommunityId,
    activeChannelId,
    viewMode,
    communities,
    currentUser,
    sendMessage,
    simulateTyping
  } = useChatStore();

  const chatKey = viewMode === 'dms' 
    ? `dm_${activeDMId}` 
    : `channel_${activeChannelId}`;

  const [text, setText] = useState('');
  
  // Attachments State
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setIsEmojiOpen(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Reset states on channel/chat switch
  useEffect(() => {
    setText('');
    setAttachedFile(null);
    setIsEmojiOpen(false);
    setIsFileMenuOpen(false);
  }, [chatKey]);

  // Determine if channel is announcement and locked for regular users
  let isLocked = false;

  if (viewMode === 'community' && activeCommunityId && activeChannelId) {
    const community = communities.find(c => c.id === activeCommunityId);
    const channel = community?.channels.find(ch => ch.id === activeChannelId);
    if (channel?.type === 'announcements') {
      if (currentUser.role !== 'Admin') {
        isLocked = true;
      }
    }
  }

  // Handle typing simulation
  const handleFocus = () => {
    if (!isLocked) {
      simulateTyping(chatKey, true);
    }
  };

  const handleBlur = () => {
    if (!isLocked) {
      // Small timeout to simulate typing decay
      setTimeout(() => {
        simulateTyping(chatKey, false);
      }, 500);
    }
  };

  // Submit Handler
  const handleSend = () => {
    if (isLocked) return;
    if (!text.trim() && !attachedFile) return;

    sendMessage(text.trim(), replyMessage, attachedFile || undefined);
    
    // Clear state
    setText('');
    setAttachedFile(null);
    onCancelReply();
    simulateTyping(chatKey, false);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mock File Selection options
  const mockFiles: FileAttachment[] = [
    {
      name: 'bug_screenshot.png',
      url: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=300&q=80',
      size: '342 KB',
      type: 'image/png'
    },
    {
      name: 'react_state_diagram.pdf',
      url: '#',
      size: '1.4 MB',
      type: 'application/pdf'
    },
    {
      name: 'clutch_gameplay.mp4',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
      size: '15.8 MB',
      type: 'video/mp4'
    }
  ];

  const handleAttachFile = (file: FileAttachment) => {
    setAttachedFile(file);
    setIsFileMenuOpen(false);
  };

  // Emojis for picker
  const emojis = ['😀', '😂', '🔥', '👍', '❤️', '🎉', '👀', '🚀', '😮', '💯', '👏', '🎨', '🎮', '🌟', '💻', '🍕'];

  const handleEmojiClick = (emoji: string) => {
    setText(prev => prev + emoji);
    setIsEmojiOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  if (!activeDMId && !activeChannelId) return null;

  return (
    <div className="p-4 bg-[#313338] select-none flex-shrink-0 relative">
      
      {/* Reply Banner Overlay */}
      {replyMessage && (
        <div className="absolute top-0 left-4 right-4 -translate-y-full bg-[#2b2d31] border-x border-t border-[#1f2023] rounded-t-md px-3 py-2 flex items-center justify-between text-xs text-[#b5bac1] select-none">
          <div className="flex items-center gap-1.5 truncate">
            <span>Replying to <strong>{replyMessage.senderName}</strong></span>
            <span className="truncate text-[#949ba4] italic max-w-[300px] sm:max-w-[500px]">
              "{replyMessage.content}"
            </span>
          </div>
          <button 
            onClick={onCancelReply}
            className="text-[#949ba4] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main input wrapper */}
      <div className={`bg-[#383a40] rounded-lg border border-transparent focus-within:border-[#5865f2] transition-colors overflow-hidden ${
        isLocked ? 'opacity-60 bg-[#2b2d31] border border-[#1f2023] cursor-not-allowed' : ''
      }`}>
        
        {/* Attached File Preview Tag */}
        {attachedFile && (
          <div className="px-4 py-3 bg-[#2f3136] border-b border-[#232428] flex items-center justify-between text-sm text-[#dbdee1]">
            <div className="flex items-center gap-2.5 truncate">
              {attachedFile.type.startsWith('image') ? (
                <Image className="w-5 h-5 text-[#b5bac1] flex-shrink-0" />
              ) : attachedFile.type.startsWith('video') ? (
                <Film className="w-5 h-5 text-[#b5bac1] flex-shrink-0" />
              ) : (
                <FileText className="w-5 h-5 text-[#b5bac1] flex-shrink-0" />
              )}
              <div className="truncate flex flex-col">
                <span className="font-semibold text-white truncate">{attachedFile.name}</span>
                <span className="text-xs text-[#949ba4]">{attachedFile.size}</span>
              </div>
            </div>
            <button 
              onClick={() => setAttachedFile(null)}
              className="text-[#949ba4] hover:text-red-400 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-start px-4 py-2.5 gap-3">
          {/* File Attach Button */}
          {!isLocked ? (
            <div className="relative" ref={fileMenuRef}>
              <button
                onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
                className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#4e5058] hover:bg-[#6d6f78] text-[#dbdee1] transition-colors focus:outline-none"
              >
                <Plus className="w-4 h-4" />
              </button>

              {isFileMenuOpen && (
                <div className="absolute bottom-9 left-0 bg-[#2b2d31] border border-[#1f2023] rounded-lg shadow-xl py-1 w-56 z-30 select-none text-left">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider border-b border-[#232428]/40">
                    Upload Mock File
                  </div>
                  {mockFiles.map(file => (
                    <button
                      key={file.name}
                      onClick={() => handleAttachFile(file)}
                      className="w-full px-3 py-2 text-xs text-[#dbdee1] hover:bg-[#35373c] flex items-center gap-2 transition-colors text-left"
                    >
                      {file.type.startsWith('image') ? (
                        <Image className="w-3.5 h-3.5 text-[#949ba4]" />
                      ) : file.type.startsWith('video') ? (
                        <Film className="w-3.5 h-3.5 text-[#949ba4]" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-[#949ba4]" />
                      )}
                      <div className="truncate flex-1">
                        <div className="truncate font-semibold">{file.name}</div>
                        <div className="text-[9px] text-[#949ba4]">{file.size}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-[#2b2d31] text-[#949ba4]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Text Input area */}
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={isLocked}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={
              isLocked 
                ? `Only administrators can send messages in #${communities.find(c => c.id === activeCommunityId)?.channels.find(ch => ch.id === activeChannelId)?.name}.`
                : viewMode === 'dms'
                  ? `Message @${useChatStore.getState().users[activeDMId || '']?.name}`
                  : `Message #${communities.find(c => c.id === activeCommunityId)?.channels.find(ch => ch.id === activeChannelId)?.name}`
            }
            className="flex-1 bg-transparent text-sm text-[#dbdee1] placeholder-[#949ba4] focus:outline-none resize-none pt-1.5 max-h-32 min-h-[24px] font-normal"
            style={{ height: 'auto' }}
          />

          {/* Emoji & Send Buttons */}
          {!isLocked && (
            <div className="flex items-center gap-2.5 mt-0.5">
              {/* Emoji Button */}
              <div className="relative" ref={emojiRef}>
                <button
                  onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                  className="text-[#b5bac1] hover:text-white transition-colors focus:outline-none p-1"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {isEmojiOpen && (
                  <div className="absolute bottom-9 right-0 bg-[#2b2d31] border border-[#1f2023] rounded-lg shadow-xl p-3 w-52 z-30 select-none">
                    <div className="grid grid-cols-4 gap-2 justify-items-center">
                      {emojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#3f4147] rounded text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!text.trim() && !attachedFile}
                className={`p-1 rounded transition-colors focus:outline-none ${
                  (text.trim() || attachedFile)
                    ? 'text-[#5865f2] hover:text-[#4752c4]'
                    : 'text-[#4e5058] cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
