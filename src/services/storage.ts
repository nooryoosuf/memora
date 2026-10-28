import {
  WeddingEvent,
  Photo,
  Album,
  GuestbookEntry,
  UploadSession,
  EventStatistics,
  ModerationStatus,
  WeddingTheme,
} from '../types';
import { INITIAL_EVENTS, INITIAL_ALBUMS, INITIAL_PHOTOS, INITIAL_GUESTBOOK } from './sampleData';

const DB_KEYS = {
  EVENTS: 'memora_events_v2',
  ACTIVE_EVENT_ID: 'memora_active_event_id_v2',
  PHOTOS: 'memora_photos_v2',
  ALBUMS: 'memora_albums_v2',
  GUESTBOOK: 'memora_guestbook_v2',
  SESSIONS: 'memora_sessions_v2',
  CONTRIBUTOR_ID: 'memora_contributor_id_v2',
  AUTH_PREFIX: 'memora_auth_couple_v2_', // event-scoped auth e.g. memora_auth_couple_v2_evt_sophia_julian_2026
};

export const MEMORA_CHANGE_EVENT = 'memora_state_changed';
export function notifyStateChange() {
  window.dispatchEvent(new CustomEvent(MEMORA_CHANGE_EVENT));
}

class StorageService {
  private initialized = false;

  constructor() {
    this.initDatabase();
  }

  public initDatabase() {
    if (this.initialized) return;

    if (!localStorage.getItem(DB_KEYS.EVENTS)) {
      localStorage.setItem(DB_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(DB_KEYS.ACTIVE_EVENT_ID)) {
      localStorage.setItem(DB_KEYS.ACTIVE_EVENT_ID, INITIAL_EVENTS[0].id);
    }
    if (!localStorage.getItem(DB_KEYS.ALBUMS)) {
      localStorage.setItem(DB_KEYS.ALBUMS, JSON.stringify(INITIAL_ALBUMS));
    }
    if (!localStorage.getItem(DB_KEYS.PHOTOS)) {
      localStorage.setItem(DB_KEYS.PHOTOS, JSON.stringify(INITIAL_PHOTOS));
    }
    if (!localStorage.getItem(DB_KEYS.GUESTBOOK)) {
      localStorage.setItem(DB_KEYS.GUESTBOOK, JSON.stringify(INITIAL_GUESTBOOK));
    }
    if (!localStorage.getItem(DB_KEYS.SESSIONS)) {
      localStorage.setItem(
        DB_KEYS.SESSIONS,
        JSON.stringify([
          { id: 'sess_1', eventId: 'evt_sophia_julian_2026', contributorId: 'contrib_elena', guestName: 'Elena Rostova', albumTitle: "Elena Rostova's Memories", photoCount: 4, startedAt: '2026-10-24T16:40:00Z', completedAt: '2026-10-24T16:45:00Z', status: 'completed' },
          { id: 'sess_2', eventId: 'evt_sophia_julian_2026', contributorId: 'contrib_marco', guestName: 'Marco Bellini', albumTitle: "Marco Bellini's Memories", photoCount: 3, startedAt: '2026-10-24T17:00:00Z', completedAt: '2026-10-24T17:05:00Z', status: 'completed' },
          { id: 'sess_zara_1', eventId: 'evt_maya_liam_2026', contributorId: 'contrib_zara', guestName: 'Zara Chen', albumTitle: "Zara's Big Sur Snaps", photoCount: 2, startedAt: '2026-11-12T17:25:00Z', completedAt: '2026-11-12T17:30:00Z', status: 'completed' },
        ])
      );
    }

    this.initialized = true;
  }

  // --- Contributor Identity (Device Token) ---
  public getContributorId(): string {
    let id = localStorage.getItem(DB_KEYS.CONTRIBUTOR_ID);
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(DB_KEYS.CONTRIBUTOR_ID, id);
    }
    return id;
  }

