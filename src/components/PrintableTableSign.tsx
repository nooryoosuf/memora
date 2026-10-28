import React, { useEffect, useState } from 'react';
import { WeddingEvent } from '../types';
import { QRCodeGenerator } from '../utils/qr';
import { formatDate } from '../utils/image';
import { Printer, Download, ArrowLeft, Heart, Sparkles } from 'lucide-react';

interface PrintableTableSignProps {
  event: WeddingEvent;
  onBack: () => void;
}

export const PrintableTableSign: React.FC<PrintableTableSignProps> = ({ event, onBack }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const eventUrl = `${window.location.origin}${window.location.pathname}#/w/${event.slug}`;

  useEffect(() => {
    QRCodeGenerator.toDataURL(eventUrl, 800).then((url) => {
      setQrDataUrl(url);
    });
  }, [eventUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `memora-qr-${event.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6">
      {/* Action Controls (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-ivory-100 p-4 rounded-2xl border border-charcoal-200 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadQr}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-charcoal-300 bg-white text-xs font-medium text-charcoal-800 hover:bg-ivory-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download High-Res QR</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium shadow-subtle transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Table Sign (A5 / 5x7")</span>
          </button>
        </div>
      </div>

      {/* The Printable Table Card */}
      <div className="flex justify-center">
        <div className="print-card w-full max-w-md bg-white border border-charcoal-300 rounded-3xl p-10 sm:p-12 text-center shadow-lift space-y-6 relative overflow-hidden">
          
          {/* Subtle ornamental border */}
          <div className="absolute inset-3 border border-charcoal-200 rounded-2xl pointer-events-none" />

          <div className="relative space-y-2 pt-2">
            <span className="font-serif italic text-sage-600 text-lg sm:text-xl">
              Share the love through your lens
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-950 font-normal tracking-tight">
              {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}
            </h1>
            <p className="text-xs uppercase tracking-widest text-charcoal-400 font-medium">
              {formatDate(event.weddingDate)} &bull; {event.venue}
            </p>
          </div>

          <div className="relative my-6 flex justify-center">
            <div className="p-4 bg-white rounded-2xl border-2 border-charcoal-100 shadow-subtle">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Wedding Photo Sharing QR Code"
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 bg-ivory-100 animate-pulse rounded-xl" />
              )}
            </div>
          </div>

          <div className="relative space-y-2 max-w-xs mx-auto">
            <p className="font-serif text-lg text-charcoal-900 font-medium leading-snug">
              Point your smartphone camera at this code to upload tonight's memories.
            </p>
            <p className="text-xs text-charcoal-500">
              No apps or passwords required &bull; Direct digital album upload
            </p>
          </div>

          <div className="relative pt-4 border-t border-charcoal-100 flex items-center justify-center space-x-1.5 text-[11px] text-charcoal-400">
            <Heart className="w-3.5 h-3.5 text-champagne-500 fill-champagne-500" />
            <span>Memora &bull; Forever Preserved</span>
          </div>

        </div>
      </div>
    </div>
  );
};
