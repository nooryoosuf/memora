export interface ProcessedImage {
  originalDataUrl: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
  fileSize: number;
  filename: string;
}

/**
 * Reads a File and produces a responsive thumbnail + optimized storage version
 */
export async function processClientImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file format'));
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Generate thumbnail (max dimension 600px)
        const thumbCanvas = document.createElement('canvas');
        const maxThumb = 600;
        let thumbW = width;
        let thumbH = height;
        if (thumbW > maxThumb || thumbH > maxThumb) {
          if (thumbW > thumbH) {
            thumbH = Math.round((thumbH * maxThumb) / thumbW);
            thumbW = maxThumb;
          } else {
            thumbW = Math.round((thumbW * maxThumb) / thumbH);
            thumbH = maxThumb;
          }
        }
        thumbCanvas.width = thumbW;
        thumbCanvas.height = thumbH;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (thumbCtx) {
          thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
        }
        const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.82);

        // Generate optimized storage image (max dimension 2400px for retina displays)
        const optCanvas = document.createElement('canvas');
        const maxOpt = 2400;
        let optW = width;
        let optH = height;
        if (optW > maxOpt || optH > maxOpt) {
          if (optW > optH) {
            optH = Math.round((optH * maxOpt) / optW);
            optW = maxOpt;
          } else {
            optW = Math.round((optW * maxOpt) / optH);
            optH = maxOpt;
          }
        }
        optCanvas.width = optW;
        optCanvas.height = optH;
        const optCtx = optCanvas.getContext('2d');
        if (optCtx) {
          optCtx.drawImage(img, 0, 0, optW, optH);
        }
        const originalDataUrl = optCanvas.toDataURL('image/jpeg', 0.90);

        resolve({
          originalDataUrl,
          thumbnailDataUrl,
          width,
          height,
          fileSize: file.size,
          filename: file.name,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export function formatDateTime(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