  // --- Multi-Event Management ---
  public getAllEvents(): WeddingEvent[] {
    this.initDatabase();
    const str = localStorage.getItem(DB_KEYS.EVENTS);
    if (!str) return INITIAL_EVENTS;
    try {
      return JSON.parse(str);
    } catch {
      return INITIAL_EVENTS;
    }
  }

  public getEvent(): WeddingEvent {
    this.initDatabase();
    const activeId = localStorage.getItem(DB_KEYS.ACTIVE_EVENT_ID);
    const events = this.getAllEvents();
    const found = events.find((e) => e.id === activeId || e.slug === activeId);
    return found || events[0] || INITIAL_EVENTS[0];
  }

  public getEventBySlug(slug: string): WeddingEvent | undefined {
    return this.getAllEvents().find((e) => e.slug === slug || e.id === slug);
  }

  public setActiveEvent(eventIdOrSlug: string): WeddingEvent {
    const events = this.getAllEvents();
    const target = events.find((e) => e.id === eventIdOrSlug || e.slug === eventIdOrSlug);
    if (target) {
      localStorage.setItem(DB_KEYS.ACTIVE_EVENT_ID, target.id);
      notifyStateChange();
      return target;
    }
    return this.getEvent();
  }

  public createEvent(data: {
    partner1: string;
    partner2: string;
    weddingDate: string;
    venue: string;
    location: string;
    slug?: string;
    theme?: WeddingTheme;
    couplePin?: string;
    welcomeMessage?: string;
    coverImageUrl?: string;
  }): WeddingEvent {
    const events = this.getAllEvents();
    const baseSlug = (data.slug || `${data.partner1}-and-${data.partner2}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const id = 'evt_' + baseSlug + '_' + Date.now().toString(36);

    const newEvent: WeddingEvent = {
      id,
      slug: baseSlug,
      title: `${data.partner1} & ${data.partner2} Wedding`,
      coupleNames: {
        partner1: data.partner1.trim(),
        partner2: data.partner2.trim(),
      },
      weddingDate: data.weddingDate || new Date().toISOString(),
      venue: data.venue.trim(),
      location: data.location.trim(),
      coverImageUrl:
        data.coverImageUrl ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
      welcomeHeadline: 'Our favourite day, through your eyes.',
      welcomeMessage:
        data.welcomeMessage ||
        'Help us keep these memories forever. Share the moments you captured and make our wedding album even more special.',
      couplePin: data.couplePin?.trim() || '2026',
      allowGuestUploads: true,
      isGalleryPublic: false,
      requireModeration: false,
      theme: data.theme || 'tuscan-sage',
      totalPhotosCount: 0,
      totalUploadSessions: 0,
      uniqueGuestsCount: 0,
      createdAt: new Date().toISOString(),
    };

    events.unshift(newEvent);
    localStorage.setItem(DB_KEYS.EVENTS, JSON.stringify(events));
    this.setActiveEvent(newEvent.id);
    return newEvent;
  }

  public updateEvent(updates: Partial<WeddingEvent>): WeddingEvent {
    const current = this.getEvent();
    const events = this.getAllEvents();
    const idx = events.findIndex((e) => e.id === current.id);
    if (idx !== -1) {
      events[idx] = { ...events[idx], ...updates };
      localStorage.setItem(DB_KEYS.EVENTS, JSON.stringify(events));
      notifyStateChange();
      return events[idx];
    }
    return current;
  }

  public deleteEvent(eventId: string): boolean {
    const events = this.getAllEvents();
    if (events.length <= 1) {
      return false;
    }
    const updated = events.filter((e) => e.id !== eventId);
    localStorage.setItem(DB_KEYS.EVENTS, JSON.stringify(updated));

    const photos = this.getAllPhotosRaw().filter((p) => p.eventId !== eventId);
    localStorage.setItem(DB_KEYS.PHOTOS, JSON.stringify(photos));

    const albums = this.getAllAlbumsRaw().filter((a) => a.eventId !== eventId);
    localStorage.setItem(DB_KEYS.ALBUMS, JSON.stringify(albums));

    const guestbook = this.getAllGuestbookRaw().filter((g) => g.eventId !== eventId);
    localStorage.setItem(DB_KEYS.GUESTBOOK, JSON.stringify(guestbook));

    const sessions = this.getAllSessionsRaw().filter((s) => s.eventId !== eventId);
    localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(sessions));

    const currentActive = this.getEvent();
    if (currentActive.id === eventId) {
      this.setActiveEvent(updated[0].id);
    }

    notifyStateChange();
    return true;
  }

  // --- Couple Authentication (Event-Scoped) ---
  public isCoupleAuthenticated(eventId?: string): boolean {
    const targetEventId = eventId || this.getEvent().id;
    return localStorage.getItem(DB_KEYS.AUTH_PREFIX + targetEventId) === 'true';
  }

  public setCoupleAuthenticated(auth: boolean, eventId?: string) {
    const targetEventId = eventId || this.getEvent().id;
    if (auth) {
      localStorage.setItem(DB_KEYS.AUTH_PREFIX + targetEventId, 'true');
    } else {
      localStorage.removeItem(DB_KEYS.AUTH_PREFIX + targetEventId);
    }
    notifyStateChange();
  }

  public verifyPin(pin: string, eventId?: string): boolean {
    const event = eventId ? this.getAllEvents().find((e) => e.id === eventId) || this.getEvent() : this.getEvent();
    return event.couplePin === pin.trim();
  }

  // --- Guest Private Data Methods (Event-Scoped) ---
  public getMyPhotos(eventId?: string): Photo[] {
    const targetEventId = eventId || this.getEvent().id;
    const contributorId = this.getContributorId();
    const all = this.getAllPhotosRaw();
    return all
      .filter((p) => p.eventId === targetEventId && p.contributorId === contributorId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  public getMyAlbums(eventId?: string): Album[] {
    const targetEventId = eventId || this.getEvent().id;
    const contributorId = this.getContributorId();
    return this.getAlbums(targetEventId).filter((a) => a.contributorId === contributorId);
  }

  public getMyNotes(eventId?: string): GuestbookEntry[] {
    const targetEventId = eventId || this.getEvent().id;
    const contributorId = this.getContributorId();
    return this.getGuestbook('all', targetEventId).filter((g) => g.contributorId === contributorId);
  }

  public deleteMyPhoto(photoId: string): boolean {
    const contributorId = this.getContributorId();
    const all = this.getAllPhotosRaw();
    const target = all.find((p) => p.id === photoId && p.contributorId === contributorId);
    if (!target) return false;

    this.deletePhoto(photoId);
    return true;
  }

  // --- Photos Management (Event-Scoped) ---
  public getPhotos(options?: {
    eventId?: string;
    status?: ModerationStatus | 'all';
    albumId?: string;
    favoritesOnly?: boolean;
    search?: string;
  }): Photo[] {
    this.initDatabase();
    const str = localStorage.getItem(DB_KEYS.PHOTOS);
    if (!str) return [];
    try {
      const targetEventId = options?.eventId || this.getEvent().id;
      let list: Photo[] = JSON.parse(str).filter((p: Photo) => p.eventId === targetEventId);

      if (options?.status && options.status !== 'all') {
        list = list.filter((p) => p.status === options.status);
      } else if (!options?.status) {
        list = list.filter((p) => p.status === 'approved');
      }

      if (options?.albumId) {
        list = list.filter((p) => p.albumIds && p.albumIds.includes(options.albumId!));
      }

      if (options?.favoritesOnly) {
        list = list.filter((p) => p.isFavorite);
      }

      if (options?.search) {
        const q = options.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            (p.guestName && p.guestName.toLowerCase().includes(q)) ||
            (p.guestMessage && p.guestMessage.toLowerCase().includes(q)) ||
            (p.albumTitle && p.albumTitle.toLowerCase().includes(q)) ||
            (p.originalFilename && p.originalFilename.toLowerCase().includes(q))
        );
      }

      return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } catch {
      return [];
    }
  }

  public getAllPhotosRaw(): Photo[] {
    this.initDatabase();
    const str = localStorage.getItem(DB_KEYS.PHOTOS);
    return str ? JSON.parse(str) : [];
  }

  public savePhotosRaw(photos: Photo[]) {
    localStorage.setItem(DB_KEYS.PHOTOS, JSON.stringify(photos));
    this.syncAlbumCounts();
    notifyStateChange();
  }

  /**
   * Guest Photo Submission for this specific event:
   * Creates or updates this guest's personal album (e.g. "Noor's Memories")
   */
  public addPhotosBatch(
    photosData: Array<{
      url: string;
      thumbnailUrl?: string;
      originalFilename: string;
      fileSize: number;
      dimensions?: { width: number; height: number };
    }>,
    guestInfo?: {
      guestName?: string;
      albumTitle?: string;
      guestMessage?: string;
    },
    eventId?: string
  ): { count: number; photos: Photo[]; sessionId: string; album: Album } {
    const event = eventId ? this.getAllEvents().find((e) => e.id === eventId) || this.getEvent() : this.getEvent();
    const contributorId = this.getContributorId();
    const sessionId = 'sess_' + Date.now().toString(36);
    const nowIso = new Date().toISOString();
    const status: ModerationStatus = event.requireModeration ? 'pending' : 'approved';

    const albumTitle =
      guestInfo?.albumTitle?.trim() ||
      (guestInfo?.guestName?.trim() ? `${guestInfo.guestName.trim()}'s Memories` : 'Guest Memories');
    const guestName = guestInfo?.guestName?.trim() || undefined;

    // 1. Create or Find the Guest Album for this event
    const albums = this.getAllAlbumsRaw();
    let guestAlbum = albums.find(
      (a) =>
        a.eventId === event.id &&
        a.type === 'guest' &&
        a.contributorId === contributorId &&
        a.title.toLowerCase() === albumTitle.toLowerCase()
    );

    if (!guestAlbum) {
      guestAlbum = {
        id: 'alb_guest_' + Date.now().toString(36),
        eventId: event.id,
        title: albumTitle,
        description: guestInfo?.guestMessage?.trim() || `Memories shared in "${albumTitle}"`,
        coverPhotoUrl: photosData[0]?.thumbnailUrl || photosData[0]?.url,
        createdAt: nowIso,
        photoCount: photosData.length,
        type: 'guest',
        guestName,
        contributorId,
      };
      albums.unshift(guestAlbum);
    } else {
      guestAlbum.coverPhotoUrl = photosData[0]?.thumbnailUrl || photosData[0]?.url || guestAlbum.coverPhotoUrl;
      guestAlbum.photoCount += photosData.length;
      if (guestInfo?.guestMessage?.trim()) {
        guestAlbum.description = guestInfo.guestMessage.trim();
      }
    }
    localStorage.setItem(DB_KEYS.ALBUMS, JSON.stringify(albums));

    // 2. Add photos tagged with this event and album
    const currentPhotos = this.getAllPhotosRaw();
    const newPhotos: Photo[] = [];

    for (let i = 0; i < photosData.length; i++) {
      const item = photosData[i];
      const photoId = 'pho_' + Date.now().toString(36) + '_' + i;
      const albumIds: string[] = [guestAlbum.id];

      const p: Photo = {
        id: photoId,
        eventId: event.id,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || item.url,
        originalFilename: item.originalFilename,
        fileSize: item.fileSize,
        dimensions: item.dimensions,
        guestName,
        guestMessage: i === 0 && guestInfo?.guestMessage?.trim() ? guestInfo.guestMessage.trim() : undefined,
        albumTitle,
        sessionId,
        contributorId,
        status,
        isFavorite: false,
        albumIds,
        uploadedAt: nowIso,
      };
      newPhotos.push(p);
    }

    const updatedList = [...newPhotos, ...currentPhotos];
    localStorage.setItem(DB_KEYS.PHOTOS, JSON.stringify(updatedList));

    // 3. Record upload session
    const sessions = this.getUploadSessions(event.id);
    const newSession: UploadSession = {
      id: sessionId,
      eventId: event.id,
      contributorId,
      guestName,
      albumTitle,
      photoCount: newPhotos.length,
      startedAt: nowIso,
      completedAt: nowIso,
      status: 'completed',
    };
    sessions.unshift(newSession);
    const allSessions = this.getAllSessionsRaw().filter((s) => s.id !== sessionId);
    allSessions.unshift(newSession);
    localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(allSessions));

    // 4. Record guestbook message if provided
    if (guestInfo?.guestMessage && guestInfo.guestMessage.trim()) {
      this.addGuestbookEntry({
        guestName: guestName || albumTitle,
        message: guestInfo.guestMessage.trim(),
        photoId: newPhotos[0].id,
        photoUrl: newPhotos[0].thumbnailUrl || newPhotos[0].url,
        sessionId,
      }, event.id);
    }

    this.syncAlbumCounts();
    notifyStateChange();

    return { count: newPhotos.length, photos: newPhotos, sessionId, album: guestAlbum };
  }

