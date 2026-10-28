import React, { useState } from 'react';
import { WeddingEvent, WeddingTheme } from '../types';
import { storage } from '../services/storage';
import { formatDate } from '../utils/image';
import { PrintableTableSign } from './PrintableTableSign';
import {
  Sparkles,
  Plus,
  QrCode,
  Lock,
  Copy,
  ExternalLink,
  Check,
  Search,
  Trash2,
  Calendar,
  MapPin,
  Camera,
  FolderHeart,
  Users,
  ShieldCheck,
  Share2,
  RefreshCw,
  Printer,
  ChevronRight,
  ArrowLeft,
  KeyRound,
  Eye,
  MessageCircle,
} from 'lucide-react';

interface AdminStudioProps {
  events: WeddingEvent[];
  onSelectEvent: (event: WeddingEvent) => void;
  onNavigate: (view: string) => void;
  onRefresh: () => void;
}

export const AdminStudio: React.FC<AdminStudioProps> = ({
  events,
  onSelectEvent,
  onNavigate,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<WeddingEvent | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTableSignEvent, setActiveTableSignEvent] = useState<WeddingEvent | null>(null);

  // New Event Form State
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [weddingDate, setWeddingDate] = useState(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [couplePin, setCouplePin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [theme, setTheme] = useState<WeddingTheme>('tuscan-sage');
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85'
  );

  // Auto-generate slug when names change unless manually edited
  const handlePartnerChange = (p1: string, p2: string) => {
    setPartner1(p1);
    setPartner2(p2);
    if (!slugTouched) {
      const generated = `${p1.trim()}-and-${p2.trim()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setCustomSlug(generated);
    }
  };

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setCouplePin(pin);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner1.trim() || !partner2.trim() || !venue.trim()) return;

    const newEvt = storage.createEvent({
      partner1: partner1.trim(),
      partner2: partner2.trim(),
      weddingDate,
      venue: venue.trim(),
      location: location.trim() || venue.trim(),
      slug: customSlug.trim() || undefined,
      theme,
      couplePin: couplePin.trim() || '2026',
      coverImageUrl,
    });

    onRefresh();
    setCreatedEvent(newEvt);
    setShowCreateModal(false);

    // Reset form
    setPartner1('');
    setPartner2('');
    setVenue('');
    setLocation('');
    setCustomSlug('');
    setSlugTouched(false);
    generateRandomPin();
  };

  const handleDeleteEvent = (evt: WeddingEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (events.length <= 1) {
      alert('Cannot delete the only remaining wedding gallery.');
      return;
    }
    if (
      confirm(
        `Are you sure you want to permanently delete the gallery for "${evt.coupleNames.partner1} & ${evt.coupleNames.partner2}"? All associated photos and albums will be deleted.`
      )
    ) {
      storage.deleteEvent(evt.id);
      onRefresh();
    }
  };

  const copyToClipboard = (text: string, typeKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeKey);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Pre-calculated platform metrics
  const totalPhotosAcrossAll = events.reduce((acc, ev) => {
    const stats = storage.getEventStatistics(ev.id);
    return acc + stats.totalPhotos;
  }, 0);

  const totalGuestsAcrossAll = events.reduce((acc, ev) => {
    const stats = storage.getEventStatistics(ev.id);
    return acc + stats.uniqueGuests;
  }, 0);

  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.coupleNames.partner1.toLowerCase().includes(q) ||
      e.coupleNames.partner2.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.slug.toLowerCase().includes(q) ||
      e.couplePin.includes(q)
    );
  });

  if (activeTableSignEvent) {
    return (
      <PrintableTableSign
        event={activeTableSignEvent}
        onBack={() => setActiveTableSignEvent(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Studio Header & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-charcoal-200 pb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Memora Creator &amp; Studio Admin</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal-900 font-normal">
            Wedding Galleries Hub
          </h1>
          <p className="text-sm text-charcoal-600 mt-2 max-w-2xl leading-relaxed">
            Create independent wedding portals for each couple, issue their private access code, and share printable QR codes for guests.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs sm:text-sm font-medium shadow-soft transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Couple Gallery</span>
        </button>
      </div>

      {/* Aggregate Platform Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-5 space-y-1 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold">
            Active Couples
          </span>
          <p className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
            {events.length}
          </p>
          <p className="text-[11px] text-sage-700 font-medium">Distinct Portals</p>
        </div>

        <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-5 space-y-1 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold">
            Total Photos Uploaded
          </span>
          <p className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
            {totalPhotosAcrossAll}
          </p>
          <p className="text-[11px] text-sage-700 font-medium">Across all events</p>
        </div>

        <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-5 space-y-1 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold">
            Contributing Guests
          </span>
          <p className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
            {totalGuestsAcrossAll}
          </p>
          <p className="text-[11px] text-sage-700 font-medium">Verified contributors</p>
        </div>

        <div className="bg-ivory-50 border border-charcoal-200/80 rounded-2xl p-5 space-y-1 shadow-subtle">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold">
            Privacy Model
          </span>
          <p className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal">
            Isolated
          </p>
          <p className="text-[11px] text-sage-700 font-medium">Zero cross-couple visibility</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by couple names, venue, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-charcoal-200 bg-white text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:border-sage-500"
          />
        </div>

        <span className="text-xs text-charcoal-500">
          Showing {filteredEvents.length} of {events.length} wedding galleries
        </span>
      </div>

      {/* Wedding Galleries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => {
          const stats = storage.getEventStatistics(evt.id);
          const coupleUrl = `${window.location.origin}${window.location.pathname}#/w/${evt.slug}/couple`;
          const guestUrl = `${window.location.origin}${window.location.pathname}#/w/${evt.slug}`;

          const shareMessage = `Dear ${evt.coupleNames.partner1} & ${evt.coupleNames.partner2},\n\nHere is your private digital wedding lounge on Memora:\n${coupleUrl}\n\nYour Unique Couple Access Code: ${evt.couplePin}\n\nLog in to access your dashboard, print table QR code signs for your guests, and view all photos they share!`;

          return (
            <div
              key={evt.id}
              className="bg-white border border-charcoal-200/90 rounded-3xl overflow-hidden shadow-subtle hover:shadow-soft transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Banner */}
              <div className="relative aspect-[16/7] overflow-hidden bg-charcoal-100">
                <img
                  src={evt.coverImageUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/30 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-charcoal-900 shadow-sm flex items-center space-x-1">
                    <KeyRound className="w-3.5 h-3.5 text-sage-600" />
                    <span>Access Code: <strong className="font-mono text-charcoal-950">{evt.couplePin}</strong></span>
                  </span>

                  <button
                    onClick={(e) => handleDeleteEvent(evt, e)}
                    className="p-2 rounded-full bg-charcoal-900/60 hover:bg-red-600 text-white transition-colors"
                    title="Delete Gallery"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight">
                    {evt.coupleNames.partner1} &amp; {evt.coupleNames.partner2}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ivory-200 mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 opacity-80" />
                      <span>{formatDate(evt.weddingDate)}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 opacity-80" />
                      <span>{evt.venue}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content & Stats */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Statistics Bar */}
                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-ivory-100/70 rounded-2xl border border-charcoal-100 text-center text-xs">
                  <div>
                    <span className="text-charcoal-500 text-[10px] uppercase font-semibold">Photos</span>
                    <p className="font-semibold text-charcoal-900 text-sm sm:text-base mt-0.5">
                      {stats.totalPhotos}
                    </p>
                  </div>
                  <div className="border-x border-charcoal-200/60">
                    <span className="text-charcoal-500 text-[10px] uppercase font-semibold">Albums</span>
                    <p className="font-semibold text-charcoal-900 text-sm sm:text-base mt-0.5">
                      {stats.guestAlbumsCount + stats.curatedAlbumsCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-charcoal-500 text-[10px] uppercase font-semibold">Guests</span>
                    <p className="font-semibold text-charcoal-900 text-sm sm:text-base mt-0.5">
                      {stats.uniqueGuests}
                    </p>
                  </div>
                </div>

                {/* Access URLs & 1-Click Share Box */}
                <div className="space-y-2.5 text-xs">
                  
                  {/* Couple Lounge URL & PIN */}
                  <div className="p-3 bg-ivory-50 border border-charcoal-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-charcoal-700 font-medium">
                      <span className="flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-sage-600" />
                        <span>Couple Lounge Link:</span>
                      </span>
                      <span className="font-mono text-[11px] bg-champagne-100 px-2 py-0.5 rounded text-charcoal-800">
                        PIN: {evt.couplePin}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="font-mono text-[11px] text-charcoal-500 truncate select-all">
                        {coupleUrl}
                      </span>
                      <button
                        onClick={() => copyToClipboard(coupleUrl, `couple_${evt.id}`)}
                        className="px-2.5 py-1 rounded-md border border-charcoal-200 bg-white hover:bg-ivory-200 text-charcoal-700 shrink-0 font-medium text-[11px] flex items-center space-x-1"
                      >
                        {copiedType === `couple_${evt.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Guest Upload / QR URL */}
                  <div className="p-3 bg-ivory-50 border border-charcoal-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-charcoal-700 font-medium">
                      <span className="flex items-center space-x-1">
                        <QrCode className="w-3.5 h-3.5 text-sage-600" />
                        <span>Guest Upload / QR Link:</span>
                      </span>
                      <span className="text-[11px] text-charcoal-400">
                        Slug: /{evt.slug}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="font-mono text-[11px] text-charcoal-500 truncate select-all">
                        {guestUrl}
                      </span>
                      <button
                        onClick={() => copyToClipboard(guestUrl, `guest_${evt.id}`)}
                        className="px-2.5 py-1 rounded-md border border-charcoal-200 bg-white hover:bg-ivory-200 text-charcoal-700 shrink-0 font-medium text-[11px] flex items-center space-x-1"
                      >
                        {copiedType === `guest_${evt.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  
                  {/* Share Full Invite via WhatsApp/Email */}
                  <button
                    onClick={() => copyToClipboard(shareMessage, `msg_${evt.id}`)}
                    className="col-span-2 px-3 py-2.5 rounded-xl border border-sage-300 bg-sage-50 hover:bg-sage-100 text-sage-900 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    {copiedType === `msg_${evt.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-800">Couple Invite Copied!</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5 text-sage-600" />
                        <span>Copy Couple Invite Message</span>
                      </>
                    )}
                  </button>

                  {/* Print Table Sign */}
                  <button
                    onClick={() => setActiveTableSignEvent(evt)}
                    className="px-3 py-2.5 rounded-xl border border-charcoal-200 hover:border-charcoal-300 bg-white text-charcoal-800 font-medium text-xs flex items-center justify-center space-x-1 transition-colors"
                    title="Print Table Signs"
                  >
                    <Printer className="w-3.5 h-3.5 text-charcoal-600" />
                    <span>Table Sign</span>
                  </button>

                  {/* Open Couple Lounge */}
                  <button
                    onClick={() => {
                      storage.setActiveEvent(evt.id);
                      storage.setCoupleAuthenticated(true, evt.id);
                      onSelectEvent(evt);
                      onNavigate('couple');
                    }}
                    className="px-3 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs flex items-center justify-center space-x-1 transition-colors shadow-subtle"
                  >
                    <span>Lounge</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL 1: CREATE NEW COUPLE GALLERY ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ivory-50 rounded-3xl border border-charcoal-200 shadow-lift max-w-xl w-full max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-charcoal-100 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal">
                  Create Couple Gallery
                </h2>
                <p className="text-xs text-charcoal-500">
                  Generates an isolated wedding album with unique couple login credentials.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-charcoal-400 hover:text-charcoal-900 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              
              {/* Couple Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Partner 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena"
                    value={partner1}
                    onChange={(e) => handlePartnerChange(e.target.value, partner2)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:border-sage-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Partner 2 *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mateo"
                    value={partner2}
                    onChange={(e) => handlePartnerChange(partner1, e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:border-sage-500"
                  />
                </div>
              </div>

              {/* Date & Venue */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Wedding Date *</label>
                  <input
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:border-sage-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Château de Varennes"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:border-sage-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="font-semibold text-charcoal-800">City / Region (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Burgundy, France"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:border-sage-500"
                />
              </div>

              {/* Couple Unique PIN & Slug */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-charcoal-800">Couple Access PIN *</label>
                    <button
                      type="button"
                      onClick={generateRandomPin}
                      className="text-[11px] text-sage-700 hover:underline flex items-center space-x-0.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Randomize</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={couplePin}
                    onChange={(e) => setCouplePin(e.target.value)}
                    className="w-full p-2.5 font-mono text-center tracking-widest text-base font-bold rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:border-sage-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">URL Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="elena-and-mateo"
                    value={customSlug}
                    onChange={(e) => {
                      setCustomSlug(e.target.value);
                      setSlugTouched(true);
                    }}
                    className="w-full p-2.5 font-mono text-xs rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:border-sage-500"
                  />
                </div>
              </div>

              {/* Palette Theme Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-charcoal-800">Visual Palette</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'tuscan-sage', name: 'Tuscan Sage', color: '#556B2F' },
                    { id: 'black-champagne', name: 'Black Champagne', color: '#2C2723' },
                    { id: 'romantic-blush', name: 'Romantic Blush', color: '#C48B9F' },
                    { id: 'mediterranean-blue', name: 'Mediterranean', color: '#4A6B82' },
                    { id: 'terracotta-earth', name: 'Terracotta', color: '#B35436' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as WeddingTheme)}
                      className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                        theme === t.id
                          ? 'border-charcoal-900 bg-ivory-200 font-semibold'
                          : 'border-charcoal-200 bg-white text-charcoal-600'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-xs truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Photo Preset Pickers */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-charcoal-800">Cover Photography</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
                  ].map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setCoverImageUrl(url)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        coverImageUrl === url ? 'border-charcoal-900 scale-98' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-full border border-charcoal-200 hover:bg-ivory-100 text-charcoal-700 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs shadow-subtle transition-all"
                >
                  Create Gallery &amp; Generate Access
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: GALLERY CREATED SUCCESS & SHARING READY ================= */}
      {createdEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ivory-50 rounded-3xl border border-charcoal-200 shadow-lift max-w-lg w-full p-6 sm:p-7 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-serif text-3xl text-charcoal-900 font-normal">
                Gallery Ready to Share!
              </h3>
              <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
                {createdEvent.coupleNames.partner1} &amp; {createdEvent.coupleNames.partner2}'s gallery has been created.
              </p>
            </div>

            {/* Invite Details Box */}
            <div className="p-4 bg-white rounded-2xl border border-charcoal-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-charcoal-100">
                <span className="text-charcoal-500 font-medium">Couple Access PIN</span>
                <span className="font-mono text-base font-bold text-charcoal-900 px-2.5 py-0.5 bg-champagne-100 rounded">
                  {createdEvent.couplePin}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-charcoal-500 font-medium">Couple Dashboard URL</span>
                <p className="font-mono text-[11px] text-charcoal-800 break-all select-all">
                  {window.location.origin}{window.location.pathname}#/w/{createdEvent.slug}/couple
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-charcoal-500 font-medium">Guest QR Code URL</span>
                <p className="font-mono text-[11px] text-charcoal-800 break-all select-all">
                  {window.location.origin}{window.location.pathname}#/w/{createdEvent.slug}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const coupleUrl = `${window.location.origin}${window.location.pathname}#/w/${createdEvent.slug}/couple`;
                  const msg = `Dear ${createdEvent.coupleNames.partner1} & ${createdEvent.coupleNames.partner2},\n\nHere is your private digital wedding lounge on Memora:\n${coupleUrl}\n\nYour Unique Couple Access Code: ${createdEvent.couplePin}\n\nLog in to access your dashboard, print table QR code signs for your guests, and view all photos they share!`;
                  copyToClipboard(msg, 'created_invite');
                }}
                className="flex-1 py-3 px-4 rounded-full border border-charcoal-300 bg-white hover:bg-ivory-100 text-charcoal-900 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                {copiedType === 'created_invite' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Invite Message Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Couple Invite Message</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  storage.setActiveEvent(createdEvent.id);
                  storage.setCoupleAuthenticated(true, createdEvent.id);
                  onSelectEvent(createdEvent);
                  onNavigate('couple');
                  setCreatedEvent(null);
                }}
                className="flex-1 py-3 px-4 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs flex items-center justify-center space-x-1.5 shadow-subtle transition-all"
              >
                <span>Open Couple Lounge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setCreatedEvent(null)}
              className="w-full text-center text-xs text-charcoal-400 hover:text-charcoal-700 py-1"
            >
              Close &amp; Return to Hub
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
