export type Presence = 'online' | 'idle' | 'dnd' | 'offline';

export interface User {
  id: string;
  name: string;
  avatar: string;
  presence: Presence;
  statusText?: string;
  mutualServers?: string[];
  role?: 'Admin' | 'Mod' | 'Member';
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface FileAttachment {
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string; // ISO string
  replyTo: {
    id: string;
    senderName: string;
    content: string;
  } | null;
  reactions: Reaction[];
  isEdited?: boolean;
  isDeleted?: boolean;
  fileAttachment?: FileAttachment;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'announcements' | 'voice';
  description: string;
}

export interface Community {
  id: string;
  name: string;
  icon: string; // Circular icon letters (e.g. "DH") or image
  channels: Channel[];
  members: string[]; // User IDs who are in the community
}