  public updatePhoto(photoId: string, updates: Partial<Photo>): Photo | undefined {
    const all = this.getAllPhotosRaw();
    const idx = all.findIndex((p) => p.id === photoId);
    if (idx === -1) return undefined;

    all[idx] = { ...all[idx], ...updates };
    this.savePhotosRaw(all);
    return all[idx];
  }

  public toggleFavorite(photoId: string): boolean {
    const all = this.getAllPhotosRaw();
    const idx = all.findIndex((p) => p.id === photoId);
    if (idx === -1) return false;

    all[idx].isFavorite = !all[idx].isFavorite;
    this.savePhotosRaw(all);
    return all[idx].isFavorite;
  }

  public moderatePhoto(photoId: string, status: ModerationStatus) {
    this.updatePhoto(photoId, { status });
  }

  public deletePhoto(photoId: string) {
    const all = this.getAllPhotosRaw().filter((p) => p.id !== photoId);
    this.savePhotosRaw(all);
  }

  public batchModerate(photoIds: string[], status: ModerationStatus) {
    const all = this.getAllPhotosRaw();
    for (const p of all) {
      if (photoIds.includes(p.id)) {
        p.status = status;
      }
    }
    this.savePhotosRaw(all);
  }

  public batchDelete(photoIds: string[]) {
    const all = this.getAllPhotosRaw().filter((p) => !photoIds.includes(p.id));
    this.savePhotosRaw(all);
  }

