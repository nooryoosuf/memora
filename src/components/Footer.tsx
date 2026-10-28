import React from 'react';
import { WeddingEvent } from '../types';
import { formatDate } from '../utils/image';
import { Heart, Lock } from 'lucide-react';

interface FooterProps {
  event: WeddingEvent;
  currentView?: string;
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
}

export const Footer: React.FC<FooterProps> = ({ event, currentView, onNavigate, onOpenUpload }) => {
  // Dedicated Memora platform footer for the main landing page
  if (currentView === 'memora') {
    return (
      <footer className="border-t border-charcoal-200 bg-ivory-100/60 pt-12 pb-10 mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-4">
            
            <div className="flex items-center space-x-2 text-sage-600">
              <Heart className="w-5 h-5 fill-sage-600" />
            </div>

            <h3 className="font-serif text-3xl md:text-4xl text-charcoal-900 font-normal">
              Memora
            </h3>

            <p className="text-xs sm:text-sm text-charcoal-600 max-w-md font-light">
              Every moment of your wedding day, preserved through the eyes of those you love.
            </p>

            <div className="w-16 h-px bg-charcoal-200 my-2"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full text-xs text-charcoal-500 pt-2 gap-4">
              <div className="flex items-center space-x-1.5">
                <span>Memora &bull; Private Wedding Memory Albums</span>
              </div>

              <div>
                <span>&copy; {new Date().getFullYear()} Memora. All rights reserved.</span>
              </div>
            </div>

          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-charcoal-200 bg-ivory-100/60 pt-16 pb-12 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-5">
          
          <div className="flex items-center space-x-2 text-sage-600">
            <Heart className="w-5 h-5 fill-sage-600" />
          </div>

          <h3 className="font-serif text-3xl md:text-4xl text-charcoal-900 font-normal">
            {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}
          </h3>

          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md">
            {event.venue} &bull; {event.location}
            <br />
            {formatDate(event.weddingDate)}
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-charcoal-600 pt-2">
            <button
              onClick={() => onNavigate('portal')}
              className="hover:text-charcoal-950 transition-colors"
            >
              Guest Portal
            </button>
            <button
              onClick={() => onNavigate('couple')}
              className="hover:text-charcoal-950 font-medium transition-colors flex items-center space-x-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Couple Login</span>
            </button>
          </div>

          <div className="w-16 h-px bg-charcoal-200 my-3"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full text-xs text-charcoal-500 pt-2 gap-4">
            <div className="flex items-center space-x-1.5">
              <span>Memora Wedding Memories</span>
              <span>&bull;</span>
              <span>Private Guest Album Platform</span>
            </div>

            <div className="flex items-center space-x-4">
              <span>{event.location}</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
