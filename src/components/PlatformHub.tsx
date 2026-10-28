import React, { useState } from 'react';
import { WeddingEvent, WeddingTheme } from '../types';
import { storage } from '../services/storage';
import { THEMES, getThemeConfig } from '../utils/theme';
import { formatDate } from '../utils/image';
import { QRCodeGenerator } from '../utils/qr';
import {
  Sparkles,
  Plus,
  Heart,
  QrCode,
  Lock,
  ExternalLink,
  Printer,
  Calendar,
  MapPin,
  X,
  Palette,
  Check,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

interface PlatformHubProps {
  events: WeddingEvent[];
  activeEvent: WeddingEvent;
  onSelectEvent: (event: WeddingEvent, targetView?: string) => void;
  onRefresh: () => void;
}

export const PlatformHub: React.FC<PlatformHubProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onRefresh,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [weddingDate, setWeddingDate] = useState('2026-11-20');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<WeddingTheme>('tuscan-sage');
  const [couplePin, setCouplePin] = useState('2026');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // QR preview modal for quick download/print
  const [qrModalEvent, setQrModalEvent] = useState<WeddingEvent | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const handleOpenQrModal = (ev: WeddingEvent) => {
    setQrModalEvent(ev);
    const origin = window.location.origin + window.location.pathname;
    const eventUrl = `${origin}#/w/${ev.slug}`;
    QRCodeGenerator.toDataURL(eventUrl, 800).then((url) => setQrDataUrl(url));
  };

  const handleCreateWedding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner1.trim() || !partner2.trim()) return;

    const newEv = storage.createEvent({
      partner1: partner1.trim(),
      partner2: partner2.trim(),
      weddingDate: new Date(weddingDate).toISOString(),
      venue: venue.trim() || 'Wedding Venue',
      location: location.trim() || 'Wedding Destination',
      theme: selectedTheme,
      couplePin: couplePin.trim() || '2026',
      coverImageUrl:
        coverImageUrl.trim() ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
    });

    setShowCreateModal(false);
    setPartner1('');
    setPartner2('');
    setVenue('');
    setLocation('');
    onRefresh();
    // Switch to new event
    onSelectEvent(newEv, 'portal');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-charcoal-200/80 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-champagne-100 rounded-full text-xs font-semibold text-charcoal-800">
            <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
            <span>Memora Multi-Wedding Platform</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal">
            Wedding Directory &amp; Event Hub
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl leading-relaxed">
            Manage distinct wedding celebrations. Each couple gets their own unique QR code, isolated photo albums, guestbook, custom color theme, and secure PIN-locked gallery.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white text-sm font-medium shadow-soft transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-champagne-300" />
          <span>Create New Wedding for a Couple</span>
        </button>
      </div>

      {/* Wedding Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {events.map((ev) => {
          const theme = getThemeConfig(ev.theme);
          const origin = window.location.origin + window.location.pathname;
          const guestUrl = `${origin}#/w/${ev.slug}`;
          const isCurrentlyActive = ev.id === activeEvent.id;

          return (
            <div
              key={ev.id}
              className={`rounded-3xl overflow-hidden bg-ivory-50 border transition-all duration-300 shadow-subtle hover:shadow-lift flex flex-col justify-between ${
                isCurrentlyActive ? 'border-charcoal-900 ring-2 ring-charcoal-800/10' : 'border-charcoal-200/80'
              }`}
            >
              {/* Event Cover Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-100">
                <img
                  src={ev.coverImageUrl}
                  alt={ev.title}
                  className="w-full h-full object-cover image-zoom-hover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/30 to-transparent" />

                {/* Theme Pill */}
                <div className="absolute top-3 left-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase shadow-sm"
                    style={{ backgroundColor: theme.primary, color: '#FFFFFF' }}
                  >
                    {theme.name}
                  </span>
                </div>

                {/* Quick QR Preview Icon */}
                <button
                  onClick={() => handleOpenQrModal(ev)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-charcoal-900/70 hover:bg-charcoal-900 text-white backdrop-blur-md transition-colors"
                  title="View Scannable QR Code"
                >
                  <QrCode className="w-4 h-4 text-champagne-300" />
                </button>

                {/* Couple Names on Cover */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-serif text-2xl font-normal leading-tight">
                    {ev.coupleNames.partner1} &amp; {ev.coupleNames.partner2}
                  </h3>
                  <p className="text-[11px] text-ivory-300 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-champagne-300" />
                    <span className="truncate">{ev.venue}, {ev.location}</span>
                  </p>
                </div>
              </div>

              {/* Event Body Info */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-xs text-charcoal-600">
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-100">
                    <span className="flex items-center space-x-1.5 text-charcoal-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(ev.weddingDate)}</span>
                    </span>
                    <span className="font-mono bg-ivory-200 px-2 py-0.5 rounded text-[11px] text-charcoal-800">
                      PIN: {ev.couplePin}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-charcoal-700">Dedicated Guest URL:</p>
                    <p className="font-mono text-[11px] text-charcoal-500 bg-white p-2 rounded-lg border border-charcoal-200 truncate">
                      {guestUrl}
                    </p>
                  </div>
                </div>

                {/* Actions: Open as Guest vs Couple Lounge */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectEvent(ev, 'portal')}
                    className="w-full py-2.5 px-3 rounded-xl border border-charcoal-300 bg-white hover:bg-ivory-100 text-charcoal-800 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Guest Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-charcoal-500" />
                  </button>

                  <button
                    onClick={() => onSelectEvent(ev, 'couple')}
                    className="w-full py-2.5 px-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-champagne-300" />
                    <span>Couple Suite</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= CREATE NEW WEDDING MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-ivory-50 rounded-3xl border border-charcoal-200 p-6 sm:p-8 max-w-xl w-full shadow-lift space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal">
                  Create New Wedding Event
                </h3>
                <p className="text-xs text-charcoal-500">
                  Generates an isolated digital album, unique QR code, and custom theme.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-charcoal-400 hover:text-charcoal-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWedding} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Partner 1 Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Liam"
                    value={partner1}
                    onChange={(e) => setPartner1(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Partner 2 Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Emma"
                    value={partner2}
                    onChange={(e) => setPartner2(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Wedding Date *</label>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Couple Security PIN *</label>
                  <input
                    type="text"
                    placeholder="4-digit PIN (e.g. 2026)"
                    value={couplePin}
                    onChange={(e) => setCouplePin(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Castello di Vincigliata"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Fiesole, Italy"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Theme Palette Selection */}
              <div className="space-y-2 pt-2">
                <label className="font-semibold text-charcoal-800 flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-sage-600" />
                  <span>Wedding Color Aesthetic &amp; Theme</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(THEMES) as WeddingTheme[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = selectedTheme === themeKey;
                    return (
                      <div
                        key={themeKey}
                        onClick={() => setSelectedTheme(themeKey)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-charcoal-900 bg-white shadow-sm ring-2 ring-charcoal-800/10'
                            : 'border-charcoal-200 bg-ivory-100 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: t.primary }}
                          />
                          <span className="text-xs font-medium text-charcoal-900">{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-charcoal-900" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-charcoal-800">Cover Photo Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-xs"
                />
              </div>

              <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full border border-charcoal-200 text-charcoal-700 hover:bg-ivory-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white font-medium text-xs shadow-subtle"
                >
                  Generate Wedding Platform
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= QR CODE PREVIEW MODAL ================= */}
      {qrModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ivory-50 rounded-3xl border border-charcoal-200 p-8 max-w-sm w-full text-center space-y-5 shadow-lift">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-sage-600">
                Scannable QR Code
              </span>
              <button
                onClick={() => setQrModalEvent(null)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-charcoal-900">
                {qrModalEvent.coupleNames.partner1} &amp; {qrModalEvent.coupleNames.partner2}
              </h3>
              <p className="text-xs text-charcoal-500">
                {qrModalEvent.venue} &bull; {formatDate(qrModalEvent.weddingDate)}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-charcoal-200 inline-block shadow-subtle">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Wedding QR Code" className="w-56 h-56 object-contain" />
              ) : (
                <div className="w-56 h-56 bg-ivory-100 animate-pulse rounded-xl" />
              )}
            </div>

            <p className="text-[11px] text-charcoal-500 max-w-xs mx-auto">
              Scan with any smartphone camera to open this couple's private photo-upload portal.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrDataUrl;
                  a.download = `qr-${qrModalEvent.slug}.png`;
                  a.click();
                }}
                className="flex-1 py-2 rounded-full border border-charcoal-300 bg-white text-xs font-medium text-charcoal-800 hover:bg-ivory-100"
              >
                Download PNG
              </button>

              <button
                onClick={() => {
                  onSelectEvent(qrModalEvent, 'couple');
                  setQrModalEvent(null);
                }}
                className="flex-1 py-2 rounded-full bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