  public batchAssignToAlbum(photoIds: string[], albumId: string) {
    const all = this.getAllPhotosRaw();
    for (const p of all) {
      if (photoIds.includes(p.id)) {
        if (!p.albumIds) p.albumIds = [];
        if (!p.albumIds.includes(albumId)) {
          p.albumIds.push(albumId);
        }
      }
    }
    this.savePhotosRaw(all);
  }

  // --- Albums (Event-Scoped) ---
  public getAllAlbumsRaw(): Album[] {
    this.initDatabase();
    const str = localStorage.getItem(DB_KEYS.ALBUMS);
    return str ? JSON.parse(str) : [];
  }

  public getAlbums(eventId?: string): Album[] {
    this.initDatabase();
    const targetEventId = eventId || this.getEvent().id;
    const albums = this.getAllAlbumsRaw().filter((a) => a.eventId === targetEventId);
    const photos = this.getAllPhotosRaw().filter((p) => p.eventId === targetEventId);

    return albums.map((alb) => {
      const matchingPhotos = photos.filter(
        (p) => p.albumIds && p.albumIds.includes(alb.id) && p.status !== 'hidden'
      );
      let coverUrl = alb.coverPhotoUrl;
      if (!coverUrl && matchingPhotos.length > 0) {
        coverUrl = matchingPhotos[0].thumbnailUrl || matchingPhotos[0].url;
      }
      return {
        ...alb,
        photoCount: matchingPhotos.length,
        coverPhotoUrl: coverUrl,
      };
    });
  }

