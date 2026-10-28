import React, { useState } from 'react';
import { Album, Photo, WeddingEvent } from '../types';
import { storage } from '../services/storage';
import { formatDate } from '../utils/image';
import { downloadPhotosZip } from '../utils/zip';
import {
  BookOpen,
  Plus,
  Edit2,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  X,
  Play,
  Heart,
  Layers,
  ChevronRight,
  FolderHeart,
  User,
  Sparkles,
  Download,
} from 'lucide-react';

interface AlbumsViewProps {
  albums: Album[];
  photos: Photo[];
  event: WeddingEvent;
  isCoupleAuth: boolean;
  onOpenUpload: () => void;
  onRefresh: () => void;
  onLaunchSlideshow?: (albumId?: string) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({
  albums,
  photos,
  event,
  isCoupleAuth,
  onOpenUpload,
  onRefresh,
  onLaunchSlideshow,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumTab, setAlbumTab] = useState<'all' | 'guest' | 'curated'>('all');

  // Create / Edit Album State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [downloadingAlbumId, setDownloadingAlbumId] = useState<string | null>(null);

  const handleDownloadAlbumZip = async (album: Album, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const albumPhotos = photos.filter((p) => p.albumIds && p.albumIds.includes(album.id));
    if (albumPhotos.length === 0) {
      alert(`The "${album.title}" album has no photos to download.`);
      return;
    }
    setDownloadingAlbumId(album.id);
    const safeTitle = album.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await downloadPhotosZip(
      albumPhotos,
      `${event.slug}-album-${safeTitle}.zip`
    );
    setDownloadingAlbumId(null);
  };

  const activeAlbum = albums.find((a) => a.id === selectedAlbumId);
  const activeAlbumPhotos = selectedAlbumId
    ? photos.filter((p) => p.albumIds && p.albumIds.includes(selectedAlbumId))
    : [];

  const displayedAlbums = albums.filter((a) => {
    if (albumTab === 'guest') return a.type === 'guest';
    if (albumTab === 'curated') return a.type !== 'guest';
    return true;
  });

  const guestAlbumsCount = albums.filter((a) => a.type === 'guest').length;
  const curatedAlbumsCount = albums.filter((a) => a.type !== 'guest').length;

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    storage.createAlbum(newTitle.trim(), newDescription.trim(), undefined, 'curated');
    setNewTitle('');
    setNewDescription('');
    setShowCreateModal(false);
    onRefresh();
  };

  const handleStartEdit = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAlbum(album);
    setEditTitle(album.title);
    setEditDesc(album.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum || !editTitle.trim()) return;

