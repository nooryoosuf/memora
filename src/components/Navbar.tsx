import React from 'react';
import {
  Camera,
  Image as ImageIcon,
  BookOpen,
  MessageSquare,
  Shield,
  Play,
  Lock,
  Heart,
  LogOut,
} from 'lucide-react';
import { WeddingEvent } from '../types';
import { getThemeConfig } from '../utils/theme';

interface NavbarProps {
  event: WeddingEvent;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  isCoupleAuth: boolean;
  pendingCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  event,
  currentView,
  onNavigate,
  onOpenUpload,
  isCoupleAuth,
  pendingCount,
  onLogout,
}) => {
  const theme = getThemeConfig(event.theme);

  // Dedicated minimal header for the main Memora platform homepage
  if (currentView === 'memora') {
    return (
      <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur-md border-b border-charcoal-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Memora Platform Logo */}
            <button
              onClick={() => onNavigate('memora')}
              className="flex flex-col items-start text-left focus:outline-none group"
            >
              <span className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal-900 group-hover:text-champagne-600 transition-colors">
                Memora
              </span>
              <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-medium">
                Wedding Memories Platform
              </span>
            </button>

            {/* Clean minimal brand tag */}
            <div className="flex items-center space-x-1.5 text-xs text-charcoal-500">
              <Heart className="w-3.5 h-3.5 text-sage-600 fill-sage-600" />
              <span>Private Digital Albums</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Dedicated header for the Studio Admin Dashboard
  if (currentView === 'admin') {
    return (
      <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur-md border-b border-charcoal-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => onNavigate('memora')}
              className="flex flex-col items-start text-left focus:outline-none group"
            >
              <span className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal-900 group-hover:text-champagne-600 transition-colors">
                Memora Studio
              </span>
              <span className="text-[10px] uppercase tracking-widest text-sage-700 font-semibold">
                Administrator Hub
              </span>
            </button>

            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => onNavigate('memora')}
                className="px-4 py-2 rounded-full border border-charcoal-200 bg-white hover:bg-ivory-100 font-medium text-charcoal-700 transition-colors"
              >
                View Memora Site
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-ivory-50/90 backdrop-blur-md border-b border-charcoal-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Couple Logo or Memora Logo */}
          <button
            onClick={() => onNavigate(isCoupleAuth ? 'couple' : 'portal')}
            className="flex flex-col items-start text-left focus:outline-none group"
          >
            <span className="font-serif text-2xl md:text-3xl tracking-tight text-charcoal-900 group-hover:text-champagne-600 transition-colors">
              {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-medium">
              {isCoupleAuth ? "Couple's Private Lounge" : "Memora Digital Wedding"}
            </span>
          </button>

          {/* Navigation Links for Couple (Only shown when Couple is Authenticated) */}
          {isCoupleAuth ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => onNavigate('couple')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === 'couple'
                    ? 'text-charcoal-950 font-semibold bg-ivory-200'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => onNavigate('gallery')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  currentView === 'gallery'
                    ? 'text-charcoal-950 font-semibold bg-ivory-200'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                <ImageIcon className="w-4 h-4 opacity-75" />
                <span>All Memories</span>
              </button>

              <button
                onClick={() => onNavigate('albums')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  currentView === 'albums'
                    ? 'text-charcoal-950 font-semibold bg-ivory-200'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                <BookOpen className="w-4 h-4 opacity-75" />
                <span>Guest Albums</span>
              </button>

              <button
                onClick={() => onNavigate('guestbook')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  currentView === 'guestbook'
                    ? 'text-charcoal-950 font-semibold bg-ivory-200'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                <MessageSquare className="w-4 h-4 opacity-75" />
                <span>Guestbook</span>
              </button>

              <button
                onClick={() => onNavigate('slideshow')}
                className="px-3 py-2 rounded-md text-sm font-medium text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100 transition-all flex items-center space-x-1.5"
              >
                <Play className="w-4 h-4 text-sage-600" />
                <span>Slideshow</span>
              </button>
            </nav>
          ) : (
            /* Clean minimal view for Guests */
            <div className="hidden sm:flex items-center space-x-2 text-xs text-charcoal-500">
              <Heart className="w-3.5 h-3.5 text-sage-600 fill-sage-600" />
              <span>Private Wedding Album</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Couple Login / Lounge Toggle */}
            {isCoupleAuth ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-red-200 bg-red-50/60 text-xs font-medium text-red-700 hover:bg-red-100 transition-all"
                title="Lock Dashboard"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('couple')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-charcoal-200 hover:border-charcoal-400 bg-white text-xs font-medium text-charcoal-700 hover:bg-ivory-100 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Couple Access</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation for Couple (when authenticated) */}
        {isCoupleAuth && (
          <div className="md:hidden flex items-center justify-between border-t border-charcoal-100 py-2.5 overflow-x-auto text-xs font-medium gap-2">
            <button
              onClick={() => onNavigate('couple')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${currentView === 'couple' ? 'bg-charcoal-900 text-white' : 'text-charcoal-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('gallery')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${currentView === 'gallery' ? 'bg-charcoal-900 text-white' : 'text-charcoal-700'}`}
            >
              All Photos
            </button>
            <button
              onClick={() => onNavigate('albums')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${currentView === 'albums' ? 'bg-charcoal-900 text-white' : 'text-charcoal-700'}`}
            >
              Guest Albums
            </button>
            <button
              onClick={() => onNavigate('guestbook')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${currentView === 'guestbook' ? 'bg-charcoal-900 text-white' : 'text-charcoal-700'}`}
            >
              Guestbook
            </button>
            <button
              onClick={() => onNavigate('portal')}
              className="px-2.5 py-1 rounded-md text-sage-700 whitespace-nowrap"
            >
              Guest View
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
