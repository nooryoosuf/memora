import React, { useState, useRef, useEffect } from 'react';
import { WeddingEvent, UploadFileItem, Album } from '../types';
import { storage } from '../services/storage';
import { processClientImage } from '../utils/image';
import { triggerCelebration } from '../utils/confetti';
import { getThemeConfig } from '../utils/theme';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Heart,
  FolderHeart,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface GuestUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: WeddingEvent;
  onUploadComplete: () => void;
  onViewMyShared: () => void;
  initialFiles?: File[];
}

export const GuestUploadModal: React.FC<GuestUploadModalProps> = ({
  isOpen,
  onClose,
  event,
  onUploadComplete,
  onViewMyShared,
  initialFiles,
}) => {
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [albumTitle, setAlbumTitle] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAlbum, setCreatedAlbum] = useState<Album | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const theme = getThemeConfig(event.theme);

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
  const MAX_FILES_PER_BATCH = 50;

  // Process and add raw File objects into UploadFileItem
  const addRawFiles = (rawFiles: File[]) => {
    setUploadError(null);
    const newItems: UploadFileItem[] = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

    for (const file of rawFiles) {
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
        setUploadError(`"${file.name}" is not a supported format. Please upload JPEG, PNG, or WebP.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" exceeds the 25MB limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: 'file_' + Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        progress: 0,
        status: 'pending',
      });
    }

    setFiles((prev) => [...prev, ...newItems].slice(0, MAX_FILES_PER_BATCH));
  };

  // When modal opens with initialFiles (selected right from gallery/camera)
  useEffect(() => {
    if (isOpen) {
      if (initialFiles && initialFiles.length > 0) {
        addRawFiles(initialFiles);
      }
    } else {
      setFiles([]);
      setIsUploading(false);
      setIsSuccess(false);
      setUploadError(null);
      setCreatedAlbum(null);
    }
  }, [isOpen, initialFiles]);

  if (!isOpen) return null;

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleStartUpload = async () => {
    if (files.length === 0 || isUploading || !albumTitle.trim()) return;

    setIsUploading(true);
    setUploadError(null);

    const processedData: Array<{
      url: string;
      thumbnailUrl?: string;
      originalFilename: string;
      fileSize: number;
      dimensions?: { width: number; height: number };
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const item = files[i];

      if (item.status === 'success') {
        continue;
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading', progress: 20 } : f))
      );

      try {
        await new Promise((r) => setTimeout(r, 80));
        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: 60 } : f))
        );

        const processed = await processClientImage(item.file);

        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: 95 } : f))
        );

        processedData.push({
          url: processed.originalDataUrl,
          thumbnailUrl: processed.thumbnailDataUrl,
          originalFilename: processed.filename,
          fileSize: processed.fileSize,
          dimensions: { width: processed.width, height: processed.height },
        });

        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'success', progress: 100 } : f))
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'error', error: err?.message || 'Processing failed' }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    if (processedData.length > 0) {
      const result = storage.addPhotosBatch(
        processedData,
        {
          albumTitle: albumTitle.trim(),
          guestMessage: guestMessage.trim() || undefined,
        },
        event.id
      );

      setUploadedCount(processedData.length);
      setCreatedAlbum(result.album);
      setIsSuccess(true);
      onUploadComplete();

      setTimeout(() => {
        triggerCelebration();
      }, 150);
    } else {
      setUploadError('Unable to upload files. Please check connection and retry.');
    }
  };

  const handleResetForMore = () => {
    setFiles([]);
    setIsSuccess(false);
    setUploadError(null);
    setCreatedAlbum(null);
    setAlbumTitle('');
    setGuestMessage('');
    addMoreInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-ivory-50 rounded-3xl shadow-lift border border-charcoal-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-charcoal-100 flex items-center justify-between bg-ivory-100/70">
          <div>
            <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
              {isSuccess ? 'Thank You' : 'Name Your Album'}
            </h2>
            <p className="text-xs text-charcoal-500">
              {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}'s Wedding
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-ivory-200 transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7">
          {/* ================= STEP 2: THANK YOU CONFIRMATION SCREEN ================= */}
          {isSuccess ? (
            <div className="text-center space-y-6 py-4 animate-fadeIn">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-subtle text-white"
                style={{ backgroundColor: theme.primary }}
              >
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
                  Thank You!
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Your memories have been packaged into your album <strong className="text-charcoal-900 font-medium">"{createdAlbum?.title}"</strong> ({uploadedCount} {uploadedCount === 1 ? 'photo' : 'photos'}) and safely delivered to {event.coupleNames.partner1} &amp; {event.coupleNames.partner2}.
                </p>
              </div>

              <div className="p-4 bg-ivory-100 rounded-2xl border border-charcoal-200/80 max-w-sm mx-auto text-left flex items-center space-x-3 text-xs text-charcoal-700">
                <FolderHeart className="w-7 h-7 text-sage-600 shrink-0" />
                <div>
                  <p className="font-semibold text-charcoal-900">Your Private Memory Album</p>
                  <p className="text-[11px] text-charcoal-500 mt-0.5">
                    Your photos are preserved privately. You can view what you shared below.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetForMore}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full border border-charcoal-300 text-charcoal-800 text-xs font-medium hover:bg-ivory-100 transition-colors"
                >
                  <Camera className="w-4 h-4 text-sage-600" />
                  <span>Upload More Photos</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onViewMyShared();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-full text-white text-xs font-medium shadow-subtle transition-all hover:opacity-95"
                  style={{ backgroundColor: theme.primary }}
                >
                  <span>See What You Shared</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ================= STEP 1: PREVIEW SELECTED PHOTOS + NAME ALBUM + WRITE MESSAGE ================= */
            <div className="space-y-5">
              
              {/* Selected Photos Carousel / Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-charcoal-700 font-semibold px-0.5">
                  <span>Selected Photos ({files.length})</span>
                  <button
                    type="button"
                    onClick={() => addMoreInputRef.current?.click()}
                    className="text-sage-700 hover:text-sage-800 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More</span>
                  </button>
                </div>

                {/* Hidden input to add more files to current selection */}
                <input
                  ref={addMoreInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addRawFiles(Array.from(e.target.files));
                  }}
                />

                {files.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1.5 border border-charcoal-200/80 rounded-2xl bg-ivory-100/60">
                    {files.map((item) => (
                      <div
                        key={item.id}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-charcoal-100 border border-charcoal-200/80"
                      >
                        <img
                          src={item.previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />

                        {item.status === 'uploading' && (
                          <div className="absolute inset-0 bg-charcoal-900/60 flex items-center justify-center text-white">
                            <RefreshCw className="w-4 h-4 animate-spin text-champagne-300" />
                          </div>
                        )}

                        {item.status === 'success' && (
                          <div className="absolute inset-0 bg-sage-900/70 flex items-center justify-center text-white">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        )}

                        {item.status === 'pending' && !isUploading && (
                          <button
                            onClick={() => removeFile(item.id)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-charcoal-950/70 text-white hover:bg-red-600 transition-colors"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => addMoreInputRef.current?.click()}
                    className="border-2 border-dashed border-charcoal-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-ivory-100 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-charcoal-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-charcoal-700">No photos selected</p>
                    <p className="text-[11px] text-charcoal-400">Tap here to choose photos from your gallery</p>
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Album Title */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-charcoal-800 flex items-center justify-between">
                  <span>Name Your Album <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-charcoal-400 font-normal">Shown to couple</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Noor's Memories, Table 4, Cocktail Hour, Ceremony"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    disabled={isUploading}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-white text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-all placeholder:text-charcoal-400"
                  />
                  <FolderHeart className="w-4 h-4 text-charcoal-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Personal Note for the Couple */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-800 flex items-center justify-between">
                  <span>A Personal Note or Message for the Couple (Optional)</span>
                  <span className="text-[10px] text-charcoal-400 font-normal">Appears with your album</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a sweet message, advice, or congratulatory note to accompany your album..."
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-white text-xs sm:text-sm text-charcoal-900 focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-all placeholder:text-charcoal-400"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartUpload}
                  disabled={files.length === 0 || isUploading || !albumTitle.trim()}
                  className={`w-full py-3.5 rounded-full text-white font-medium text-sm shadow-subtle flex items-center justify-center space-x-2 transition-all ${
                    files.length === 0 || isUploading || !albumTitle.trim()
                      ? 'bg-charcoal-300 cursor-not-allowed opacity-70'
                      : 'hover:opacity-95 active:scale-98'
                  }`}
                  style={{
                    backgroundColor:
                      files.length > 0 && !isUploading && albumTitle.trim()
                        ? theme.primary
                        : undefined,
                  }}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Packaging and sending album...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>
                        {files.length > 0
                          ? `Submit ${files.length} ${files.length === 1 ? 'Photo' : 'Photos'} as "${albumTitle.trim() || 'My Album'}"`
                          : 'Select Photos to Submit'}
                      </span>
                    </>
                  )}
                </button>

                {!albumTitle.trim() && files.length > 0 && (
                  <p className="text-center text-[11px] text-charcoal-500 mt-2">
                    Enter an album name above (e.g. <em>Noor's Memories</em>) to share with the couple.
                  </p>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