    storage.updateAlbum(editingAlbum.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
    });
    setEditingAlbum(null);
    onRefresh();
  };

  // Couple Edit album title/description (Deletion disabled to protect memory archives)

  const handleSetCoverPhoto = (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedAlbumId) return;
    storage.updateAlbum(selectedAlbumId, {
      coverPhotoUrl: photo.thumbnailUrl || photo.url,
      coverPhotoId: photo.id,
    });
    onRefresh();
  };

  const handleRemovePhotoFromAlbum = (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedAlbumId) return;
    storage.removePhotosFromAlbum(selectedAlbumId, [photo.id]);
    onRefresh();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* ================= ALBUM DETAIL VIEW ================= */}
      {activeAlbum ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Back button & Album Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-200 pb-6">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedAlbumId(null)}
                className="inline-flex items-center space-x-1.5 text-xs text-charcoal-500 hover:text-charcoal-900 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Collections</span>
              </button>

              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
                  {activeAlbum.title}
                </h1>
                {activeAlbum.type === 'guest' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold">
                    Guest Contribution
                  </span>
                )}
              </div>

              {activeAlbum.guestName && (
                <p className="text-xs font-medium text-sage-700 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Shared by {activeAlbum.guestName}</span>
                </p>
              )}

              {activeAlbum.description && (
                <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl leading-relaxed italic">
                  "{activeAlbum.description}"
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-charcoal-500 font-medium">
                {activeAlbumPhotos.length} {activeAlbumPhotos.length === 1 ? 'memory' : 'memories'}
              </span>

              <button
                onClick={() => handleDownloadAlbumZip(activeAlbum)}
                disabled={downloadingAlbumId === activeAlbum.id || activeAlbumPhotos.length === 0}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-charcoal-300 bg-white hover:bg-ivory-100 disabled:opacity-50 text-charcoal-800 text-xs font-medium transition-colors shadow-subtle"
                title="Download this album as a .ZIP archive"
              >
                <Download className="w-3.5 h-3.5 text-sage-600" />
                <span>{downloadingAlbumId === activeAlbum.id ? 'Packaging ZIP...' : 'Download (.ZIP)'}</span>
              </button>

              {onLaunchSlideshow && activeAlbumPhotos.length > 0 && (
                <button
                  onClick={() => onLaunchSlideshow(activeAlbum.id)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-ivory-200 hover:bg-ivory-300 text-charcoal-900 text-xs font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-sage-600" />
                  <span>Album Slideshow</span>
                </button>
              )}
            </div>
          </div>

          {/* Photos inside this album */}
          {activeAlbumPhotos.length === 0 ? (
            <div className="text-center py-20 bg-ivory-100/50 rounded-2xl border border-charcoal-200/60 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="font-serif text-xl text-charcoal-800">
                This album is currently empty
              </p>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                Go to "All Memories" and use "Batch Organize" to add photographs to this collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeAlbumPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-xl overflow-hidden bg-charcoal-100 border border-charcoal-200 shadow-subtle"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.guestMessage || photo.originalFilename}
                      className="w-full h-full object-cover image-zoom-hover"
                    />
                  </div>

                  {/* Album Cover indicator */}
                  {activeAlbum.coverPhotoUrl === (photo.thumbnailUrl || photo.url) && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] bg-champagne-600 text-white font-semibold shadow-sm">
                      Album Cover
                    </div>
                  )}

                  {/* Couple Controls */}
                  {isCoupleAuth && (
                    <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleSetCoverPhoto(photo, e)}
                        className="p-1.5 rounded-full bg-charcoal-900/80 text-white hover:bg-champagne-600 transition-colors text-[10px]"
                        title="Set as album cover"
                      >
                        Set Cover
                      </button>

                      <button
                        onClick={(e) => handleRemovePhotoFromAlbum(photo, e)}
                        className="p-1.5 rounded-full bg-charcoal-900/80 text-white hover:bg-red-600 transition-colors"
                        title="Remove from album"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Caption overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.guestName && (
                      <p className="text-xs font-medium text-champagne-200 truncate">
                        {photo.guestName}
                      </p>
                    )}
                    {photo.guestMessage && (
                      <p className="text-[10px] text-ivory-100 line-clamp-1 italic">
                        "{photo.guestMessage}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= ALL ALBUMS GRID ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-charcoal-200/80 pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-sage-600 font-semibold">
                Private Digital Photo Books
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal mt-1">
                Guest &amp; Curated Albums
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-xl">
                Browse memories submitted as personal albums by individual guests, as well as your curated event chapters.
              </p>
            </div>

            {isCoupleAuth && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-xs sm:text-sm font-medium shadow-subtle transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Curated Album</span>
              </button>
            )}
          </div>

          {/* Sub-Tabs: All / Guest Albums / Curated */}
          <div className="flex items-center space-x-2 border-b border-charcoal-200 pb-3">
            <button
              onClick={() => setAlbumTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                albumTab === 'all'
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-ivory-100'
              }`}
            >
              All Collections ({albums.length})
            </button>

            <button
              onClick={() => setAlbumTab('guest')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                albumTab === 'guest'
                  ? 'bg-sage-700 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-ivory-100'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>Guest Albums ({guestAlbumsCount})</span>
            </button>

            <button
              onClick={() => setAlbumTab('curated')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                albumTab === 'curated'
                  ? 'bg-charcoal-900 text-white'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-ivory-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curated Chapters ({curatedAlbumsCount})</span>
            </button>
          </div>

          {/* Book-Collection Style Album Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedAlbums.map((album) => (
              <div
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden bg-ivory-50 border border-charcoal-200/80 shadow-subtle hover:shadow-lift transition-all duration-300 flex flex-col justify-between"
              >
                {/* Album Cover Art */}
                <div className="aspect-[16/11] overflow-hidden bg-charcoal-100 relative">
                  <img
                    src={album.coverPhotoUrl || event.coverImageUrl}
                    alt={album.title}
                    className="w-full h-full object-cover image-zoom-hover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity" />

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    {album.type === 'guest' ? (
                      <span className="bg-sage-700/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium flex items-center space-x-1">
                        <FolderHeart className="w-3 h-3" />
                        <span>Guest Album</span>
                      </span>
                    ) : (
                      <span className="bg-charcoal-900/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium flex items-center space-x-1">
                        <BookOpen className="w-3 h-3 text-champagne-300" />
                        <span>Curated</span>
                      </span>
                    )}
                  </div>

                  {/* Photo count pill */}
                  <div className="absolute top-3 right-3 bg-charcoal-900/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-champagne-300" />
                    <span>{album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}</span>
                  </div>

                  {/* Couple Download & Edit buttons */}
                  {isCoupleAuth && (
                    <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDownloadAlbumZip(album, e)}
                        disabled={downloadingAlbumId === album.id || album.photoCount === 0}
                        className="p-1.5 rounded-full bg-charcoal-900/80 text-white hover:bg-charcoal-900 disabled:opacity-50 transition-colors"
                        title={`Download ${album.title} as .ZIP`}
                      >
                        <Download className="w-3.5 h-3.5 text-champagne-300" />
                      </button>

                      <button
                        onClick={(e) => handleStartEdit(album, e)}
                        className="p-1.5 rounded-full bg-charcoal-900/80 text-white hover:bg-charcoal-900 transition-colors"
                        title="Edit album"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Album Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-serif text-2xl text-charcoal-900 font-normal group-hover:text-champagne-600 transition-colors">
                      {album.title}
                    </h3>
                    {album.guestName && (
                      <p className="text-xs font-medium text-sage-700 mt-0.5">
                        By {album.guestName}
                      </p>
                    )}
                    {album.description && (
                      <p className="text-xs text-charcoal-600 line-clamp-2 mt-1 leading-relaxed">
                        {album.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
                    <span>{formatDate(album.createdAt)}</span>
                    <span className="font-medium text-sage-700 flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform">
                      <span>Open Album</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CREATE ALBUM MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ivory-50 rounded-2xl border border-charcoal-200 p-6 max-w-md w-full shadow-lift space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-charcoal-900">Create Curated Album</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Album Title</label>
                <input
                  type="text"
                  placeholder="e.g. Behind the Scenes, Friends, Sunset Toasts"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="A short note about this collection of moments..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full border border-charcoal-200 text-charcoal-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-sage-600 text-white font-medium hover:bg-sage-700"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT ALBUM MODAL ================= */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ivory-50 rounded-2xl border border-charcoal-200 p-6 max-w-md w-full shadow-lift space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-charcoal-900">Edit Album Details</h3>
              <button
                onClick={() => setEditingAlbum(null)}
                className="text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Album Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal-700">Description</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-sage-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="px-4 py-2 rounded-full border border-charcoal-200 text-charcoal-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-sage-600 text-white font-medium hover:bg-sage-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
