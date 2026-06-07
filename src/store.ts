import { create } from 'zustand';
import type { User, Community, Message, FileAttachment } from './types';

interface AppState {
  // Users
  currentUser: User;
  users: { [id: string]: User };

  // Communities
  communities: Community[];

  // Active selections
  activeDMId: string | null;
  activeCommunityId: string | null;
  activeChannelId: string | null;

  // Voice Select
  activeVoiceChannelId: string | null;
  searchQuery: string;
  isMuted: boolean;
  isDeafened: boolean;
  userProfileModalId: string | null;
  isSettingsModalOpen: boolean;

  // View States
  viewMode: 'dms' | 'community';
  isRightPanelOpen: boolean;
  isMobileSidebarOpen: boolean;

  // Message history indexed by chat key ('dm_userId' or 'channel_channelId')
  messages: { [chatKey: string]: Message[] };

  // Unread badge counts indexed by chat key
  unreadCounts: { [chatKey: string]: number };

  // Typing indicators: chatKey -> array of user IDs typing
  typingUsers: { [chatKey: string]: string[] };

  // Themes & Screensharing
  theme: 'dark' | 'amoled-black' | 'forest-moss' | 'crimson-night';
  isScreensharing: boolean;

  // Actions
  selectDM: (userId: string) => void;
  selectCommunity: (communityId: void | string) => void;
  selectChannel: (channelId: string) => void;
  setHomeView: () => void;

  sendMessage: (content: string, replyTo: Message | null, file?: FileAttachment) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;

  toggleRightPanel: () => void;
  toggleMobileSidebar: (isOpen?: boolean) => void;
  toggleAdminMode: () => void;
  simulateTyping: (chatKey: string, isTyping: boolean) => void;

  connectVoice: (channelId: string) => void;
  disconnectVoice: () => void;
  setSearchQuery: (query: string) => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  setUserProfileModalId: (userId: string | null) => void;
  setSettingsModalOpen: (isOpen: boolean) => void;
  updateUserProfile: (name: string, statusText: string, avatar: string) => void;
  setTheme: (theme: 'dark' | 'amoled-black' | 'forest-moss' | 'crimson-night') => void;
  toggleScreenshare: () => void;
}

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// Mock Users
const mockUsers: { [id: string]: User } = {
  'chattrix_bot': {
    id: 'chattrix_bot',
    name: 'ChattrixBot',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChattrixBot',
    presence: 'online',
    statusText: 'AI Assistant 🤖',
    mutualServers: ['Developer Hangout', 'Gamer Zone'],
    role: 'Admin'
  },
  'alice': {
    id: 'alice',
    name: 'Alice',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    presence: 'online',
    statusText: 'Coding React apps! 💻',
    mutualServers: ['Developer Hangout', 'Gamer Zone'],
    role: 'Member'
  },
  'bob': {
    id: 'bob',
    name: 'Bob',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    presence: 'idle',
    statusText: 'AFK eating pizza... 🍕',
    mutualServers: ['Gamer Zone'],
    role: 'Member'
  },
  'charlie': {
    id: 'charlie',
    name: 'Charlie',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    presence: 'dnd',
    statusText: 'DND - In a client meeting',
    mutualServers: ['Developer Hangout'],
    role: 'Mod'
  },
  'dave': {
    id: 'dave',
    name: 'Dave',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
    presence: 'online',
    statusText: 'Ping me for server issues',
    mutualServers: ['Developer Hangout'],
    role: 'Admin'
  },
  'eve': {
    id: 'eve',
    name: 'Eve',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
    presence: 'offline',
    statusText: 'Offline - Back tomorrow',
    mutualServers: ['Developer Hangout', 'Gamer Zone'],
    role: 'Member'
  },
  'frank': {
    id: 'frank',
    name: 'Frank',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
    presence: 'online',
    statusText: 'LFG Valorant / Minecraft 🎮',
    mutualServers: ['Developer Hangout', 'Gamer Zone'],
    role: 'Member'
  },
  'grace': {
    id: 'grace',
    name: 'Grace',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace',
    presence: 'online',
    mutualServers: ['Developer Hangout'],
    role: 'Member'
  },
  'heidi': {
    id: 'heidi',
    name: 'Heidi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Heidi',
    presence: 'idle',
    mutualServers: ['Developer Hangout'],
    role: 'Member'
  },
  'ivan': {
    id: 'ivan',
    name: 'Ivan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
    presence: 'offline',
    mutualServers: ['Developer Hangout'],
    role: 'Member'
  },
  'judy': {
    id: 'judy',
    name: 'Judy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Judy',
    presence: 'online',
    mutualServers: ['Developer Hangout'],
    role: 'Member'
  },
  'mallory': {
    id: 'mallory',
    name: 'Mallory',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mallory',
    presence: 'idle',
    statusText: 'Moderating the community',
    mutualServers: ['Gamer Zone'],
    role: 'Mod'
  },
  'trent': {
    id: 'trent',
    name: 'Trent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trent',
    presence: 'offline',
    mutualServers: ['Gamer Zone'],
    role: 'Member'
  },
  'peggy': {
    id: 'peggy',
    name: 'Peggy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peggy',
    presence: 'idle',
    mutualServers: ['Gamer Zone'],
    role: 'Member'
  },
  'sybil': {
    id: 'sybil',
    name: 'Sybil',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sybil',
    presence: 'dnd',
    mutualServers: ['Gamer Zone'],
    role: 'Member'
  }
};

