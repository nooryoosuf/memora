import React, { useState } from 'react';
import { GuestbookEntry, WeddingEvent } from '../types';
import { storage } from '../services/storage';
import { formatDate } from '../utils/image';
import { SimpleZip } from '../utils/zip';
import {
  MessageSquare,
  Send,
  Heart,
  EyeOff,
  CheckCircle,
  Download,
  User,
  Sparkles,
} from 'lucide-react';

interface GuestbookViewProps {
  entries: GuestbookEntry[];
  event: WeddingEvent;
  isCoupleAuth: boolean;
  onRefresh: () => void;
}

export const GuestbookView: React.FC<GuestbookViewProps> = ({
  entries,
  event,
  isCoupleAuth,
  onRefresh,
}) => {
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    storage.addGuestbookEntry({
      guestName: guestName.trim() || 'Anonymous Guest',
      message: message.trim(),
    });

    setMessage('');
    setGuestName('');
    setIsSubmitting(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4000);
    onRefresh();
  };

  const handleModerate = (id: string, status: 'approved' | 'hidden') => {
    storage.moderateGuestbookEntry(id, status);
    onRefresh();
  };

  const handleExportGuestbook = () => {
    let content = `# Wedding Guestbook — ${event.coupleNames.partner1} & ${event.coupleNames.partner2}\n`;
    content += `Venue: ${event.venue}, ${event.location}\n`;
    content += `Date: ${formatDate(event.weddingDate)}\n\n`;
    content += `---\n\n`;

    entries.forEach((entry, idx) => {
      content += `### ${idx + 1}. From: ${entry.guestName} (${formatDate(entry.createdAt)})\n`;
      content += `"${entry.message}"\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    SimpleZip.downloadBlob(blob, `guestbook-${event.slug}.md`);
  };

  const visibleEntries = isCoupleAuth ? entries : entries.filter((e) => e.status === 'approved');

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Editorial Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-sage-600 font-semibold">
          Words of Love &amp; Well Wishes
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal">
          The Digital Guestbook
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-lg mx-auto leading-relaxed">
          Leave a message, advice for married life, or a favorite memory from our celebration.
        </p>

        {isCoupleAuth && entries.length > 0 && (
          <div className="pt-2">
            <button
              onClick={handleExportGuestbook}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-charcoal-300 bg-white text-xs text-charcoal-700 hover:bg-ivory-100 transition-colors shadow-subtle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Guestbook ({entries.length} notes)</span>
            </button>
          </div>
        )}
      </div>

      {/* Guest Note Submission Box */}
      <div className="bg-ivory-100/80 border border-charcoal-200/80 rounded-3xl p-6 sm:p-8 shadow-soft max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 mb-4 text-charcoal-900">
          <Heart className="w-5 h-5 text-champagne-600 fill-champagne-600" />
          <h2 className="font-serif text-2xl font-normal">Write to the Couple</h2>
        </div>

        {successNotice && (
          <div className="p-3 bg-sage-50 border border-sage-200 text-sage-800 rounded-xl text-xs flex items-center space-x-2 mb-4 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-sage-600 shrink-0" />
            <span>Thank you! Your note has been added to our wedding book.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Aunt Claire, Sarah & Tom, The Henderson Family"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-white text-sm text-charcoal-900 focus:outline-none focus:border-sage-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              maxLength={800}
              placeholder="Write your wishes, blessings, or favorite memory..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-white text-sm text-charcoal-900 focus:outline-none focus:border-sage-500"
            />
            <div className="flex justify-end text-[10px] text-charcoal-400">
              {message.length} / 800 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-full bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white text-sm font-medium shadow-subtle transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Sign the Guestbook</span>
          </button>
        </form>
      </div>

      {/* Guestbook Notes Grid (Handwritten / Fine Paper Stationery Vibe) */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-charcoal-500 font-semibold text-center mb-6">
          Memories &amp; Wishes ({visibleEntries.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleEntries.map((entry) => (
            <div
              key={entry.id}
              className={`relative bg-ivory-50 rounded-2xl p-6 sm:p-7 border transition-all shadow-subtle hover:shadow-soft flex flex-col justify-between ${
                entry.status === 'hidden'
                  ? 'border-red-200 bg-red-50/20 opacity-60'
                  : 'border-charcoal-200/70 hover:border-charcoal-300'
              }`}
            >
              {/* Note Content */}
              <div className="space-y-4">
                {entry.photoUrl && (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-charcoal-100 mb-3 border border-charcoal-100">
                    <img
                      src={entry.photoUrl}
                      alt="Attached memory"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="font-serif italic text-lg sm:text-xl text-charcoal-800 leading-relaxed font-normal">
                  "{entry.message}"
                </p>
              </div>

              {/* Author & Date Footer */}
              <div className="pt-5 mt-4 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-sage-600" />
                  <span className="font-semibold text-charcoal-900">{entry.guestName}</span>
                </div>

                <span>{formatDate(entry.createdAt)}</span>
              </div>

              {/* Couple Moderation Controls */}
              {isCoupleAuth && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-ivory-100 px-2 py-1 rounded-full border border-charcoal-200 text-[10px]">
                  {entry.status === 'hidden' ? (
                    <button
                      onClick={() => handleModerate(entry.id, 'approved')}
                      className="text-sage-700 hover:underline flex items-center space-x-0.5"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Unhide</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(entry.id, 'hidden')}
                      className="text-charcoal-600 hover:text-red-600 flex items-center space-x-0.5"
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
