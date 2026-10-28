# Memora — Luxury Wedding Memories Platform

A modern, mobile-first wedding photo-sharing platform where guests scan a QR code, upload photos from their devices without accounts or apps, and share memories directly with the couple.

---

## 💍 Highlights & Design Philosophy

- **Editorial Luxury Visual Identity**: Warm ivory (`#FAF8F5`) backgrounds, soft charcoal typography, muted sage and subtle champagne gold accents, inspired by fine-art wedding publications (Kinfolk, Vogue Weddings).
- **Refined Typography Pairing**: *Cormorant Garamond* for headlines and *Plus Jakarta Sans* / *DM Sans* for interface controls.
- **Effortless Guest Experience**: Zero sign-ups or app downloads. Instant multi-photo upload from smartphone camera rolls with client-side thumbnail generation and progress indicators.
- **Warm Confirmation Screen**: Celebratory champagne & gold confetti animation, verified upload counts, and seamless guestbook note completion.
- **Couple's Private Lounge**: Authenticated with an event PIN (default: `2026`), answering the 3 core questions immediately:
  1. *How many memories have we collected?*
  2. *How many people have shared them?*
  3. *What is happening with our wedding gallery?*
- **Curated Albums**: Ceremony & Vows, Portraits & Rings, Reception & Toasts, Candid Moments, and custom couple albums with dynamic photo counts.
- **Reception Slideshow**: Fullscreen live presentation mode with smooth transitions, Ken Burns effect, and a toggleable corner QR code for guests at the venue.
- **Printable Table Sign**: Ready-to-print luxury A5 / 5×7" table card with couple names, date, instructions, and high-resolution QR code.
- **Bulk Download & Export**: Built-in ZIP packaging tool for instant export of the photo archive and guestbook.

---

## 🚀 Getting Started

### 1. Install & Run
```bash
npm install
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### 2. Couple Dashboard Access
- Click **"Couple Access"** in the top navigation bar.
- Enter the default security PIN: `2026`.
- Access event statistics, upload moderation, album organization, printable QR signs, and bulk export.

---

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript & Vite
- **Styling**: TailwindCSS with bespoke luxury color palette & typography tokens
- **Icons**: Lucide Icons
- **Storage & State**: Event-scoped persistent database with client-side image processing
- **QR Engine**: Standalone QR vector matrix generator
- **ZIP Engine**: Client-side RFC 1950/1951 ZIP container builder
- **Celebration**: Custom Canvas-based confetti particle simulation