  public createAlbum(
    title: string,
    description?: string,
    coverPhotoUrl?: string,
    type: 'curated' | 'guest' = 'curated',
    eventId?: string
  ): Album {
    const event = eventId ? this.getAllEvents().find((e) => e.id === eventId) || this.getEvent() : this.getEvent();
    const allAlbums = this.getAllAlbumsRaw();
    const newAlbum: Album = {
      id: 'alb_' + Date.now().toString(36),
      eventId: event.id,
      title: title.trim(),
      description: description?.trim() || undefined,
      coverPhotoUrl,
      createdAt: new Date().toISOString(),
      photoCount: 0,
      type,
    };
    allAlbums.push(newAlbum);
    localStorage.setItem(DB_KEYS.ALBUMS, JSON.stringify(allAlbums));
    notifyStateChange();
    return newAlbum;
  }

  public updateAlbum(albumId: string, updates: Partial<Album>): Album | undefined {
    const albums = this.getAllAlbumsRaw();
    const idx = albums.findIndex((a) => a.id === albumId);
    if (idx === -1) return undefined;

    albums[idx] = { ...albums[idx], ...updates };
    localStorage.setItem(DB_KEYS.ALBUMS, JSON.stringify(albums));
    notifyStateChange();
    return albums[idx];
  }

