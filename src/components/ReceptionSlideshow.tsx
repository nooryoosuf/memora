import React, { useState, useEffect, useRef } from 'react';
import { Photo, WeddingEvent } from '../types';
import { QRCodeGenerator } from '../utils/qr';
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  X,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Heart,
} from 'lucide-react';

interface ReceptionSlideshowProps {
  photos: Photo[];
  event: WeddingEvent;
  onExit: () => void;
  albumId?: string;
}

export const ReceptionSlideshow: React.FC<ReceptionSlideshowProps> = ({
  photos,
  event,
  onExit,
  albumId,
}) => {
  const approvedPhotos = photos.filter(
    (p) => p.status === 'approved' && (!albumId || (p.albumIds && p.albumIds.includes(albumId)))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [showControls, setShowControls] = useState(true);
  const [showQrCorner, setShowQrCorner] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<number | null>(null);

  const eventUrl = `${window.location.origin}${window.location.pathname}#/w/${event.slug}`;

  useEffect(() => {
    QRCodeGenerator.toDataURL(eventUrl, 400).then((url) => setQrDataUrl(url));
  }, [eventUrl]);

  // Slideshow interval timer
  useEffect(() => {
    if (!isPlaying || approvedPhotos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % approvedPhotos.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, intervalSec, approvedPhotos.length]);

  // Auto-hide controls after 3 seconds of inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % approvedPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + approvedPhotos.length) % approvedPhotos.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentPhoto = approvedPhotos[currentIndex];

  if (approvedPhotos.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-charcoal-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Heart className="w-12 h-12 text-champagne-400" />
        <h2 className="font-serif text-3xl font-normal">No approved photographs yet</h2>
        <p className="text-xs text-ivory-300">
          Upload photographs to start the live reception slideshow.
        </p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col justify-between cursor-none hover:cursor-default"
    >
      {/* Background Image with Slow Elegant Ken-Burns Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        {approvedPhotos.map((photo, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={photo.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.guestMessage || photo.originalFilename}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>
          );
        })}
        {/* Soft vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/50 z-20" />
      </div>

      {/* Top Bar: Couple Name and Exit Button */}
      <div
        className={`relative z-30 p-6 flex items-center justify-between text-white transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="space-y-0.5">
          <p className="font-serif text-2xl sm:text-3xl font-normal tracking-wide text-ivory-100">
            {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}
          </p>
          <p className="text-xs text-champagne-300 uppercase tracking-widest font-mono">
            Reception Live Memories &bull; {currentIndex + 1} of {approvedPhotos.length}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQrCorner(!showQrCorner)}
            className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
              showQrCorner ? 'bg-champagne-600 text-white' : 'bg-white/10 text-ivory-200 hover:bg-white/20'
            }`}
            title="Toggle QR code for guests at the venue"
          >
            <QrCode className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={onExit}
            className="p-2.5 rounded-full bg-white/10 hover:bg-red-600/80 text-white backdrop-blur-md transition-colors"
            title="Exit Slideshow"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scannable Corner QR Card for Venue Guests */}
      {showQrCorner && qrDataUrl && (
        <div className="absolute top-24 right-6 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lift border border-white/20 text-center space-y-2 animate-fadeIn max-w-[180px]">
          <img src={qrDataUrl} alt="Scan to share photos" className="w-32 h-32 mx-auto" />
          <p className="font-serif text-xs font-semibold text-charcoal-900 leading-tight">
            Scan to share your photos tonight!
          </p>
          <p className="text-[10px] text-charcoal-500">
            Directly appears on this screen
          </p>
        </div>
      )}

      {/* Bottom Bar: Captions & Playback Controls */}
      <div
        className={`relative z-30 p-6 flex flex-col sm:flex-row items-center justify-between text-white gap-4 transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Caption */}
        <div className="max-w-xl text-center sm:text-left">
          {currentPhoto?.guestName && (
            <p className="text-xs uppercase tracking-wider text-champagne-300 font-semibold">
              Captured by {currentPhoto.guestName}
            </p>
          )}
          {currentPhoto?.guestMessage && (
            <p className="font-serif italic text-lg sm:text-xl text-ivory-100 mt-1 leading-snug">
              "{currentPhoto.guestMessage}"
            </p>
          )}
        </div>

        {/* Slideshow Player Controls */}
        <div className="flex items-center space-x-3 bg-charcoal-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
          <button
            onClick={handlePrev}
            className="p-1.5 hover:text-champagne-300 text-ivory-200 transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-champagne-600 hover:bg-champagne-500 text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 hover:text-champagne-300 text-ivory-200 transition-colors"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          <select
            value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            className="bg-transparent text-xs text-ivory-200 focus:outline-none cursor-pointer"
          >
            <option value={3} className="bg-charcoal-900 text-white">3s</option>
            <option value={5} className="bg-charcoal-900 text-white">5s</option>
            <option value={8} className="bg-charcoal-900 text-white">8s</option>
            <option value={12} className="bg-charcoal-900 text-white">12s</option>
          </select>
        </div>
      </div>
    </div>
  );
};
