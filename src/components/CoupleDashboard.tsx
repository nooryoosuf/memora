import React, { useState, useEffect } from 'react';
import { WeddingEvent, Photo, Album, GuestbookEntry, EventStatistics, WeddingTheme } from '../types';
import { storage } from '../services/storage';
import { formatDate, formatDateTime, formatFileSize } from '../utils/image';
import { QRCodeGenerator } from '../utils/qr';
import { SimpleZip, downloadPhotosZip } from '../utils/zip';
import { THEMES } from '../utils/theme';
import { PrintableTableSign } from './PrintableTableSign';
import {
  Shield,
  KeyRound,
  LogOut,
  Camera,
  Users,
  Image as ImageIcon,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Clock,
  EyeOff,
  Download,
  QrCode,
  Printer,
  Copy,
  Check,
  Settings,
  AlertCircle,
  Sparkles,
  Heart,
  ChevronRight,
  ExternalLink,
  Layers,
  Archive,
  Plus,
  Palette,
  X,
} from 'lucide-react';

interface CoupleDashboardProps {
  event: WeddingEvent;
  photos: Photo[];
  albums: Album[];
  guestbook: GuestbookEntry[];
  isCoupleAuth: boolean;
  onRefresh: () => void;
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  allEvents?: WeddingEvent[];
  onSelectEvent?: (event: WeddingEvent) => void;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({
  event,
  photos,
  albums,
  guestbook,
  isCoupleAuth,
  onRefresh,
  onNavigate,
  onOpenUpload,
  allEvents,
  onSelectEvent,
}) => {
  // Authentication PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab: 'overview' | 'moderation' | 'sharing' | 'export' | 'settings' | 'table_sign'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'moderation' | 'sharing' | 'export' | 'settings' | 'table_sign'
  >('overview');

  // Stats
  const [stats, setStats] = useState<EventStatistics>(storage.getEventStatistics());

  // Sharing tab state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Bulk Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [selectedExportAlbumId, setSelectedExportAlbumId] = useState<string>('all');

  // Settings form state
  const [partner1, setPartner1] = useState(event.coupleNames.partner1);
  const [partner2, setPartner2] = useState(event.coupleNames.partner2);
  const [venue, setVenue] = useState(event.venue);
  const [location, setLocation] = useState(event.location);
  const [weddingDate, setWeddingDate] = useState(event.weddingDate.substring(0, 10));
  const [welcomeMessage, setWelcomeMessage] = useState(event.welcomeMessage);
  const [newPin, setNewPin] = useState(event.couplePin);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Inside Couple Suite: Create another wedding state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createP1, setCreateP1] = useState('');
  const [createP2, setCreateP2] = useState('');
  const [createDate, setCreateDate] = useState('2026-11-20');
  const [createVenue, setCreateVenue] = useState('');
  const [createLocation, setCreateLocation] = useState('');
  const [createTheme, setCreateTheme] = useState<WeddingTheme>('tuscan-sage');
  const [createPin, setCreatePin] = useState('2026');

  const eventUrl = `${window.location.origin}${window.location.pathname}#/w/${event.slug}`;

