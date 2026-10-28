import React, { useState } from 'react';
import { WeddingEvent } from '../types';
import { storage } from '../services/storage';
import {
  Sparkles,
  QrCode,
  Lock,
  ArrowRight,
  Camera,
  Heart,
  FolderHeart,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface MemoraLandingProps {
  onOpenCoupleLogin: (slug?: string) => void;
  onOpenGuestPortal: (slug: string) => void;
  onNavigate?: (view: string) => void;
}

export const MemoraLanding: React.FC<MemoraLandingProps> = ({
  onOpenCoupleLogin,
  onOpenGuestPortal,
  onNavigate,
}) => {
  const [weddingCodeInput, setWeddingCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLookupWedding = (e: React.FormEvent) => {
    e.preventDefault();
    const query = weddingCodeInput.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (!query) return;

    const event = storage.getEventBySlug(query);
    if (event) {
      onOpenGuestPortal(event.slug);
    } else {
      setErrorMessage(
        `Wedding "${weddingCodeInput}" not found. Please verify the wedding code or scan the table QR code.`
      );
    }
  };

  return (
    <div className="w-full bg-ivory-50 text-charcoal-900 min-h-[90vh] flex flex-col justify-between">
      
      {/* Editorial Luxury Header Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center space-y-8 animate-fadeIn">
        
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-ivory-200 border border-charcoal-200/60 text-xs text-charcoal-800">
          <Heart className="w-3.5 h-3.5 text-sage-600 fill-sage-600" />
          <span>Private Digital Wedding Albums</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl text-charcoal-950 font-normal tracking-tight leading-[1.05]">
            Memora
          </h1>
          <p className="font-serif italic text-xl sm:text-2xl text-charcoal-600 max-w-xl mx-auto font-light">
            Every moment of your wedding day, preserved through the eyes of those you love.
          </p>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-lg mx-auto leading-relaxed pt-2">
            Guests scan your table QR code to privately share their photos and heartfelt notes. No apps, no passwords, no public feeds.
          </p>
        </div>

        {/* Guest QR / Wedding Code Finder */}
        <div className="max-w-md mx-auto pt-4">
          <form
            onSubmit={handleLookupWedding}
            className="bg-white p-2 sm:p-2.5 rounded-2xl border border-charcoal-200 shadow-soft flex items-center space-x-2"
          >
            <QrCode className="w-5 h-5 text-charcoal-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Enter wedding code (e.g. sophia-and-julian)"
              value={weddingCodeInput}
              onChange={(e) => {
                setWeddingCodeInput(e.target.value);
                setErrorMessage('');
              }}
              className="w-full py-2 px-2 text-xs sm:text-sm bg-transparent focus:outline-none text-charcoal-900"
            />
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-medium shrink-0 transition-all active:scale-95 flex items-center space-x-1"
            >
              <span>Enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs text-red-600 mt-2 font-medium">{errorMessage}</p>
          )}

          <p className="text-[11px] text-charcoal-400 mt-2">
            Tip: Most guests simply point their phone camera at the table QR code to open their couple's album directly!
          </p>
        </div>

      </section>

      {/* 3 Pillars of Memora */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ivory-100/60 border border-charcoal-200/70 rounded-3xl p-7 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 font-semibold">
              Instant QR Sharing
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Every couple receives printable table cards with high-resolution QR codes pointing to their private upload page.
            </p>
          </div>

          <div className="bg-ivory-100/60 border border-charcoal-200/70 rounded-3xl p-7 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-champagne-100 text-champagne-700 flex items-center justify-center">
              <FolderHeart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 font-semibold">
              Strict Guest Privacy
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Guests never see photos shared by other guests. Only the couple has access to the full digital wedding archive.
            </p>
          </div>

          <div className="bg-ivory-100/60 border border-charcoal-200/70 rounded-3xl p-7 space-y-3 shadow-subtle">
            <div className="w-10 h-10 rounded-xl bg-charcoal-100 text-charcoal-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-charcoal-900 font-semibold">
              Couple's Suite &amp; Export
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              A private dashboard protected by a couple security PIN, featuring live reception slideshows, album curation, and bulk ZIP download.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