  public deleteAlbum(albumId: string) {
    const albums = this.getAllAlbumsRaw().filter((a) => a.id !== albumId);
    localStorage.setItem(DB_KEYS.ALBUMS, JSON.stringify(albums));

    const photos = this.getAllPhotosRaw();
    for (const p of photos) {
      if (p.albumIds && p.albumIds.includes(albumId)) {
        p.albumIds = p.albumIds.filter((id) => id !== albumId);
      }
    }
    this.savePhotosRaw(photos);
  }

  public removePhotosFromAlbum(albumId: string, photoIds: string[]) {
    const all = this.getAllPhotosRaw();
    for (const p of all) {
      if (photoIds.includes(p.id) && p.albumIds) {
        p.albumIds = p.albumIds.filter((id) => id !== albumId);
      }
    }
    this.savePhotosRaw(all);
  }

  private syncAlbumCounts() {
    const albums = this.getAllAlbumsRaw();
    localStorage.setItem(DB_KEYS.ALBUMS, JSON.stringify(albums));
  }

  // --- Guestbook (Event-Scoped) ---
  public getAllGuestbookRaw(): GuestbookEntry[] {
    this.initDatabase();
    const str = localStorage.getItem(DB_KEYS.GUESTBOOK);
    return str ? JSON.parse(str) : [];
  }