  const handleCreateWeddingFromSuite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createP1.trim() || !createP2.trim()) return;

    const newEv = storage.createEvent({
      partner1: createP1.trim(),
      partner2: createP2.trim(),
      weddingDate: new Date(createDate).toISOString(),
      venue: createVenue.trim() || 'Wedding Venue',
      location: createLocation.trim() || 'Wedding Destination',
      theme: createTheme,
      couplePin: createPin.trim() || '2026',
    });

    setShowCreateModal(false);
    setCreateP1('');
    setCreateP2('');
    setCreateVenue('');
    setCreateLocation('');
    onRefresh();
    if (onSelectEvent) {
      onSelectEvent(newEv);
    }
  };

  useEffect(() => {
    setStats(storage.getEventStatistics(event.id));
    QRCodeGenerator.toDataURL(eventUrl, 512).then((url) => setQrDataUrl(url));
  }, [eventUrl, event.id, photos, albums, guestbook]);

  // Handle PIN Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (storage.verifyPin(pinInput, event.id)) {
      storage.setCoupleAuthenticated(true, event.id);
      setPinError(false);
      setPinInput('');
      onRefresh();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    storage.setCoupleAuthenticated(false, event.id);
    onRefresh();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleUploads = () => {
    storage.updateEvent({ allowGuestUploads: !event.allowGuestUploads });
    onRefresh();
  };

  const handleTogglePublicGallery = () => {
    storage.updateEvent({ isGalleryPublic: !event.isGalleryPublic });
    onRefresh();
  };

  const handleToggleModeration = () => {
    storage.updateEvent({ requireModeration: !event.requireModeration });
    onRefresh();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateEvent({
      coupleNames: { partner1, partner2 },
      venue,
      location,
      weddingDate: new Date(weddingDate).toISOString(),
      welcomeMessage,
      couplePin: newPin.trim(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    onRefresh();
  };

  const handleResetData = () => {
    if (
      confirm(
        'Reset event database back to initial sample photographs and albums? Any custom uploads will be replaced.'
      )
    ) {
      storage.resetToSampleData();
      onRefresh();
    }
  };

  // Bulk ZIP Exports: Separate handlers for All, Favorites, and Albums
  const handleDownloadAll = async () => {
    const approvedPhotos = photos.filter((p) => p.status === 'approved');
    if (approvedPhotos.length === 0) {
      alert('No approved photos available to download yet.');
      return;
    }
    setIsExporting(true);
    await downloadPhotosZip(
      approvedPhotos,
      `${event.slug}-all-memories.zip`,
      {
        onProgress: (text) => setExportProgress(text),
        includeGuestbook: true,
        guestbookEntries: guestbook,
        eventInfo: {
          partner1: event.coupleNames.partner1,
          partner2: event.coupleNames.partner2,
          date: event.weddingDate,
          venue: event.venue,
        },
      }
    );
    setIsExporting(false);
    setExportProgress('');
  };

  const handleDownloadFavorites = async () => {
    const favs = photos.filter((p) => p.isFavorite);
    if (favs.length === 0) {
      alert('You have not marked any photos as favorites yet.');
      return;
    }
    setIsExporting(true);
    await downloadPhotosZip(
      favs,
      `${event.slug}-favorites.zip`,
      {
        onProgress: (text) => setExportProgress(text),
      }
    );
    setIsExporting(false);
    setExportProgress('');
  };

  const handleDownloadAlbum = async (album: Album) => {
    const albumPhotos = photos.filter(
      (p) => p.albumIds && p.albumIds.includes(album.id)
    );
    if (albumPhotos.length === 0) {
      alert(`The "${album.title}" album has no photos to download.`);
      return;
    }
    setIsExporting(true);
    const safeTitle = album.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await downloadPhotosZip(
      albumPhotos,
      `${event.slug}-album-${safeTitle}.zip`,
      {
        onProgress: (text) => setExportProgress(`[${album.title}] ${text}`),
      }
    );
    setIsExporting(false);
    setExportProgress('');
  };

  // If table sign preview is active
  if (activeTab === 'table_sign') {
    return <PrintableTableSign event={event} onBack={() => setActiveTab('sharing')} />;
  }

  // ================= PIN LOCK SCREEN =================
  if (!isCoupleAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn">
        <div className="bg-ivory-50 rounded-3xl border border-charcoal-200 p-8 shadow-lift text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-900 text-champagne-300 flex items-center justify-center mx-auto shadow-subtle">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-3xl text-charcoal-900 font-normal">
              Couple's Dashboard
            </h1>
            <p className="text-xs text-charcoal-500">
              Private event management, statistics, and photo moderation
            </p>
          </div>

          {pinError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>Incorrect PIN. Please try again.</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-charcoal-700">
                Enter Couple Security PIN
              </label>
              <input
                type="password"
                placeholder="Enter 4-digit PIN (default: 2026)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="w-full p-3 text-center tracking-widest text-lg rounded-xl border border-charcoal-200 bg-white font-mono focus:outline-none focus:border-sage-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white text-sm font-medium transition-all shadow-subtle"
            >
              Access Dashboard
            </button>
          </form>

          <p className="text-[11px] text-charcoal-400">
            Default event PIN is <code className="bg-ivory-200 px-1.5 py-0.5 rounded text-charcoal-800 font-bold">2026</code>. You can change this anytime in Settings.
          </p>
        </div>
      </div>
    );
  }

  // ================= AUTHENTICATED DASHBOARD =================
  const pendingPhotos = photos.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fadeIn">
      
      {/* Dashboard Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-sage-600 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Private Management Suite</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal mt-1">
            {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}'s Event Hub
          </h1>
          <p className="text-xs text-charcoal-500">
            {event.venue} &bull; {formatDate(event.weddingDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-charcoal-900 text-white hover:bg-charcoal-800 text-xs font-medium transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5 text-champagne-300" />
            <span>+ New Wedding</span>
          </button>

          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-full border border-charcoal-300 bg-white text-xs text-charcoal-800 hover:bg-ivory-100 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>All Memories Gallery</span>
          </button>

          <button
            onClick={() => onNavigate('portal')}
            className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-full border border-charcoal-300 bg-white text-xs text-charcoal-800 hover:bg-ivory-100 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-sage-600" />
            <span>Guest Portal</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-full border border-red-200 bg-red-50/50 text-xs text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Primary Answers Bar: 3 Core Questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question 1: How many memories? */}
        <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-5 shadow-subtle space-y-2">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            1. Memories Collected
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-4xl text-charcoal-950 font-normal">
              {stats.totalPhotos}
            </span>
            <span className="text-xs text-charcoal-500">photos preserved</span>
          </div>
          <p className="text-xs text-charcoal-600">
            {stats.approvedPhotos} approved &bull; {stats.favoritesCount} favorited &bull; {stats.totalAlbums} albums
          </p>
        </div>

        {/* Question 2: How many people? */}
        <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-5 shadow-subtle space-y-2">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            2. Contributing Guests
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-4xl text-charcoal-950 font-normal">
              {stats.uniqueGuests}
            </span>
            <span className="text-xs text-charcoal-500">estimated guests</span>
          </div>
          <p className="text-xs text-charcoal-600">
            Across {stats.uploadSessions} successful upload sessions (device-scoped)
          </p>
        </div>

        {/* Question 3: What is happening? */}
        <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-5 shadow-subtle space-y-2">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            3. Wedding Gallery Status
          </p>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${event.allowGuestUploads ? 'bg-sage-500' : 'bg-red-500'}`} />
            <span className="font-serif text-xl text-charcoal-900 font-medium">
              {event.allowGuestUploads ? 'Accepting Uploads' : 'Uploads Closed'}
            </span>
          </div>
          <p className="text-xs text-charcoal-600">
            {pendingPhotos.length > 0 ? (
              <span className="text-champagne-600 font-semibold">{pendingPhotos.length} photos awaiting moderation</span>
            ) : (
              'All guest uploads approved and live'
            )}
          </p>
        </div>
      </div>

      {/* Dashboard Sub-Navigation Tabs */}
      <div className="border-b border-charcoal-200 flex items-center space-x-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-charcoal-900 text-charcoal-900 font-semibold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Overview &amp; Activity
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap flex items-center space-x-1.5 transition-colors ${
            activeTab === 'moderation'
              ? 'border-charcoal-900 text-charcoal-900 font-semibold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <span>Moderation Queue</span>
          {pendingPhotos.length > 0 && (
            <span className="px-1.5 py-0.2 bg-champagne-500 text-white text-[10px] rounded-full">
              {pendingPhotos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sharing')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'sharing'
              ? 'border-charcoal-900 text-charcoal-900 font-semibold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          QR Code &amp; Event Sharing
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'export'
              ? 'border-charcoal-900 text-charcoal-900 font-semibold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Bulk Export (.ZIP)
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'settings'
              ? 'border-charcoal-900 text-charcoal-900 font-semibold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Event Settings
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW & ACTIVITY FEED ================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Action Cards & Key Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-xl text-charcoal-900 font-normal">
                Quick Gallery Controls
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-charcoal-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal-800">Guest Uploads</span>
                    <button
                      onClick={handleToggleUploads}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        event.allowGuestUploads
                          ? 'bg-sage-100 text-sage-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {event.allowGuestUploads ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-[11px] text-charcoal-500">
                    Control whether guests can upload new photographs from their phones.
                  </p>
                </div>

                <div className="p-4 bg-white border border-charcoal-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal-800">Moderation Requirement</span>
                    <button
                      onClick={handleToggleModeration}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        event.requireModeration
                          ? 'bg-champagne-100 text-champagne-800'
                          : 'bg-ivory-200 text-charcoal-600'
                      }`}
                    >
                      {event.requireModeration ? 'Review First' : 'Auto-Approve'}
                    </button>
                  </div>
                  <p className="text-[11px] text-charcoal-500">
                    If enabled, new photos require your approval before appearing publicly.
                  </p>
                </div>
              </div>
            </div>

            {/* Curated & Guest Albums Overview */}
            <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-charcoal-900 font-normal">
                  Guest &amp; Curated Albums ({albums.length})
                </h3>
                <button
                  onClick={() => onNavigate('albums')}
                  className="text-xs text-sage-700 hover:underline font-medium"
                >
                  Manage All Albums
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {albums.map((alb) => (
                  <div
                    key={alb.id}
                    onClick={() => onNavigate('albums')}
                    className="p-3 bg-white border border-charcoal-200 rounded-xl cursor-pointer hover:border-charcoal-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-sage-700 font-medium">
                        {alb.type === 'guest' ? 'Guest Album' : 'Curated'}
                      </span>
                      <span className="text-[10px] text-charcoal-400">{alb.photoCount} photos</span>
                    </div>
                    <p className="text-xs font-semibold text-charcoal-900 truncate mt-1">{alb.title}</p>
                    {alb.guestName && (
                      <p className="text-[10px] text-charcoal-500 truncate">By {alb.guestName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Confirmed Recent Activity Feed */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">
              Recent Contributions
            </h3>

            <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-4 divide-y divide-charcoal-100 max-h-[500px] overflow-y-auto">
              {stats.recentActivity.length === 0 ? (
                <p className="text-xs text-charcoal-500 text-center py-6">No recent activity yet.</p>
              ) : (
                stats.recentActivity.map((act) => (
                  <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center shrink-0 mt-0.5">
                      {act.type === 'upload' ? <Camera className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900">{act.description}</p>
                      <p className="text-[10px] text-charcoal-400 mt-0.5">
                        {formatDateTime(act.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3.5 bg-ivory-100 rounded-xl text-[11px] text-charcoal-500 leading-relaxed border border-charcoal-200/60">
              <strong>Accurate Tracking:</strong> Guest counts reflect distinct contributor tokens recorded upon successful uploads.
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MODERATION QUEUE ================= */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-charcoal-900">
              Upload Moderation Queue ({pendingPhotos.length} pending)
            </h3>
            {pendingPhotos.length > 0 && (
              <button
                onClick={() => {
                  storage.batchModerate(pendingPhotos.map((p) => p.id), 'approved');
                  onRefresh();
                }}
                className="px-4 py-2 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium"
              >
                Approve All Pending
              </button>
            )}
          </div>

          {pendingPhotos.length === 0 ? (
            <div className="text-center py-16 bg-ivory-50 rounded-2xl border border-charcoal-200 p-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-sage-600 mx-auto" />
              <p className="font-serif text-xl text-charcoal-800">All uploads are approved</p>
              <p className="text-xs text-charcoal-500">
                New photos uploaded by guests will appear here if moderation is enabled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pendingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl overflow-hidden border border-charcoal-200 shadow-subtle p-3 space-y-2"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-charcoal-100">
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.originalFilename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-charcoal-900 truncate">
                      {photo.guestName || 'Anonymous Guest'}
                    </p>
                    {photo.guestMessage && (
                      <p className="text-[11px] text-charcoal-600 italic line-clamp-2">
                        "{photo.guestMessage}"
                      </p>
                    )}
                    <p className="text-[10px] text-charcoal-400">
                      {formatDateTime(photo.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-charcoal-100">
                    <button
                      onClick={() => {
                        storage.moderatePhoto(photo.id, 'approved');
                        onRefresh();
                      }}
                      className="flex-1 py-1.5 bg-sage-600 hover:bg-sage-700 text-white text-[11px] font-medium rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        storage.moderatePhoto(photo.id, 'hidden');
                        onRefresh();
                      }}
                      className="flex-1 py-1.5 border border-charcoal-200 text-charcoal-600 text-[11px] font-medium rounded-lg hover:bg-ivory-100 transition-colors"
                    >
                      Hide Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SHARING & QR CODES ================= */}
      {activeTab === 'sharing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Scannable QR Code */}
          <div className="bg-ivory-50 border border-charcoal-200 rounded-3xl p-8 text-center space-y-6">
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
              Event QR Code
            </h3>

            <div className="p-4 bg-white rounded-2xl border border-charcoal-200 shadow-subtle inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scannable Wedding QR Code"
                  className="w-60 h-60 object-contain mx-auto"
                />
              ) : (
                <div className="w-60 h-60 bg-ivory-100 animate-pulse rounded-xl" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-charcoal-800">
                Direct Guest Link
              </p>
              <p className="text-xs text-charcoal-500 font-mono break-all max-w-sm mx-auto">
                {eventUrl}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-full border border-charcoal-300 bg-white text-xs font-medium text-charcoal-800 hover:bg-ivory-100"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-sage-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Event Link'}</span>
              </button>

              <button
                onClick={() => setActiveTab('table_sign')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-6 py-2.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium shadow-subtle"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Table Signs</span>
              </button>
            </div>
          </div>

          {/* Sharing Controls & Event Access */}
          <div className="space-y-6">
            <div className="bg-ivory-50 border border-charcoal-200 rounded-3xl p-8 space-y-6">
              <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                Access &amp; Privacy Controls
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200">
                  <div>
                    <p className="font-semibold text-charcoal-900">Public Gallery Visibility</p>
                    <p className="text-charcoal-500 text-[11px] mt-0.5">
                      Allow guests with the link to browse the album.
                    </p>
                  </div>
                  <button
                    onClick={handleTogglePublicGallery}
                    className={`px-3 py-1.5 rounded-full font-medium ${
                      event.isGalleryPublic
                        ? 'bg-sage-100 text-sage-800'
                        : 'bg-charcoal-200 text-charcoal-700'
                    }`}
                  >
                    {event.isGalleryPublic ? 'Public to Guests' : 'Private'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200">
                  <div>
                    <p className="font-semibold text-charcoal-900">Guest Photo Uploading</p>
                    <p className="text-charcoal-500 text-[11px] mt-0.5">
                      Turn off when you wish to close contributions after the event.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleUploads}
                    className={`px-3 py-1.5 rounded-full font-medium ${
                      event.allowGuestUploads
                        ? 'bg-sage-100 text-sage-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {event.allowGuestUploads ? 'Open' : 'Closed'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: BULK EXPORT (ALL, FAVORITES & ALBUMS SEPARATELY) ================= */}
      {activeTab === 'export' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          
          <div className="text-center space-y-2">
            <Archive className="w-12 h-12 text-sage-600 mx-auto" />
            <h3 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
              Download Collections &amp; Archives
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-lg mx-auto">
              Download your wedding photography in full resolution as offline .ZIP archives. Export your entire library, favorite picks, or individual albums separately.
            </p>
          </div>

          {/* Active Export Progress Banner */}
          {isExporting && (
            <div className="p-4 bg-champagne-50 border border-champagne-300 rounded-2xl shadow-subtle flex items-center justify-between text-xs text-champagne-900 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full border-2 border-champagne-600 border-t-transparent animate-spin shrink-0" />
                <span className="font-semibold">{exportProgress || 'Preparing ZIP container...'}</span>
              </div>
              <span className="text-[11px] text-champagne-700 font-mono">Do not close this tab</span>
            </div>
          )}

          {/* Top 2 Primary Export Cards: All Memories vs Favorites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: ALL MEMORIES ARCHIVE */}
            <div className="bg-ivory-50 border border-charcoal-200/90 rounded-3xl p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-subtle hover:shadow-soft transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-charcoal-900 font-normal">
                    Complete Archive
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    Every approved photo shared across all albums, bundled with a complete guestbook text file.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs text-charcoal-500 pt-1">
                  <span>{photos.filter((p) => p.status === 'approved').length} photographs</span>
                  <span>&bull;</span>
                  <span>{guestbook.length} guestbook wishes</span>
                </div>
              </div>

              <button
                onClick={handleDownloadAll}
                disabled={isExporting || photos.filter((p) => p.status === 'approved').length === 0}
                className="w-full py-3 px-4 rounded-full bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-subtle flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download All Memories (.ZIP)</span>
              </button>
            </div>

            {/* CARD 2: FAVORITES ONLY */}
            <div className="bg-ivory-50 border border-charcoal-200/90 rounded-3xl p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-subtle hover:shadow-soft transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-red-600" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-charcoal-900 font-normal">
                    Couple's Favorites
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    Download only the photographs you've heart-marked as your personal favorites during browsing.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs text-charcoal-500 pt-1">
                  <span>{photos.filter((p) => p.isFavorite).length} favorite photos selected</span>
                </div>
              </div>

              <button
                onClick={handleDownloadFavorites}
                disabled={isExporting || photos.filter((p) => p.isFavorite).length === 0}
                className="w-full py-3 px-4 rounded-full bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-subtle flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Favorites (.ZIP)</span>
              </button>
            </div>

          </div>

          {/* SECTION 2: DOWNLOAD BY ALBUM (SEPARATELY) */}
          <div className="bg-white border border-charcoal-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-100 pb-4">
              <div>
                <h4 className="font-serif text-2xl text-charcoal-900 font-normal">
                  Download by Album
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Download any guest album or curated collection separately as its own standalone ZIP.
                </p>
              </div>
              <span className="text-xs text-sage-700 font-medium">
                {albums.length} {albums.length === 1 ? 'Album' : 'Albums'} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {albums.map((alb) => {
                const albPhotos = photos.filter((p) => p.albumIds && p.albumIds.includes(alb.id));

                return (
                  <div
                    key={alb.id}
                    className="p-4 rounded-2xl border border-charcoal-200/80 bg-ivory-50 flex items-center justify-between gap-3 hover:border-charcoal-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-charcoal-100 shrink-0 border border-charcoal-200/60">
                        <img
                          src={alb.coverPhotoUrl || event.coverImageUrl}
                          alt={alb.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-charcoal-900 truncate">
                          {alb.title}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-charcoal-500 mt-0.5">
                          <span className="font-medium text-sage-700">
                            {alb.type === 'guest' ? 'Guest Album' : 'Curated'}
                          </span>
                          <span>&bull;</span>
                          <span>{albPhotos.length} {albPhotos.length === 1 ? 'photo' : 'photos'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadAlbum(alb)}
                      disabled={isExporting || albPhotos.length === 0}
                      className="px-3.5 py-2 rounded-full border border-charcoal-300 bg-white hover:bg-ivory-100 disabled:opacity-40 text-charcoal-800 text-xs font-medium shrink-0 flex items-center space-x-1 transition-colors"
                      title={`Download ${alb.title} as ZIP`}
                    >
                      <Download className="w-3.5 h-3.5 text-sage-600" />
                      <span className="hidden sm:inline">ZIP</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 5: EVENT SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-ivory-50 border border-charcoal-200 rounded-3xl p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
              Event Configuration
            </h3>
            <p className="text-xs text-charcoal-500">
              Update wedding couple details, venue information, and security PIN.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-sage-50 border border-sage-200 text-sage-800 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
              <Check className="w-4 h-4 text-sage-600" />
              <span>Event settings saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Partner 1</label>
                <input
                  type="text"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Partner 2</label>
                <input
                  type="text"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Wedding Date</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Couple Security PIN</label>
                <input
                  type="text"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={6}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-charcoal-700">Welcome Message</label>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-charcoal-200">
              <button
                type="button"
                onClick={handleResetData}
                className="text-xs text-red-600 hover:underline"
              >
                Reset Database to Sample Data
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white font-medium text-xs shadow-subtle"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: CREATE ANOTHER WEDDING (INSIDE COUPLE SUITE) ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-ivory-50 rounded-3xl border border-charcoal-200 p-6 sm:p-8 max-w-lg w-full shadow-lift space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                  Create Another Wedding Platform
                </h3>
                <p className="text-xs text-charcoal-500">
                  Creates an isolated private digital album with unique QR code.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWeddingFromSuite} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Partner 1 *</label>
                  <input
                    type="text"
                    placeholder="e.g. Liam"
                    value={createP1}
                    onChange={(e) => setCreateP1(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Partner 2 *</label>
                  <input
                    type="text"
                    placeholder="e.g. Emma"
                    value={createP2}
                    onChange={(e) => setCreateP2(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Wedding Date *</label>
                  <input
                    type="date"
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Couple PIN *</label>
                  <input
                    type="text"
                    value={createPin}
                    onChange={(e) => setCreatePin(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Villa Medicea"
                    value={createVenue}
                    onChange={(e) => setCreateVenue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Florence, Italy"
                    value={createLocation}
                    onChange={(e) => setCreateLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Theme Palette Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-charcoal-800 flex items-center space-x-1">
                  <Palette className="w-3.5 h-3.5 text-sage-600" />
                  <span>Color Aesthetic</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(THEMES) as WeddingTheme[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = createTheme === themeKey;
                    return (
                      <div
                        key={themeKey}
                        onClick={() => setCreateTheme(themeKey)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                          isSelected ? 'border-charcoal-900 bg-white font-semibold' : 'border-charcoal-200 bg-ivory-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: t.primary }}
                          />
                          <span className="truncate">{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-charcoal-900" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full border border-charcoal-200 text-charcoal-700 hover:bg-ivory-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-charcoal-900 text-white font-medium text-xs hover:bg-charcoal-800"
                >
                  Create Wedding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
