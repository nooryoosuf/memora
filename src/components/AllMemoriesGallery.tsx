import React, { useState, useMemo, useEffect } from 'react';
import { Photo, Album, WeddingEvent } from '../types';
import { storage } from '../services/storage';
import { formatDate, formatDateTime, formatFileSize } from '../utils/image';
import { downloadPhotosZip } from '../utils/zip';
import {
  Heart,
  Download,
  Share2,
  CheckCircle,
  EyeOff,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  CheckSquare,
  Square,
  BookOpen,
  User,
  Clock,
  Sparkles,
  Maximize2,
} from 'lucide-react';

interface AllMemoriesGalleryProps {
  photos: Photo[];
  albums: Album[];
  event: WeddingEvent;
  isCoupleAuth: boolean;
  onOpenUpload: () => void;
  onRefresh: () => void;
}

export const AllMemoriesGallery: React.FC<AllMemoriesGalleryProps> = ({
  photos,
  albums,
  event,
  isCoupleAuth,
  onOpenUpload,
  onRefresh,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Lightbox Viewer state
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Batch Selection State for Couple
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [targetAlbumId, setTargetAlbumId] = useState<string>('');

  // Pagination / Incremental loading
  const PAGE_SIZE = 18;
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    let result = photos.filter((p) => {
      // If couple, they see all approved + pending + hidden if they wish,
      // but in public gallery view, non-authenticated guests only see approved
      if (!isCoupleAuth && p.status !== 'approved') return false;
      return true;
    });

    if (selectedAlbumId !== 'all') {
      result = result.filter((p) => p.albumIds && p.albumIds.includes(selectedAlbumId));
    }

    if (favoritesOnly) {
      result = result.filter((p) => p.isFavorite);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.guestName && p.guestName.toLowerCase().includes(q)) ||
          (p.guestMessage && p.guestMessage.toLowerCase().includes(q)) ||
          (p.originalFilename && p.originalFilename.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.uploadedAt).getTime();
      const timeB = new Date(b.uploadedAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [photos, selectedAlbumId, favoritesOnly, searchQuery, sortOrder, isCoupleAuth]);

  const visiblePhotos = filteredPhotos.slice(0, displayCount);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'Escape') setActivePhotoIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, filteredPhotos]);

  const handleNextPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) =>
      prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1
    );
  };

  const handleToggleFavorite = (photo: Photo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    storage.toggleFavorite(photo.id);
    onRefresh();
  };

  const handleModeratePhoto = (photo: Photo, status: 'approved' | 'hidden', e?: React.MouseEvent) => {
    e?.stopPropagation();
    storage.moderatePhoto(photo.id, status);
    onRefresh();
  };

  const handleDownloadSingle = (photo: Photo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.originalFilename || `wedding-photo-${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Batch actions
  const toggleSelectPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPhotoIds.length === visiblePhotos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(visiblePhotos.map((p) => p.id));
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadFavorites = async () => {
    const favs = photos.filter((p) => p.isFavorite);
    if (favs.length === 0) {
      alert('No favorite photos marked yet.');
      return;
    }
    setIsExporting(true);
    await downloadPhotosZip(favs, `${event.slug}-favorites.zip`);
    setIsExporting(false);
  };

  const handleDownloadAllPhotos = async () => {
    const approved = photos.filter((p) => p.status === 'approved');
    if (approved.length === 0) {
      alert('No approved photos to download.');
      return;
    }
    setIsExporting(true);
    await downloadPhotosZip(approved, `${event.slug}-all-memories.zip`);
    setIsExporting(false);
  };

  const handleDownloadSelected = async () => {
    const selected = photos.filter((p) => selectedPhotoIds.includes(p.id));
    if (selected.length === 0) return;
    setIsExporting(true);
    await downloadPhotosZip(selected, `${event.slug}-selected-photos.zip`);
    setIsExporting(false);
  };

  const handleBatchAssignAlbum = () => {
    if (!targetAlbumId || selectedPhotoIds.length === 0) return;
    storage.batchAssignToAlbum(selectedPhotoIds, targetAlbumId);
    setSelectedPhotoIds([]);
    setIsSelectMode(false);
    onRefresh();
  };

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-charcoal-200/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage-600 font-semibold">
            Digital Wedding Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal mt-1">
            All Memories
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-xl">
            Every moment captured by family and friends, preserved in full quality.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCoupleAuth && (
            <>
              {favoritesOnly ? (
                <button
                  onClick={handleDownloadFavorites}
                  disabled={isExporting}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full border border-red-300 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-800 text-xs sm:text-sm font-medium transition-colors shadow-subtle"
                >
                  <Download className="w-4 h-4 text-red-600" />
                  <span>{isExporting ? 'Packaging...' : 'Download Favorites (.ZIP)'}</span>
                </button>
              ) : (
                <button
                  onClick={handleDownloadAllPhotos}
                  disabled={isExporting}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full border border-charcoal-300 bg-white hover:bg-ivory-100 disabled:opacity-50 text-charcoal-800 text-xs sm:text-sm font-medium transition-colors shadow-subtle"
                >
                  <Download className="w-4 h-4 text-sage-600" />
                  <span>{isExporting ? 'Packaging...' : 'Download All (.ZIP)'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  setSelectedPhotoIds([]);
                }}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-colors ${
                  isSelectMode
                    ? 'bg-charcoal-900 text-white border-charcoal-900'
                    : 'border-charcoal-300 text-charcoal-800 hover:bg-ivory-100'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>{isSelectMode ? 'Cancel Selection' : 'Batch Organize'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-ivory-100/80 border border-charcoal-200/70 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Album Selector Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedAlbumId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedAlbumId === 'all'
                ? 'bg-charcoal-900 text-white'
                : 'bg-white text-charcoal-700 border border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            All Photos ({photos.length})
          </button>

          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedAlbumId === album.id
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:border-charcoal-300'
              }`}
            >
              {album.title} ({album.photoCount})
            </button>
          ))}

          {/* Favorites Filter */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              favoritesOnly
                ? 'bg-champagne-600 text-white'
                : 'bg-white text-charcoal-700 border border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-white' : 'text-champagne-600'}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search guest or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-charcoal-200 focus:outline-none focus:border-sage-500"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-white border border-charcoal-200 text-charcoal-700 focus:outline-none focus:border-sage-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Batch Action Bar (When in Select Mode) */}
      {isSelectMode && isCoupleAuth && (
        <div className="bg-charcoal-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center space-x-1.5 text-ivory-200 hover:text-white"
            >
              {selectedPhotoIds.length === visiblePhotos.length ? (
                <CheckSquare className="w-4 h-4 text-champagne-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Select All Visible ({visiblePhotos.length})</span>
            </button>
            <span>&bull;</span>
            <span className="text-champagne-300 font-semibold">
              {selectedPhotoIds.length} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={targetAlbumId}
              onChange={(e) => setTargetAlbumId(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-charcoal-800 text-white border border-charcoal-700 focus:outline-none"
            >
              <option value="">Move / Add to Album...</option>
              {albums.map((alb) => (
                <option key={alb.id} value={alb.id}>
                  {alb.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleBatchAssignAlbum}
              disabled={!targetAlbumId || selectedPhotoIds.length === 0}
              className="px-3 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-xs font-medium text-white transition-colors"
            >
              Add to Album
            </button>

            <button
              onClick={handleDownloadSelected}
              disabled={selectedPhotoIds.length === 0 || isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-charcoal-700 hover:bg-charcoal-600 disabled:opacity-50 text-xs font-medium text-white transition-colors flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5 text-champagne-300" />
              <span>{isExporting ? 'Packaging...' : `Download Selected (${selectedPhotoIds.length}) .ZIP`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-24 bg-ivory-100/50 rounded-3xl border border-charcoal-200/60 p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
            No memories found
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm mx-auto">
            {searchQuery || selectedAlbumId !== 'all' || favoritesOnly
              ? 'Try adjusting your filters or search terms.'
              : 'Photos will appear here as guests scan your table QR code and share memories.'}
          </p>
        </div>
      )}

      {/* Masonry / Balanced Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {visiblePhotos.map((photo, index) => {
          const isSelected = selectedPhotoIds.includes(photo.id);

          return (
            <div
              key={photo.id}
              onClick={() => {
                if (isSelectMode) {
                  toggleSelectPhoto(photo.id, { stopPropagation: () => {} } as any);
                } else {
                  setActivePhotoIndex(index);
                }
              }}
              className={`group relative rounded-2xl overflow-hidden bg-charcoal-100 border transition-all duration-300 cursor-pointer shadow-subtle hover:shadow-soft ${
                isSelected
                  ? 'border-sage-600 ring-2 ring-sage-500'
                  : 'border-charcoal-200/80 hover:border-charcoal-300'
              }`}
            >
              {/* Photo Image with smooth responsive thumbnail */}
              <div className="aspect-[4/5] overflow-hidden bg-charcoal-200">
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.guestMessage || photo.originalFilename}
                  className="w-full h-full object-cover image-zoom-hover"
                  loading="lazy"
                />
              </div>

              {/* Status Badge (if Pending or Hidden) */}
              {isCoupleAuth && photo.status !== 'approved' && (
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-charcoal-900/80 text-champagne-300 backdrop-blur-sm">
                  {photo.status}
                </div>
              )}

              {/* Top Right Heart Favorite Button */}
              <button
                onClick={(e) => handleToggleFavorite(photo, e)}
                className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
                  photo.isFavorite
                    ? 'bg-white text-red-500 shadow-sm opacity-100'
                    : 'bg-charcoal-950/40 text-white hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100'
                }`}
                title={photo.isFavorite ? 'Favorited' : 'Add to Favorites'}
              >
                <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-red-500' : ''}`} />
              </button>

              {/* Checkbox for Select Mode */}
              {isSelectMode && (
                <div className="absolute top-2.5 left-2.5 p-1 rounded-md bg-charcoal-900/70 text-white">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-champagne-400" />
                  ) : (
                    <Square className="w-5 h-5 text-white" />
                  )}
                </div>
              )}

              {/* Bottom Gradient Overlay on Hover with Guest Attribution */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/40 to-transparent p-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {photo.guestName && (
                  <p className="text-xs font-medium text-champagne-200 truncate flex items-center space-x-1">
                    <User className="w-3 h-3 inline" />
                    <span>{photo.guestName}</span>
                  </p>
                )}
                {photo.guestMessage && (
                  <p className="text-[11px] text-ivory-100 italic line-clamp-1 mt-0.5">
                    "{photo.guestMessage}"
                  </p>
                )}
                <p className="text-[10px] text-ivory-300 mt-1">
                  {formatDate(photo.uploadedAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Incremental Load More Button */}
      {visiblePhotos.length < filteredPhotos.length && (
        <div className="text-center pt-6 pb-10">
          <button
            onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
            className="px-8 py-3 rounded-full border border-charcoal-300 bg-white text-charcoal-800 text-xs sm:text-sm font-medium hover:bg-ivory-100 transition-colors shadow-subtle"
          >
            Load More Memories ({filteredPhotos.length - visiblePhotos.length} remaining)
          </button>
        </div>
      )}

      {/* ================= FULLSCREEN LIGHTBOX VIEWER ================= */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-fadeIn">
          
          {/* Top Bar: Info & Close */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-champagne-300 font-mono">
                {activePhotoIndex! + 1} / {filteredPhotos.length}
              </span>
              {activePhoto.guestName && (
                <span className="text-xs text-ivory-200">
                  Shared by <strong className="text-white font-medium">{activePhoto.guestName}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownloadSingle(activePhoto)}
                className="p-2 rounded-full hover:bg-white/10 text-ivory-200 hover:text-white transition-colors"
                title="Download original photograph"
              >
                <Download className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleToggleFavorite(activePhoto)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                  activePhoto.isFavorite ? 'text-red-400' : 'text-ivory-200'
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${activePhoto.isFavorite ? 'fill-red-400' : ''}`} />
              </button>

              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2 rounded-full hover:bg-white/15 text-white transition-colors ml-2"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Center Image with Previous / Next Arrows */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={activePhoto.url}
              alt={activePhoto.originalFilename}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-lg shadow-lift select-none"
            />

            {/* Previous Button */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-6 p-3 rounded-full bg-charcoal-900/60 hover:bg-charcoal-900/90 text-white transition-all backdrop-blur-sm"
              title="Previous photo (Arrow Left)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-6 p-3 rounded-full bg-charcoal-900/60 hover:bg-charcoal-900/90 text-white transition-all backdrop-blur-sm"
              title="Next photo (Arrow Right)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Caption and Metadata Bar */}
          <div className="max-w-2xl mx-auto w-full text-center space-y-1.5 text-white/90">
            {activePhoto.guestMessage && (
              <p className="font-serif italic text-base sm:text-lg text-ivory-100">
                "{activePhoto.guestMessage}"
              </p>
            )}

            <div className="flex items-center justify-center space-x-4 text-xs text-ivory-400">
              <span>{formatDateTime(activePhoto.uploadedAt)}</span>
              <span>&bull;</span>
              <span>{formatFileSize(activePhoto.fileSize)}</span>
              {activePhoto.dimensions && (
                <>
                  <span>&bull;</span>
                  <span>{activePhoto.dimensions.width} &times; {activePhoto.dimensions.height}</span>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