// Mock Communities
const mockCommunities: Community[] = [
  {
    id: 'dev_hangout',
    name: 'Developer Hangout',
    icon: 'DH',
    channels: [
      { id: 'dh_welcome', name: 'welcome-rules', type: 'announcements', description: 'Welcome guidelines and general rules for developers.' },
      { id: 'dh_general', name: 'general-chat', type: 'text', description: 'General coding talks, banter and networking.' },
      { id: 'dh_react_vite', name: 'react-vite', type: 'text', description: 'Everything React, Vite, Tailwind and general frontend framework queries.' },
      { id: 'dh_random', name: 'random-memes', type: 'text', description: 'Share interesting links, jokes, and funny memes.' },
      { id: 'dh_lounge', name: 'Lounge 🎙️', type: 'voice', description: 'General voice channel for developers to hang out.' },
      { id: 'dh_gaming', name: 'Gaming Room 🎮', type: 'voice', description: 'Hop in to play games together while coding.' },
      { id: 'dh_pair', name: 'Pair Programming 💻', type: 'voice', description: 'Collaborate and review code with screenshare.' }
    ],
    members: ['dave', 'alice', 'charlie', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy']
  },
  {
    id: 'gamer_zone',
    name: 'Gamer Zone',
    icon: 'GZ',
    channels: [
      { id: 'gz_announcements', name: 'announcements', type: 'announcements', description: 'Tournament brackets, rule revisions, and server news.' },
      { id: 'gz_lfg', name: 'lfg-chat', type: 'text', description: 'Looking for group: Drop your lobbies and find players!' },
      { id: 'gz_clips', name: 'clips-and-highlights', type: 'text', description: 'Share your clutch moments and epic gaming clips.' },
      { id: 'gz_voice', name: 'General Voice 🔊', type: 'voice', description: 'Hang out and voice chat about anything gaming.' },
      { id: 'gz_squad', name: 'Squad Up 🔫', type: 'voice', description: 'In-game comms for active tournament lobbies.' }
    ],
    members: ['mallory', 'alice', 'bob', 'eve', 'frank', 'trent', 'peggy', 'sybil']
  }
];

// Seed initial messages
const getInitialMessages = (): { [key: string]: Message[] } => {
  const messages: { [chatKey: string]: Message[] } = {};

  // 1. DMs: Alice
  messages['dm_alice'] = [
    {
      id: 'da1',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'Hey there! Are you working on the Discord clone frontend today?',
      timestamp: '2026-06-05T14:32:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'da2',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'I noticed Vite 6 is really fast for build caching. What template did you scaffold?',
      timestamp: '2026-06-05T14:33:15Z',
      replyTo: null,
      reactions: [{ emoji: '⚡', count: 1, userIds: ['me'] }]
    },
    {
      id: 'da3',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
      content: 'Hey! Yes, I scaffolded it with React + TypeScript. Currently setting up Zustand.',
      timestamp: '2026-06-06T09:12:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'da4',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'Awesome. Did you use Tailwind CSS v4? It removes the config file entirely.',
      timestamp: '2026-06-06T09:15:30Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'da5',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
      content: 'Yeah, Tailwind v4 is clean. All theme extensions go right into index.css.',
      timestamp: '2026-06-07T11:45:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'da6',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'Have you implemented the sliding drawers for mobile devices?',
      timestamp: '2026-06-07T18:40:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'da7',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'Let me know, I want to verify responsiveness.',
      timestamp: '2026-06-07T18:41:10Z',
      replyTo: null,
      reactions: []
    }
  ];

  // 2. DMs: Bob
  messages['dm_bob'] = [
    {
      id: 'db1',
      senderId: 'bob',
      senderName: 'Bob',
      senderAvatar: mockUsers['bob'].avatar,
      content: 'Yo, did you watch the CS2 tournament matches yesterday?',
      timestamp: '2026-06-06T15:20:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'db2',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
      content: 'Hey Bob! I missed it, who won the grand finals?',
      timestamp: '2026-06-06T16:05:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'db3',
      senderId: 'bob',
      senderName: 'Bob',
      senderAvatar: mockUsers['bob'].avatar,
      content: 'NaVi swept the finals 3-0! The final round clutch was absolutely insane.',
      timestamp: '2026-06-06T16:10:00Z',
      replyTo: null,
      reactions: [{ emoji: '🔥', count: 2, userIds: ['me', 'bob'] }]
    },
    {
      id: 'db4',
      senderId: 'bob',
      senderName: 'Bob',
      senderAvatar: mockUsers['bob'].avatar,
      content: 'We should play some casual LFG games later tonight if you are free.',
      timestamp: '2026-06-07T14:30:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'db5',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
      content: 'Definitely down! Send me a ping in Gamer Zone #lfg when you are online.',
      timestamp: '2026-06-07T14:45:00Z',
      replyTo: null,
      reactions: []
    }
  ];

  // 3. DMs: Charlie
  messages['dm_charlie'] = [
    {
      id: 'dc1',
      senderId: 'charlie',
      senderName: 'Charlie',
      senderAvatar: mockUsers['charlie'].avatar,
      content: 'Hi! Could you review the moderation guidelines in Developer Hangout #welcome?',
      timestamp: '2026-06-06T11:00:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dc2',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
      content: 'Sure, I will take a look. Did Dave write them?',
      timestamp: '2026-06-06T11:15:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dc3',
      senderId: 'charlie',
      senderName: 'Charlie',
      senderAvatar: mockUsers['charlie'].avatar,
      content: 'Yes, he drafted them. We want to pin them so users see them right as they join.',
      timestamp: '2026-06-07T12:00:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dc4',
      senderId: 'charlie',
      senderName: 'Charlie',
      senderAvatar: mockUsers['charlie'].avatar,
      content: 'Let me know if we need to edit section 3 about links.',
      timestamp: '2026-06-07T18:48:00Z',
      replyTo: null,
      reactions: []
    }
  ];

  // Bot DM Initial Message
  messages['dm_chattrix_bot'] = [
    {
      id: 'dbot1',
      senderId: 'chattrix_bot',
      senderName: 'ChattrixBot',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChattrixBot',
      content: 'Hello! I am ChattrixBot, your AI chat assistant! Ask me anything, or test out my features. Type a message or mention me with @ChattrixBot in any channel!',
      timestamp: '2026-06-07T18:00:00Z',
      replyTo: null,
      reactions: []
    }
  ];

  // 4. Communities -> Developer Hangout -> welcome-rules (Announcements, locked)
  messages['dh_welcome'] = [
    {
      id: 'dw1',
      senderId: 'dave',
      senderName: 'Dave',
      senderAvatar: mockUsers['dave'].avatar,
      content: '🎉 Welcome to Developer Hangout! This is a server for software developers, engineers, designers, and tech enthusiasts.',
      timestamp: '2026-06-05T08:00:00Z',
      replyTo: null,
      reactions: [{ emoji: '🎉', count: 5, userIds: ['alice', 'bob', 'charlie', 'eve', 'frank'] }]
    },
    {
      id: 'dw2',
      senderId: 'dave',
      senderName: 'Dave',
      senderAvatar: mockUsers['dave'].avatar,
      content: '📜 **Server Rules:** \n1. Be respectful to all members. \n2. No spamming, advertising or unsolicited self-promotion. \n3. Keep topics matching channel names. \n4. Use codeblocks for code snippets.',
      timestamp: '2026-06-05T08:05:00Z',
      replyTo: null,
      reactions: [{ emoji: '✅', count: 4, userIds: ['alice', 'charlie', 'eve', 'grace'] }]
    }
  ];

  // 5. Communities -> Developer Hangout -> general-chat
  messages['dh_general'] = [
    {
      id: 'dg1',
      senderId: 'frank',
      senderName: 'Frank',
      senderAvatar: mockUsers['frank'].avatar,
      content: 'Good morning guys! Anyone working on anything cool today?',
      timestamp: '2026-06-07T08:30:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dg2',
      senderId: 'grace',
      senderName: 'Grace',
      senderAvatar: mockUsers['grace'].avatar,
      content: 'Morning! I am building a custom dashboard in Next.js. Server actions are pretty convenient.',
      timestamp: '2026-06-07T08:35:00Z',
      replyTo: null,
      reactions: [{ emoji: '👍', count: 1, userIds: ['frank'] }]
    },
    {
      id: 'dg3',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'Agreed, Next.js forms integration with `useActionState` is much better now.',
      timestamp: '2026-06-07T08:36:12Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dg4',
      senderId: 'charlie',
      senderName: 'Charlie',
      senderAvatar: mockUsers['charlie'].avatar,
      content: 'Hey, does anyone know if Next.js caching is still as aggressive in version 15?',
      timestamp: '2026-06-07T08:42:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dg5',
      senderId: 'dave',
      senderName: 'Dave',
      senderAvatar: mockUsers['dave'].avatar,
      content: 'They actually changed the default! In v15, fetch requests are uncached by default, which solves a lot of configuration headaches.',
      timestamp: '2026-06-07T08:45:00Z',
      replyTo: {
        id: 'dg4',
        senderName: 'Charlie',
        content: 'Hey, does anyone know if Next.js caching is still as aggressive in version 15?'
      },
      reactions: [{ emoji: '💖', count: 2, userIds: ['charlie', 'alice'] }]
    },
    {
      id: 'dg6',
      senderId: 'heidi',
      senderName: 'Heidi',
      senderAvatar: mockUsers['heidi'].avatar,
      content: 'That is a lifesaver. Caching was driving me crazy on my dynamic dashboard routes.',
      timestamp: '2026-06-07T08:47:10Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dg7',
      senderId: 'frank',
      senderName: 'Frank',
      senderAvatar: mockUsers['frank'].avatar,
      content: 'Oh sweet, I might upgrade my project today then.',
      timestamp: '2026-06-07T08:50:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'dg8',
      senderId: 'eve',
      senderName: 'Eve',
      senderAvatar: mockUsers['eve'].avatar,
      content: 'Make sure to check the breaking changes log. There are a few major updates to React 19 types too.',
      timestamp: '2026-06-07T09:12:00Z',
      replyTo: null,
      reactions: []
    }
  ];

  // 6. Communities -> Developer Hangout -> react-vite
  messages['dh_react_vite'] = [
    {
      id: 'drv1',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'Vite 6 is incredibly fast. Scaffolding a TypeScript app took literally 2 seconds.',
      timestamp: '2026-06-07T10:00:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'drv2',
      senderId: 'me',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
      content: 'Agreed, the HMR speed is top-notch.',
      timestamp: '2026-06-07T10:15:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'drv3',
      senderId: 'judy',
      senderName: 'Judy',
      senderAvatar: mockUsers['judy'].avatar,
      content: 'How do you guys configure Tailwind v4? I heard the postcss-loader is not needed anymore.',
      timestamp: '2026-06-07T10:20:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'drv4',
      senderId: 'alice',
      senderName: 'Alice',
      senderAvatar: mockUsers['alice'].avatar,
      content: 'Correct! You just import `@tailwindcss/vite` in your `vite.config.ts` plugins array, and add `@import "tailwindcss"` in your main css file.',
      timestamp: '2026-06-07T10:22:15Z',
      replyTo: {
        id: 'drv3',
        senderName: 'Judy',
        content: 'How do you guys configure Tailwind v4? I heard the postcss-loader is not needed anymore.'
      },
      reactions: [{ emoji: '🚀', count: 3, userIds: ['judy', 'me', 'dave'] }]
    },
    {
      id: 'drv5',
      senderId: 'judy',
      senderName: 'Judy',
      senderAvatar: mockUsers['judy'].avatar,
      content: 'Wow, that is way cleaner. No more tailwind.config.js files cluttering the root folder.',
      timestamp: '2026-06-07T10:25:00Z',
      replyTo: null,
      reactions: []
    }
  ];

  // 7. Communities -> Developer Hangout -> random-memes
  messages['dh_random'] = [
    {
      id: 'drm1',
      senderId: 'frank',
      senderName: 'Frank',
      senderAvatar: mockUsers['frank'].avatar,
      content: 'There are 10 types of people in the world: those who understand binary, and those who do not.',
      timestamp: '2026-06-07T12:00:00Z',
      replyTo: null,
      reactions: [{ emoji: '😂', count: 4, userIds: ['alice', 'charlie', 'eve', 'grace'] }]
    },
    {
      id: 'drm2',
      senderId: 'eve',
      senderName: 'Eve',
      senderAvatar: mockUsers['eve'].avatar,
      content: 'Classic! 😆',
      timestamp: '2026-06-07T12:05:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'drm3',
      senderId: 'grace',
      senderName: 'Grace',
      senderAvatar: mockUsers['grace'].avatar,
      content: 'How about this layout fail?',
      timestamp: '2026-06-07T12:15:00Z',
      replyTo: null,
      reactions: [],
      fileAttachment: {
        name: 'css_meme.jpg',
        url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=300&q=80',
        size: '89 KB',
        type: 'image/jpeg'
      }
    }
  ];

  // 8. Communities -> Gamer Zone -> announcements
  messages['gz_announcements'] = [
    {
      id: 'ga1',
      senderId: 'mallory',
      senderName: 'Mallory',
      senderAvatar: mockUsers['mallory'].avatar,
      content: '📢 **Valorant 5v5 Tournament Incoming!** \nRegistration opens this Wednesday. Grab your squads and sign up in #lfg-chat. Prizes include discord nitro and server champion role badges.',
      timestamp: '2026-06-06T18:00:00Z',
      replyTo: null,
      reactions: [{ emoji: '🎮', count: 6, userIds: ['alice', 'bob', 'frank', 'peggy', 'sybil', 'eve'] }]
    }
  ];

  // 9. Communities -> Gamer Zone -> lfg-chat
  messages['gz_lfg'] = [
    {
      id: 'gl1',
      senderId: 'frank',
      senderName: 'Frank',
      senderAvatar: mockUsers['frank'].avatar,
      content: 'LFG Valorant Comp. Need 2 players. Currently gold/plat lobbies. Drop IDs.',
      timestamp: '2026-06-07T15:00:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'gl2',
      senderId: 'bob',
      senderName: 'Bob',
      senderAvatar: mockUsers['bob'].avatar,
      content: 'I can play! My ID is Bobby#1234. Let\'s queue.',
      timestamp: '2026-06-07T15:05:00Z',
      replyTo: null,
      reactions: []
    },
    {
      id: 'gl3',
      senderId: 'sybil',
      senderName: 'Sybil',
      senderAvatar: mockUsers['sybil'].avatar,
      content: 'I\'m down if you still need one. Playing initiator/smokes.',
      timestamp: '2026-06-07T15:08:12Z',
      replyTo: {
        id: 'gl1',
        senderName: 'Frank',
        content: 'LFG Valorant Comp. Need 2 players. Currently gold/plat lobbies. Drop IDs.'
      },
      reactions: [{ emoji: '👍', count: 1, userIds: ['frank'] }]
    }
  ];

  // 10. Communities -> Gamer Zone -> clips
  messages['gz_clips'] = [
    {
      id: 'gc1',
      senderId: 'peggy',
      senderName: 'Peggy',
      senderAvatar: mockUsers['peggy'].avatar,
      content: 'Check out this 1v4 clutch in my ranked match today! Standard site retake.',
      timestamp: '2026-06-07T16:00:00Z',
      replyTo: null,
      reactions: [{ emoji: '🔥', count: 3, userIds: ['bob', 'frank', 'sybil'] }],
      fileAttachment: {
        name: 'val_clutch_clip.mp4',
        url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
        size: '4.2 MB',
        type: 'video/mp4'
      }
    }
  ];

  return messages;
};

// Seed initial unreads
const initialUnreads: { [key: string]: number } = {
  'dm_alice': 2,
  'dm_charlie': 1,
  'dm_chattrix_bot': 1,
  'channel_dh_general': 3,
  'channel_gz_lfg': 1
};

export const useChatStore = create<AppState>((set, get) => ({
  currentUser: {
    id: 'me',
    name: 'You',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me',
    presence: 'online',
    role: 'Admin' // Start as Admin for convenience to allow posting in announcements
  },
  users: mockUsers,
  communities: mockCommunities,

  activeDMId: null,
  activeCommunityId: null,
  activeChannelId: null,

  activeVoiceChannelId: null,
  searchQuery: '',
  isMuted: false,
  isDeafened: false,
  userProfileModalId: null,
  isSettingsModalOpen: false,

  viewMode: 'dms',
  isRightPanelOpen: true,
  isMobileSidebarOpen: false,

  messages: getInitialMessages(),
  unreadCounts: initialUnreads,
  typingUsers: {},

  theme: 'dark',
  isScreensharing: false,

  selectDM: (userId) => set((state) => {
    const chatKey = `dm_${userId}`;
    const newUnreads = { ...state.unreadCounts, [chatKey]: 0 };
    return {
      activeDMId: userId,
      activeCommunityId: null,
      activeChannelId: null,
      viewMode: 'dms',
      unreadCounts: newUnreads,
      isMobileSidebarOpen: false
    };
  }),

  selectCommunity: (communityId) => set((state) => {
    const community = state.communities.find(c => c.id === communityId);
    const firstChannelId = community && community.channels.length > 0 ? community.channels[0].id : null;
    
    const updates: Partial<AppState> = {
      activeCommunityId: communityId,
      activeDMId: null,
      viewMode: 'community',
      isMobileSidebarOpen: false
    };

    if (firstChannelId) {
      updates.activeChannelId = firstChannelId;
      const chatKey = `channel_${firstChannelId}`;
      updates.unreadCounts = { ...state.unreadCounts, [chatKey]: 0 };
    }

    return updates;
  }),

  selectChannel: (channelId) => set((state) => {
    const chatKey = `channel_${channelId}`;
    const newUnreads = { ...state.unreadCounts, [chatKey]: 0 };
    return {
      activeChannelId: channelId,
      unreadCounts: newUnreads,
      isMobileSidebarOpen: false
    };
  }),

  setHomeView: () => set({
    activeCommunityId: null,
    activeChannelId: null,
    activeDMId: null,
    viewMode: 'dms',
    isMobileSidebarOpen: false
  }),

  sendMessage: (content, replyTo, file) => {
    const state = get();
    const chatKey = state.viewMode === 'dms' 
      ? `dm_${state.activeDMId}` 
      : `channel_${state.activeChannelId}`;

    const newMessage: Message = {
      id: uuid(),
      senderId: state.currentUser.id,
      senderName: state.currentUser.name,
      senderAvatar: state.currentUser.avatar,
      content,
      timestamp: new Date().toISOString(),
      replyTo: replyTo ? {
        id: replyTo.id,
        senderName: replyTo.senderName,
        content: replyTo.content
      } : null,
      reactions: [],
      fileAttachment: file
    };

    const threadMessages = state.messages[chatKey] || [];
    set({
      messages: {
        ...state.messages,
        [chatKey]: [...threadMessages, newMessage]
      }
    });

    // Check if we need to reply via bot
    const isBotDM = state.viewMode === 'dms' && state.activeDMId === 'chattrix_bot';
    const isBotMention = state.viewMode === 'community' && (
      content.toLowerCase().includes('@chattrixbot')
    );

    if (isBotDM || isBotMention) {
      // Set typing state after delay
      setTimeout(() => {
        set((s) => {
          const currentTypers = s.typingUsers[chatKey] || [];
          if (!currentTypers.includes('chattrix_bot')) {
            return {
              typingUsers: {
                ...s.typingUsers,
                [chatKey]: [...currentTypers, 'chattrix_bot']
              }
            };
          }
          return {};
        });
      }, 500);

      // Send bot reply after another delay
      setTimeout(() => {
        // Turn off typing
        set((s) => ({
          typingUsers: {
            ...s.typingUsers,
            [chatKey]: (s.typingUsers[chatKey] || []).filter(id => id !== 'chattrix_bot')
          }
        }));

        // Pick random witty reply
        const replies = [
          "Hello! I am ChattrixBot. Did you know you can customize Nitro themes? Go to User Settings -> Appearance to switch them! 🎨",
          "Beep boop! 🤖 The screenshare feed is rendering a custom 3D wireframe cube on an HTML5 canvas right now!",
          "I am online and ready to help. Try out our Web Audio soundboard in the voice channel bar to play retro synthesizers! 🎺",
          "This Discord clone is looking pretty amazing, isn't it? Try selecting AMOLED Black for a sleek dark view. 💻",
          "Need a quick sound check? Quack, Ding, Airhorn, or Siren - pick one on the soundboard! 🦆",
          "I'm designed entirely in CSS and React. Low latency, zero backend overhead! ⚡",
          "That is very interesting. Let's head over to the voice lounge channel and do some pair programming! 🎙️",
          "Ping! Let me know if you need help with anything else in Chattrix. 🚀"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const botMessage: Message = {
          id: uuid(),
          senderId: 'chattrix_bot',
          senderName: 'ChattrixBot',
          senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChattrixBot',
          content: randomReply,
          timestamp: new Date().toISOString(),
          replyTo: null,
          reactions: []
        };

        set((s) => {
          const currentMsgs = s.messages[chatKey] || [];
          return {
            messages: {
              ...s.messages,
              [chatKey]: [...currentMsgs, botMessage]
            }
          };
        });
      }, 2000);
    }
  },

  editMessage: (messageId, content) => set((state) => {
    const chatKey = state.viewMode === 'dms' 
      ? `dm_${state.activeDMId}` 
      : `channel_${state.activeChannelId}`;

    const threadMessages = state.messages[chatKey] || [];
    const updatedMessages = threadMessages.map((m) => 
      m.id === messageId ? { ...m, content, isEdited: true } : m
    );

    return {
      messages: {
        ...state.messages,
        [chatKey]: updatedMessages
      }
    };
  }),

  deleteMessage: (messageId) => set((state) => {
    const chatKey = state.viewMode === 'dms' 
      ? `dm_${state.activeDMId}` 
      : `channel_${state.activeChannelId}`;

    const threadMessages = state.messages[chatKey] || [];
    const updatedMessages = threadMessages.map((m) => 
      m.id === messageId ? { ...m, content: 'This message was deleted', isDeleted: true, fileAttachment: undefined } : m
    );

    return {
      messages: {
        ...state.messages,
        [chatKey]: updatedMessages
      }
    };
  }),

  toggleReaction: (messageId, emoji) => set((state) => {
    const chatKey = state.viewMode === 'dms' 
      ? `dm_${state.activeDMId}` 
      : `channel_${state.activeChannelId}`;
    
    const threadMessages = state.messages[chatKey] || [];
    const userId = state.currentUser.id;

    const updatedMessages = threadMessages.map((m) => {
      if (m.id !== messageId) return m;

      let reactions = [...m.reactions];
      const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);

      if (existingReactionIndex > -1) {
        const reaction = reactions[existingReactionIndex];
        const userHasReacted = reaction.userIds.includes(userId);

        if (userHasReacted) {
          // Remove reaction
          const newUserIds = reaction.userIds.filter(id => id !== userId);
          if (newUserIds.length === 0) {
            // Remove emoji category if no users left
            reactions = reactions.filter(r => r.emoji !== emoji);
          } else {
            reactions[existingReactionIndex] = {
              ...reaction,
              count: reaction.count - 1,
              userIds: newUserIds
            };
          }
        } else {
          // Add user to existing reaction
          reactions[existingReactionIndex] = {
            ...reaction,
            count: reaction.count + 1,
            userIds: [...reaction.userIds, userId]
          };
        }
      } else {
        // Create new reaction category
        reactions.push({
          emoji,
          count: 1,
          userIds: [userId]
        });
      }

      return { ...m, reactions };
    });

    return {
      messages: {
        ...state.messages,
        [chatKey]: updatedMessages
      }
    };
  }),

  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  
  toggleMobileSidebar: (isOpen) => set((state) => ({ 
    isMobileSidebarOpen: isOpen !== undefined ? isOpen : !state.isMobileSidebarOpen 
  })),

  toggleAdminMode: () => set((state) => {
    const newRole = state.currentUser.role === 'Admin' ? 'Member' : 'Admin';
    return {
      currentUser: {
        ...state.currentUser,
        role: newRole,
        name: newRole === 'Admin' ? 'You (Admin)' : 'You'
      }
    };
  }),

  simulateTyping: (chatKey, isTyping) => set((state) => {
    // Determine which user is typing (pick mock user based on view mode)
    let typingUserId = 'alice'; // Default typing user
    
    if (state.viewMode === 'dms') {
      typingUserId = state.activeDMId || 'alice';
    } else {
      // For channel, pick a random community member who is not me and is online
      const community = state.communities.find(c => c.id === state.activeCommunityId);
      if (community) {
        const otherOnlineMembers = community.members.filter(
          mId => mId !== 'me' && state.users[mId]?.presence === 'online'
        );
        if (otherOnlineMembers.length > 0) {
          typingUserId = otherOnlineMembers[Math.floor(Math.random() * otherOnlineMembers.length)];
        }
      }
    }

    const currentTypers = state.typingUsers[chatKey] || [];
    let updatedTypers = [...currentTypers];

    if (isTyping) {
      if (!updatedTypers.includes(typingUserId)) {
        updatedTypers.push(typingUserId);
      }
    } else {
      updatedTypers = updatedTypers.filter(id => id !== typingUserId);
    }

    return {
      typingUsers: {
        ...state.typingUsers,
        [chatKey]: updatedTypers
      }
    };
  }),

  connectVoice: (channelId) => set({ activeVoiceChannelId: channelId }),
  disconnectVoice: () => set({ activeVoiceChannelId: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleDeafen: () => set((state) => {
    const nextDeafen = !state.isDeafened;
    return {
      isDeafened: nextDeafen,
      isMuted: nextDeafen ? true : state.isMuted
    };
  }),
  setUserProfileModalId: (userId) => set({ userProfileModalId: userId }),
  setSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),
  updateUserProfile: (name, statusText, avatar) => set((state) => ({
    currentUser: {
      ...state.currentUser,
      name,
      avatar,
      statusText
    }
  })),
  setTheme: (theme) => set({ theme }),
  toggleScreenshare: () => set((state) => ({ isScreensharing: !state.isScreensharing }))
}));
