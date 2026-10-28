import React, { useState, useEffect } from 'react';
import { WeddingEvent, Photo, Album, GuestbookEntry } from './types';
import { storage, MEMORA_CHANGE_EVENT } from './services/storage';
import { getThemeConfig } from './utils/theme';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GuestPortal } from './components/GuestPortal';
import { AllMemoriesGallery } from './components/AllMemoriesGallery';
import { AlbumsView } from './components/AlbumsView';
import { GuestbookView } from './components/GuestbookView';
import { CoupleDashboard } from './components/CoupleDashboard';
import { GuestUploadModal } from './components/GuestUploadModal';
import { ReceptionSlideshow } from './components/ReceptionSlideshow';
import { MemoraLanding } from './components/MemoraLanding';
import { AdminStudio } from './components/AdminStudio';

export function App() {
  const [allEvents, setAllEvents] = useState<WeddingEvent[]>(storage.getAllEvents());
  const [event, setEvent] = useState<WeddingEvent>(storage.getEvent());
  const [photos, setPhotos] = useState<Photo[]>(storage.getPhotos({ status: 'all' }));
  const [albums, setAlbums] = useState<Album[]>(storage.getAlbums());
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>(storage.getGuestbook('all'));
  const [isCoupleAuth, setIsCoupleAuth] = useState<boolean>(storage.isCoupleAuthenticated());

  // Guest-specific private data for THIS event
  const [myPhotos, setMyPhotos] = useState<Photo[]>(storage.getMyPhotos());
  const [myAlbums, setMyAlbums] = useState<Album[]>(storage.getMyAlbums());
  const [myNotes, setMyNotes] = useState<GuestbookEntry[]>(storage.getMyNotes());

  // Current view: 'memora' | 'portal' | 'couple' | 'gallery' | 'albums' | 'guestbook' | 'slideshow'
  const [currentView, setCurrentView] = useState<string>('portal');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);
  const [slideshowAlbumId, setSlideshowAlbumId] = useState<string | undefined>(undefined);

  const refreshData = () => {
    const updatedEvents = storage.getAllEvents();
    setAllEvents(updatedEvents);
    const active = storage.getEvent();
    setEvent(active);
    setPhotos(storage.getPhotos({ status: 'all', eventId: active.id }));
    setAlbums(storage.getAlbums(active.id));
    setGuestbook(storage.getGuestbook('all', active.id));
    setIsCoupleAuth(storage.isCoupleAuthenticated(active.id));
    setMyPhotos(storage.getMyPhotos(active.id));
    setMyAlbums(storage.getMyAlbums(active.id));
    setMyNotes(storage.getMyNotes(active.id));
  };

  useEffect(() => {
    const handleSync = () => {
      refreshData();
    };
    window.addEventListener(MEMORA_CHANGE_EVENT, handleSync);
    return () => window.removeEventListener(MEMORA_CHANGE_EVENT, handleSync);
  }, []);

  // Hash route parser supporting:
  // '' or '#' or '#/' -> Memora Landing
  // '#/w/:slug' -> Guest Portal
  // '#/w/:slug/couple' -> Couple Dashboard
  const parseHashRoute = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '').trim();

    if (!hash || hash === 'memora') {
      setCurrentView('memora');
      return;
    }

    if (hash === 'admin' || hash === 'studio') {
      setCurrentView('admin');
      return;
    }

    const match = hash.match(/^w\/([^\/]+)(?:\/([^\/]+))?$/);
    if (match) {
      const slug = match[1];
      const subView = match[2];

      const targetEvent = storage.getEventBySlug(slug);
      if (targetEvent) {
        storage.setActiveEvent(targetEvent.id);
        setEvent(targetEvent);
        setIsCoupleAuth(storage.isCoupleAuthenticated(targetEvent.id));

        if (subView) {
          if (['couple', 'gallery', 'albums', 'guestbook', 'slideshow'].includes(subView)) {
            setCurrentView(subView);
          } else {
            setCurrentView('portal');
          }
        } else {
          setCurrentView('portal');
        }
      }
      return;
    }

    if (['couple', 'gallery', 'albums', 'guestbook', 'slideshow'].includes(hash)) {
      setCurrentView(hash);
    } else {
      setCurrentView('portal');
    }
  };

  useEffect(() => {
    parseHashRoute();
    const handleHashChange = () => parseHashRoute();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: string) => {
    if (view === 'memora') {
      setCurrentView('memora');
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'admin' || view === 'studio') {
      setCurrentView('admin');
      window.location.hash = '/admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const slug = event.slug;
    if (view === 'portal') {
      setCurrentView('portal');
      window.location.hash = `/w/${slug}`;
    } else {
      setCurrentView(view);
      window.location.hash = `/w/${slug}/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEvent = (selected: WeddingEvent) => {
    storage.setActiveEvent(selected.id);
    setEvent(selected);
    refreshData();
    setCurrentView('couple');
    window.location.hash = `/w/${selected.slug}/couple`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUpload = (files?: File[]) => {
    if (files && files.length > 0) {
      setSelectedFilesForUpload(files);
    } else {
      setSelectedFilesForUpload([]);
    }
    setIsUploadModalOpen(true);
  };

  const handleLogout = () => {
    storage.setCoupleAuthenticated(false, event.id);
    setIsCoupleAuth(false);
    setCurrentView('portal');
    window.location.hash = `/w/${event.slug}`;
    refreshData();
  };

  const handleScrollToMyShared = () => {
    setCurrentView('portal');
    setTimeout(() => {
      const el = document.getElementById('my-shared-memories');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const pendingPhotosCount = photos.filter((p) => p.status === 'pending').length;
  const theme = getThemeConfig(event.theme);

  // Reception Slideshow
  if (currentView === 'slideshow' && isCoupleAuth) {
    return (
      <ReceptionSlideshow
        photos={photos}
        event={event}
        albumId={slideshowAlbumId}
        onExit={() => handleNavigate('couple')}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-champagne-200 transition-colors"
      style={{ backgroundColor: currentView === 'memora' ? '#FAF8F5' : theme.bgLight }}
    >
      {/* Top Navbar: Only shown when inside a wedding view or couple suite, NOT cluttering the minimal guest hero */}
      {currentView !== 'portal' && (
        <Navbar
          event={event}
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenUpload={() => handleOpenUpload()}
          isCoupleAuth={isCoupleAuth}
          pendingCount={pendingPhotosCount}
          onLogout={handleLogout}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 0: MAIN PLATFORM HOMEPAGE (Named MEMORA) */}
        {currentView === 'memora' && (
          <MemoraLanding
            onNavigate={handleNavigate}
            onOpenCoupleLogin={(slug) => {
              if (slug) {
                const ev = storage.getEventBySlug(slug);
                if (ev) storage.setActiveEvent(ev.id);
              }
              handleNavigate('couple');
            }}
            onOpenGuestPortal={(slug) => {
              const ev = storage.getEventBySlug(slug);
              if (ev) {
                storage.setActiveEvent(ev.id);
                setEvent(ev);
                setCurrentView('portal');
                window.location.hash = `/w/${ev.slug}`;
                refreshData();
              }
            }}
          />
        )}

        {/* VIEW: ADMIN STUDIO (Backend for creating galleries & issuing codes) */}
        {currentView === 'admin' && (
          <AdminStudio
            events={allEvents}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            onRefresh={refreshData}
          />
        )}

        {/* VIEW 1: Couple Dashboard / PIN Gate */}
        {currentView === 'couple' && (
          <CoupleDashboard
            event={event}
            photos={photos}
            albums={albums}
            guestbook={guestbook}
            isCoupleAuth={isCoupleAuth}
            onRefresh={refreshData}
            onNavigate={handleNavigate}
            onOpenUpload={() => handleOpenUpload()}
            allEvents={allEvents}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {/* VIEW 2: Couple's Full Photo Gallery (Only if couple authenticated) */}
        {currentView === 'gallery' && isCoupleAuth && (
          <AllMemoriesGallery
            photos={photos}
            albums={albums}
            event={event}
            isCoupleAuth={isCoupleAuth}
            onOpenUpload={() => handleOpenUpload()}
            onRefresh={refreshData}
          />
        )}

        {/* VIEW 3: Couple's Guest & Curated Albums (Only if couple authenticated) */}
        {currentView === 'albums' && isCoupleAuth && (
          <AlbumsView
            albums={albums}
            photos={photos}
            event={event}
            isCoupleAuth={isCoupleAuth}
            onOpenUpload={() => handleOpenUpload()}
            onRefresh={refreshData}
            onLaunchSlideshow={(albumId) => {
              setSlideshowAlbumId(albumId);
              setCurrentView('slideshow');
            }}
          />
        )}

        {/* VIEW 4: Couple's Full Guestbook (Only if couple authenticated) */}
        {currentView === 'guestbook' && isCoupleAuth && (
          <GuestbookView
            entries={guestbook}
            event={event}
            isCoupleAuth={isCoupleAuth}
            onRefresh={refreshData}
          />
        )}

        {/* VIEW 5: GUEST PORTAL (Minimal 100vh cover background overlay with 3 options + shared photos below mobile viewport) */}
        {currentView === 'portal' && (
          <GuestPortal
            event={event}
            myPhotos={myPhotos}
            myAlbums={myAlbums}
            myNotes={myNotes}
            onOpenUpload={handleOpenUpload}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Footer: Hidden on minimal guest portal screen to keep it pure */}
      {currentView !== 'portal' && (
        <Footer
          event={event}
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenUpload={() => handleOpenUpload()}
        />
      )}

      {/* Dedicated Guest Upload Modal */}
      <GuestUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFilesForUpload([]);
        }}
        event={event}
        onUploadComplete={refreshData}
        onViewMyShared={handleScrollToMyShared}
        initialFiles={selectedFilesForUpload}
      />
    </div>
  );
}

export default App;
