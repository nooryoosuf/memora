export type ModerationStatus = 'approved' | 'pending' | 'hidden';

export type WeddingTheme =
  | 'tuscan-sage'
  | 'black-champagne'
  | 'romantic-blush'
  | 'mediterranean-blue'
  | 'terracotta-earth';

export interface ThemeConfig {
  id: WeddingTheme;
  name: string;
  primary: string; // Hex or CSS color
  primaryHover: string;
  accent: string;
  bgLight: string;
  bgCard: string;
  badgeBg: string;
  badgeText: string;
}

export interface CoupleNames {
  partner1: string;
  partner2: string;
}

export interface WeddingEvent {
  id: string;
  slug: string;
  title: string;
  coupleNames: CoupleNames;
  weddingDate: string; // ISO string e.g. "2026-10-24"
  venue: string;
  location: string;
  coverImageUrl: string;
  welcomeHeadline: string;
  welcomeMessage: string;
  couplePin: string; // PIN for couple dashboard access
  allowGuestUploads: boolean;
  isGalleryPublic: boolean;
  requireModeration: boolean;
  theme: WeddingTheme;
  totalPhotosCount: number;
  totalUploadSessions: number;
  uniqueGuestsCount: number;
  createdAt: string;
}

export interface Photo {
  id: string;
  eventId: string;
  url: string; // Object URL or static URL
  thumbnailUrl?: string;
  originalFilename: string;
  fileSize: number; // in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  guestName?: string;
  guestMessage?: string;
  albumTitle?: string;
  sessionId: string;
  contributorId: string;
  status: ModerationStatus;
  isFavorite: boolean;
  albumIds: string[];
  uploadedAt: string; // ISO date string
}

export interface Album {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  coverPhotoId?: string;
  coverPhotoUrl?: string;
  createdAt: string;
  photoCount: number;
  type?: 'curated' | 'guest'; // 'guest' = album created by a specific guest (e.g. "Noor's Memories")
  guestName?: string;
  contributorId?: string;
}

export interface GuestbookEntry {
  id: string;
  eventId: string;
  guestName: string;
  message: string;
  photoId?: string;
  photoUrl?: string;
  sessionId?: string;
  contributorId?: string;
  createdAt: string;
  status: ModerationStatus;
}

export interface UploadSession {
  id: string;
  eventId: string;
  contributorId: string;
  guestName?: string;
  albumTitle?: string;
  photoCount: number;
  startedAt: string;
  completedAt: string;
  status: 'completed' | 'partial' | 'failed';
}

export interface Contributor {
  id: string;
  eventId: string;
  guestName?: string;
  firstUploadedAt: string;
  lastUploadedAt: string;
  totalPhotos: number;
}

export interface EventStatistics {
  totalPhotos: number;
  approvedPhotos: number;
  pendingPhotos: number;
  hiddenPhotos: number;
  uniqueGuests: number;
  uploadSessions: number;
  totalAlbums: number;
  guestAlbumsCount: number;
  curatedAlbumsCount: number;
  guestbookMessages: number;
  favoritesCount: number;
  recentActivity: Array<{
    id: string;
    type: 'upload' | 'message' | 'album';
    description: string;
    guestName?: string;
    photoCount?: number;
    timestamp: string;
    thumbnailUrl?: string;
  }>;
}

export interface UploadFileItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  width?: number;
  height?: number;
}
