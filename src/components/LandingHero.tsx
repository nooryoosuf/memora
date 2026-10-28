import React from 'react';
import { WeddingEvent, Photo, Album } from '../types';
import { formatDate } from '../utils/image';
import { Camera, Eye, ArrowRight, Heart, Sparkles, Image as ImageIcon, MapPin, Calendar, QrCode } from 'lucide-react';

interface LandingHeroProps {
  event: WeddingEvent;
  photos: Photo[];
  albums: Album[];
  onOpenUpload: () => void;
  onNavigate: (view: string) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  event,
  photos,
  albums,
  onOpenUpload,
  onNavigate,
}) => {
  const approvedPhotos = photos.filter((p) => p.status === 'approved');
  const previewPhotos = approvedPhotos.slice(0, 6);

  return (
    <div className="space-y-20 md:space-y-28">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Cover Showcase Card */}
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lift border border-charcoal-200/50 bg-charcoal-900 min-h-[580px] md:min-h-[680px] flex flex-col justify-end">
            
            {/* Background Cover Image with Editorial Dark Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={event.coverImageUrl}
                alt={`${event.coupleNames.partner1} & ${event.coupleNames.partner2}`}
                className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-1000 ease-out"
              />
              {/* Luxury Multi-Stop Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/95 via-charcoal-950/45 to-charcoal-950/20" />
            </div>

            {/* Floating Top Pill Badges */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
              <div className="inline-flex items-center space-x-2 bg-charcoal-900/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-ivory-100">
                <MapPin className="w-3.5 h-3.5 text-champagne-300" />
                <span>{event.venue}, {event.location}</span>
              </div>

              <div className="hidden sm:inline-flex items-center space-x-2 bg-charcoal-900/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-ivory-100">
                <Calendar className="w-3.5 h-3.5 text-champagne-300" />
                <span>{formatDate(event.weddingDate)}</span>
              </div>
            </div>

            {/* Hero Editorial Content */}
            <div className="relative z-10 p-6 sm:p-10 md:p-16 max-w-3xl space-y-6">
              
              <div className="space-y-2">
                <p className="font-serif italic text-champagne-300 text-lg sm:text-xl tracking-wide">
                  Welcome to our private digital album
                </p>
                <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-white font-normal tracking-tight leading-[1.08]">
                  {event.coupleNames.partner1} <span className="font-light italic text-champagne-200">&amp;</span> {event.coupleNames.partner2}
                </h1>
              </div>

              <p className="text-ivory-200 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
                {event.welcomeMessage || 'Help us keep these memories forever. Share the moments you captured and make our wedding album even more special.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                {event.allowGuestUploads && (
                  <button
                    onClick={onOpenUpload}
                    className="inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-full bg-sage-500 hover:bg-sage-600 text-white font-medium text-base shadow-soft hover:shadow-lift transition-all duration-200 active:scale-98"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Share Your Photos</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('gallery')}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-medium text-base transition-all duration-200"
                >
                  <Eye className="w-5 h-5 text-champagne-200" />
                  <span>Explore Memories ({approvedPhotos.length})</span>
                </button>
              </div>

              {/* Live Metric Ticker */}
              <div className="pt-4 flex items-center space-x-6 text-xs sm:text-sm text-ivory-300/80 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{approvedPhotos.length}</span>
                  <span>Photos Captured</span>
                </div>
                <span>&bull;</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{albums.length}</span>
                  <span>Curated Albums</span>
                </div>
                <span className="hidden sm:inline">&bull;</span>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="font-semibold text-white">{event.uniqueGuestsCount}</span>
                  <span>Guest Contributors</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Guest Invitation Principle: Effortless 3-Step Sharing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-sage-600 font-semibold">
            How It Works
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
            No Apps, No Passwords, Pure Joy
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base">
            We designed this so sharing your favourite memories takes seconds from any phone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-ivory-100/70 border border-charcoal-200/70 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-sage-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-700">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 font-semibold">
              1. Snap or Select Photos
            </h3>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              Select multiple photos from your camera roll. High-resolution photos, candids, and group shots are all warmly welcomed.
            </p>
          </div>

          <div className="bg-ivory-100/70 border border-charcoal-200/70 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-sage-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-champagne-100 flex items-center justify-center text-champagne-600">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 font-semibold">
              2. Add a Note (Optional)
            </h3>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              Include your name and a heartfelt message for our digital guestbook so we know which memories belong to you.
            </p>
          </div>

          <div className="bg-ivory-100/70 border border-charcoal-200/70 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-sage-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center text-charcoal-800">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 font-semibold">
              3. Preserved Forever
            </h3>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              Your photos are instantly stored into our private wedding album and displayed on the reception slideshow!
            </p>
          </div>
        </div>
      </section>

      {/* Recent Memories Teaser Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-sage-600 font-semibold">
              A Glimpse into the Day
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal mt-1">
              Recent Moments Shared
            </h2>
          </div>

          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center space-x-1.5 text-sm font-medium text-charcoal-800 hover:text-sage-700 transition-colors group"
          >
            <span>View All {approvedPhotos.length} Photos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 6-Photo Masonry Grid Preview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {previewPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => onNavigate('gallery')}
              className={`group relative rounded-xl overflow-hidden bg-charcoal-100 cursor-pointer shadow-subtle ${
                idx === 0 ? 'col-span-2 md:col-span-1 row-span-2 md:aspect-[3/4]' : 'aspect-square'
              }`}
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.guestMessage || photo.originalFilename}
                className="w-full h-full object-cover image-zoom-hover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white text-xs">
                  {photo.guestName && (
                    <p className="font-medium text-champagne-200">Shared by {photo.guestName}</p>
                  )}
                  {photo.guestMessage && (
                    <p className="line-clamp-1 text-ivory-100 italic mt-0.5">"{photo.guestMessage}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Albums Teaser */}
      <section className="bg-ivory-100/70 border-y border-charcoal-200/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-sage-600 font-semibold">
                Chapters of Our Day
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal mt-1">
                Curated Albums
              </h2>
            </div>

            <button
              onClick={() => onNavigate('albums')}
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-charcoal-800 hover:text-sage-700 transition-colors group"
            >
              <span>Explore All Albums</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.slice(0, 3).map((album) => (
              <div
                key={album.id}
                onClick={() => onNavigate('albums')}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-ivory-50 border border-charcoal-200/80 shadow-subtle hover:shadow-soft transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden bg-charcoal-100 relative">
                  <img
                    src={album.coverPhotoUrl || event.coverImageUrl}
                    alt={album.title}
                    className="w-full h-full object-cover image-zoom-hover"
                  />
                  <div className="absolute top-3 right-3 bg-charcoal-900/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white font-medium">
                    {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
                  </div>
                </div>

                <div className="p-5 space-y-1.5">
                  <h3 className="font-serif text-xl text-charcoal-900 font-normal group-hover:text-champagne-600 transition-colors">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-charcoal-900 text-white p-8 sm:p-12 md:p-16 text-center space-y-6 relative overflow-hidden shadow-lift">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="font-serif italic text-champagne-300 text-xl">
              Captured a magical moment?
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
              Every perspective makes our story complete.
            </h2>
            <p className="text-ivory-200 text-sm sm:text-base leading-relaxed">
              Whether it was our walk down the aisle, a quiet smile at your table, or joy on the dance floor — please share it with us.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {event.allowGuestUploads && (
              <button
                onClick={onOpenUpload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full bg-sage-500 hover:bg-sage-600 text-white font-medium text-base shadow-soft transition-all active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span>Upload Photos Now</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('guestbook')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-base border border-white/20 transition-all"
            >
              <Heart className="w-5 h-5 text-champagne-300" />
              <span>Leave a Guestbook Wish</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