  public getGuestbook(status?: ModerationStatus | 'all', eventId?: string): GuestbookEntry[] {
    this.initDatabase();
    const targetEventId = eventId || this.getEvent().id;
    const all = this.getAllGuestbookRaw().filter((g) => g.eventId === targetEventId);

    let list = all;
    if (status && status !== 'all') {
      list = list.filter((g) => g.status === status);
    } else if (!status) {
      list = list.filter((g) => g.status === 'approved');
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addGuestbookEntry(
    entry: {
      guestName: string;
      message: string;
      photoId?: string;
      photoUrl?: string;
      sessionId?: string;
    },
    eventId?: string
  ): GuestbookEntry {
    const all = this.getAllGuestbookRaw();
    const event = eventId ? this.getAllEvents().find((e) => e.id === eventId) || this.getEvent() : this.getEvent();
    const contributorId = this.getContributorId();

    const newEntry: GuestbookEntry = {
      id: 'gb_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
      eventId: event.id,
      guestName: entry.guestName.trim() || 'A Guest',
      message: entry.message.trim(),
      photoId: entry.photoId,
      photoUrl: entry.photoUrl,
      sessionId: entry.sessionId,
      contributorId,
      createdAt: new Date().toISOString(),
      status: 'approved',
    };
    all.unshift(newEntry);
    localStorage.setItem(DB_KEYS.GUESTBOOK, JSON.stringify(all));
    notifyStateChange();
    return newEntry;
  }

  public moderateGuestbookEntry(entryId: string, status: ModerationStatus) {
    const all = this.getAllGuestbookRaw();
    const idx = all.findIndex((g) => g.id === entryId);
    if (idx !== -1) {
      all[idx].status = status;
      localStorage.setItem(DB_KEYS.GUESTBOOK, JSON.stringify(all));
      notifyStateChange();
    }
  }

  public deleteGuestbookEntry(entryId: string) {
    const all = this.getAllGuestbookRaw().filter((g) => g.id !== entryId);
    localStorage.setItem(DB_KEYS.GUESTBOOK, JSON.stringify(all));
    notifyStateChange();
  }

  // --- Sessions (Event-Scoped) ---
  public getAllSessionsRaw(): UploadSession[] {
    this.initDatabase();
    const str = localStorage.getItem(DB_KEYS.SESSIONS);
    return str ? JSON.parse(str) : [];
  }

  public getUploadSessions(eventId?: string): UploadSession[] {
    const targetEventId = eventId || this.getEvent().id;
    return this.getAllSessionsRaw().filter((s) => s.eventId === targetEventId);
  }

  // --- Accurate Statistics (Event-Scoped) ---
  public getEventStatistics(eventId?: string): EventStatistics {
    const targetEventId = eventId || this.getEvent().id;
    const photos = this.getAllPhotosRaw().filter((p) => p.eventId === targetEventId);
    const guestbook = this.getAllGuestbookRaw().filter((g) => g.eventId === targetEventId);
    const albums = this.getAlbums(targetEventId);
    const sessions = this.getUploadSessions(targetEventId);

    const approvedPhotos = photos.filter((p) => p.status === 'approved').length;
    const pendingPhotos = photos.filter((p) => p.status === 'pending').length;
    const hiddenPhotos = photos.filter((p) => p.status === 'hidden').length;
    const favoritesCount = photos.filter((p) => p.isFavorite).length;

    const guestAlbums = albums.filter((a) => a.type === 'guest');
    const curatedAlbums = albums.filter((a) => a.type !== 'guest');

    const uniqueContributorIds = new Set(photos.map((p) => p.contributorId).filter(Boolean));
    const uniqueGuests = Math.max(uniqueContributorIds.size, guestAlbums.length);

    const activity: EventStatistics['recentActivity'] = [];

    for (const s of sessions.slice(0, 8)) {
      activity.push({
        id: 'act_' + s.id,
        type: 'upload',
        description: s.albumTitle
          ? `Album "${s.albumTitle}" created with ${s.photoCount} photos`
          : s.guestName
          ? `${s.guestName} shared ${s.photoCount} photos`
          : `A guest shared ${s.photoCount} memories`,
        guestName: s.guestName,
        photoCount: s.photoCount,
        timestamp: s.completedAt || s.startedAt,
      });
    }

    for (const g of guestbook.slice(0, 5)) {
      activity.push({
        id: 'act_' + g.id,
        type: 'message',
        description: `${g.guestName} left a warm wish in the guestbook`,
        guestName: g.guestName,
        timestamp: g.createdAt,
        thumbnailUrl: g.photoUrl,
      });
    }

    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      totalPhotos: photos.length,
      approvedPhotos,
      pendingPhotos,
      hiddenPhotos,
      uniqueGuests,
      uploadSessions: sessions.length,
      totalAlbums: albums.length,
      guestAlbumsCount: guestAlbums.length,
      curatedAlbumsCount: curatedAlbums.length,
      guestbookMessages: guestbook.length,
      favoritesCount,
      recentActivity: activity.slice(0, 10),
    };
  }

  public resetToSampleData() {
    localStorage.removeItem(DB_KEYS.EVENTS);
    localStorage.removeItem(DB_KEYS.ACTIVE_EVENT_ID);
    localStorage.removeItem(DB_KEYS.PHOTOS);
    localStorage.removeItem(DB_KEYS.ALBUMS);
    localStorage.removeItem(DB_KEYS.GUESTBOOK);
    localStorage.removeItem(DB_KEYS.SESSIONS);
    this.initialized = false;
    this.initDatabase();
    notifyStateChange();
  }
}

export const storage = new StorageService();
