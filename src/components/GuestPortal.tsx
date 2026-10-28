import React, { useState, useRef } from 'react';
import { WeddingEvent, Photo, Album, GuestbookEntry } from '../types';
import { storage } from '../services/storage';
import { formatDate, formatDateTime } from '../utils/image';
import { getThemeConfig } from '../utils/theme';
import {
  Camera,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Heart,
  FolderHeart,
  CheckCircle2,
  Plus,
  Send,
  ChevronDown,
  X,
} from 'lucide-react';

interface GuestPortalProps {
  event: WeddingEvent;
  myPhotos: Photo[];
  myAlbums: Album[];
  myNotes: GuestbookEntry[];
  onOpenUpload: (files?: File[]) => void;
  onRefresh: () => void;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({
  event,
  myPhotos,
  myAlbums,
  myNotes,
  onOpenUpload,
  onRefresh,
}) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [quickNoteName, setQuickNoteName] = useState('');
  const [quickNoteMessage, setQuickNoteMessage] = useState('');
  const [noteSubmitted, setNoteSubmitted] = useState(false);

  // Hidden native file input refs to immediately launch camera/gallery on click
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Lightbox for guest's own photos
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  const theme = getThemeConfig(event.theme);

  const handlePhotoFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    onOpenUpload(files);
  };

  const handleQuickNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteMessage.trim()) return;

    storage.addGuestbookEntry(
      {
        guestName: quickNoteName.trim() || 'A Guest',
        message: quickNoteMessage.trim(),
      },
      event.id
    );

    setQuickNoteMessage('');
    setQuickNoteName('');
    setNoteSubmitted(true);
    setTimeout(() => {
      setNoteSubmitted(false);
      setShowNoteModal(false);
    }, 2000);
    onRefresh();
  };

  const scrollToShared = () => {
    const el = document.getElementById('my-shared-memories');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      {/* Hidden File Inputs for Immediate Native Camera & Gallery Trigger */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handlePhotoFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          handlePhotoFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      {/* ================= SCREEN 1: ULTRA-MINIMAL FULL VIEWPORT HERO ================= */}
      <section className="relative w-full h-[100dvh] min-h-[580px] flex flex-col justify-between overflow-hidden bg-charcoal-950 text-white select-none">
        
        {/* Fullscreen Background Cover Photo with Luxury Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={event.coverImageUrl}
            alt={`${event.coupleNames.partner1} & ${event.coupleNames.partner2}`}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/95 via-charcoal-950/50 to-charcoal-950/40" />
        </div>

        {/* Top Minimal Header (Clean - NO Couple Access Button) */}
        <header className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-6 flex items-center justify-center">
          <span className="font-serif tracking-widest text-xs uppercase text-ivory-300 font-light">
            Memora &bull; Wedding Memories
          </span>
        </header>

        {/* Center: Couple Names & 3 Primary Share Options */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center space-y-7 my-auto">
          
          {/* Couple Editorial Header */}
          <div className="space-y-2">
            <p className="font-serif italic text-champagne-300 text-base sm:text-lg tracking-wide">
              Welcome to the Wedding of
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-white leading-tight">
              {event.coupleNames.partner1} <span className="font-light italic text-champagne-200">&amp;</span> {event.coupleNames.partner2}
            </h1>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-ivory-300 font-light pt-1">
              {formatDate(event.weddingDate)} &bull; {event.venue}
            </p>
          </div>

          {/* Minimal 3 Sharing Options */}
          <div className="space-y-2.5 pt-2">
            
            {/* Action 1: Take Photo -> Immediately opens camera */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-4 px-6 rounded-full bg-white text-charcoal-950 hover:bg-ivory-100 font-medium text-sm sm:text-base shadow-lift flex items-center justify-center space-x-2.5 transition-all active:scale-98"
            >
              <Camera className="w-5 h-5 text-charcoal-900" />
              <span>Take a Photo</span>
            </button>

            {/* Action 2: Upload from Gallery -> Immediately opens gallery multi-select */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full py-3.5 px-6 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-medium text-sm sm:text-base flex items-center justify-center space-x-2.5 transition-all active:scale-98"
            >
              <ImageIcon className="w-5 h-5 text-champagne-200" />
              <span>Upload from Gallery</span>
            </button>

            {/* Action 3: Leave a Note */}
            <button
              type="button"
              onClick={() => setShowNoteModal(true)}
              className="w-full py-3 px-6 rounded-full bg-transparent hover:bg-white/10 text-ivory-200 hover:text-white text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-champagne-300" />
              <span>Leave a Loving Message</span>
            </button>

          </div>
        </div>

        {/* Bottom Hint: Scroll Below Mobile Viewport */}
        <div className="relative z-10 pb-6 text-center">
          <button
            type="button"
            onClick={scrollToShared}
            className="inline-flex flex-col items-center space-x-0 space-y-1 text-ivory-300/80 hover:text-white transition-colors text-[11px] font-light tracking-wide cursor-pointer"
          >
            <span>
              {myPhotos.length > 0
                ? `You've shared ${myPhotos.length} ${myPhotos.length === 1 ? 'memory' : 'memories'} \u2022 Scroll to view`
                : 'Scroll down to see what you shared'}
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce text-champagne-300" />
          </button>
        </div>

      </section>

      {/* ================= SCREEN 2: BELOW THE MOBILE VIEWPORT ================= */}
      <section
        id="my-shared-memories"
        className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8"
      >
        <div className="border-b border-charcoal-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-1.5 text-sage-700 text-xs font-semibold uppercase tracking-wider">
              <FolderHeart className="w-4 h-4" />
              <span>Private Guest Collection</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal mt-0.5">
              What You've Shared with {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Only you on this device and the couple can see these memories.
            </p>
          </div>

          {myPhotos.length > 0 && (
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-white text-xs font-medium shadow-subtle hover:opacity-95 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share More Photos</span>
            </button>
          )}
        </div>

        {/* If NO photos or notes shared yet */}
        {myPhotos.length === 0 && myNotes.length === 0 ? (
          <div className="bg-ivory-100/70 rounded-3xl border border-charcoal-200 p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white text-charcoal-400 flex items-center justify-center mx-auto shadow-subtle">
              <Camera className="w-6 h-6 text-charcoal-600" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-serif text-xl text-charcoal-900 font-medium">
                No memories shared yet
              </h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Tap "Take a Photo" or "Upload from Gallery" above. Once selected, you'll be able to name your album and add your message!
              </p>
            </div>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-white text-xs font-medium shadow-subtle hover:opacity-95 transition-opacity"
              style={{ backgroundColor: theme.primary }}
            >
              <Plus className="w-4 h-4" />
              <span>Choose Photos from Gallery</span>
            </button>
          </div>
        ) : (
          /* If the guest HAS shared photos or notes */
          <div className="space-y-6">
            
            {/* Guest Albums Badges */}
            {myAlbums.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {myAlbums.map((alb) => (
                  <div
                    key={alb.id}
                    className="px-3.5 py-2 bg-ivory-200/80 border border-charcoal-200 rounded-xl flex items-center space-x-2 text-xs"
                  >
                    <FolderHeart className="w-4 h-4 text-sage-600" />
                    <span className="font-semibold text-charcoal-900">{alb.title}</span>
                    <span className="text-charcoal-500">({alb.photoCount} photos)</span>
                  </div>
                ))}
              </div>
            )}

            {/* Photos Grid */}
            {myPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {myPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className="group relative rounded-2xl overflow-hidden bg-charcoal-100 border border-charcoal-200/80 shadow-subtle cursor-pointer aspect-[4/5]"
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.guestMessage || photo.originalFilename}
                      className="w-full h-full object-cover image-zoom-hover"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent p-3 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.albumTitle && (
                        <p className="font-medium text-champagne-200 truncate">{photo.albumTitle}</p>
                      )}
                      <p className="text-ivory-300 text-[10px]">{formatDate(photo.uploadedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guest Notes */}
            {myNotes.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-charcoal-100">
                <h3 className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold">
                  Your Notes for the Couple ({myNotes.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-ivory-100/70 border border-charcoal-200 rounded-2xl p-4 space-y-1.5"
                    >
                      <p className="font-serif italic text-sm text-charcoal-900 leading-relaxed">
                        "{note.message}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-charcoal-400 pt-1">
                        <span>{note.guestName}</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Subtle Bottom Spacer */}
        <div className="pt-6 text-center text-[11px] text-charcoal-400">
          <span>Memora &bull; Forever Preserved</span>
        </div>
      </section>

      {/* ================= MODAL: LEAVE A QUICK NOTE ================= */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ivory-50 rounded-3xl border border-charcoal-200 p-6 sm:p-8 max-w-md w-full shadow-lift space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <div className="flex items-center space-x-2 text-charcoal-900">
                <Heart className="w-5 h-5 text-champagne-600 fill-champagne-600" />
                <h3 className="font-serif text-2xl font-normal">Leave a Loving Note</h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {noteSubmitted ? (
              <div className="py-8 text-center space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-sage-600 mx-auto" />
                <p className="font-serif text-xl text-charcoal-900 font-medium">
                  Your note has been saved!
                </p>
                <p className="text-xs text-charcoal-500">
                  {event.coupleNames.partner1} &amp; {event.coupleNames.partner2} will treasure your kind words.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickNoteSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800 flex items-center justify-between">
                    <span>Your Name (Optional)</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Can leave blank</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Noor, Aunt Claire, or leave blank"
                    value={quickNoteName}
                    onChange={(e) => setQuickNoteName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-charcoal-800">Your Message</label>
                  <textarea
                    rows={4}
                    placeholder="Write your wishes, advice, or sweet memory..."
                    value={quickNoteMessage}
                    onChange={(e) => setQuickNoteMessage(e.target.value)}
                    required
                    maxLength={800}
                    className="w-full p-3 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!quickNoteMessage.trim()}
                  className="w-full py-3 rounded-full text-white font-medium text-sm shadow-subtle flex items-center justify-center space-x-2 transition-all hover:opacity-95"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Send className="w-4 h-4" />
                  <span>Send Note to Couple</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX FOR GUEST'S OWN PHOTO ================= */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <span className="text-xs text-champagne-300 font-medium">
              Your Shared Memory
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActivePhoto(null)}
                className="p-2 text-white hover:bg-white/15 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={activePhoto.url}
              alt="Your shared memory"
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-lg shadow-lift"
            />
          </div>

          <div className="text-center text-xs text-ivory-300">
            <span>Uploaded {formatDateTime(activePhoto.uploadedAt)}</span>
          </div>
        </div>
      )}

    </div>
  );
};
