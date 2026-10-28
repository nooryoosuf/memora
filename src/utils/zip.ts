// Pure TypeScript Zip Archive Creator (Store mode / RFC 1950/1951 ZIP container)
// Zero external dependencies, fast, safe for high-res images and text
import { Photo, GuestbookEntry } from '../types';

export interface ZipEntry {
  filename: string;
  data: Uint8Array | string;
}

export class SimpleZip {
  private entries: ZipEntry[] = [];

  addFile(filename: string, content: Uint8Array | string) {
    this.entries.push({ filename, data: content });
  }

  async addFileFromUrl(filename: string, url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.entries.push({ filename, data: new Uint8Array(arrayBuffer) });
    } catch (err) {
      console.warn(`Failed to fetch ${url} for zip, creating text marker instead:`, err);
      this.entries.push({
        filename: `${filename}.txt`,
        data: `Photo URL: ${url}\nNote: Original file could not be bundled offline due to remote CORS restrictions.`
      });
    }
  }

  generateBlob(): Blob {
    const parts: Uint8Array[] = [];
    let centralDirSize = 0;
    let offset = 0;
    const centralDirRecords: Uint8Array[] = [];

    const crcTable = SimpleZip.makeCrcTable();

    for (const entry of this.entries) {
      const filenameBytes = new TextEncoder().encode(entry.filename);
      const dataBytes = typeof entry.data === 'string'
        ? new TextEncoder().encode(entry.data)
        : entry.data;

      const crc = SimpleZip.calculateCrc32(dataBytes, crcTable);
      const size = dataBytes.length;

      // Local File Header (30 bytes + filename)
      const localHeader = new Uint8Array(30 + filenameBytes.length);
      const viewLH = new DataView(localHeader.buffer);

      viewLH.setUint32(0, 0x04034b50, true); // Local file header signature
      viewLH.setUint16(4, 20, true);         // Version needed to extract
      viewLH.setUint16(6, 0, true);          // General purpose bit flag
      viewLH.setUint16(8, 0, true);          // Compression method (0 = store)
      viewLH.setUint16(10, 0, true);         // Mod file time
      viewLH.setUint16(12, 0, true);         // Mod file date
      viewLH.setUint32(14, crc, true);       // CRC-32
      viewLH.setUint32(18, size, true);      // Compressed size
      viewLH.setUint32(22, size, true);      // Uncompressed size
      viewLH.setUint16(26, filenameBytes.length, true); // Filename length
      viewLH.setUint16(28, 0, true);         // Extra field length
      localHeader.set(filenameBytes, 30);

      parts.push(localHeader);
      parts.push(dataBytes);

      // Central Directory Header (46 bytes + filename)
      const cdHeader = new Uint8Array(46 + filenameBytes.length);
      const viewCD = new DataView(cdHeader.buffer);

      viewCD.setUint32(0, 0x02014b50, true); // Central directory header signature
      viewCD.setUint16(4, 20, true);         // Version made by
      viewCD.setUint16(6, 20, true);         // Version needed to extract
      viewCD.setUint16(8, 0, true);          // Flags
      viewCD.setUint16(10, 0, true);         // Compression method (0)
      viewCD.setUint16(12, 0, true);         // Mod time
      viewCD.setUint16(14, 0, true);         // Mod date
      viewCD.setUint32(16, crc, true);       // CRC-32
      viewCD.setUint32(20, size, true);      // Compressed size
      viewCD.setUint32(24, size, true);      // Uncompressed size
      viewCD.setUint16(28, filenameBytes.length, true); // Filename length
      viewCD.setUint16(30, 0, true);         // Extra field length
      viewCD.setUint16(32, 0, true);         // File comment length
      viewCD.setUint16(34, 0, true);         // Disk number start
      viewCD.setUint16(36, 0, true);         // Internal file attributes
      viewCD.setUint32(38, 0, true);         // External file attributes
      viewCD.setUint32(42, offset, true);    // Relative offset of local header
      cdHeader.set(filenameBytes, 46);

      centralDirRecords.push(cdHeader);
      centralDirSize += cdHeader.length;
      offset += localHeader.length + dataBytes.length;
    }

    // Append Central Directory Headers
    for (const cd of centralDirRecords) {
      parts.push(cd);
    }

    // End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const viewEOCD = new DataView(eocd.buffer);
    viewEOCD.setUint32(0, 0x06054b50, true);                  // EOCD signature
    viewEOCD.setUint16(4, 0, true);                           // Number of this disk
    viewEOCD.setUint16(6, 0, true);                           // Disk where CD starts
    viewEOCD.setUint16(8, this.entries.length, true);         // Total entries on this disk
    viewEOCD.setUint16(10, this.entries.length, true);        // Total entries in CD
    viewEOCD.setUint32(12, centralDirSize, true);             // Size of CD
    viewEOCD.setUint32(16, offset, true);                     // Offset of CD with respect to starting disk
    viewEOCD.setUint16(20, 0, true);                          // Comment length

    parts.push(eocd);

    return new Blob(parts as unknown as BlobPart[], { type: 'application/zip' });
  }

  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private static makeCrcTable(): Uint32Array {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    return table;
  }

  private static calculateCrc32(data: Uint8Array, table: Uint32Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}

export async function downloadPhotosZip(
  photos: Photo[],
  zipFilename: string,
  options?: {
    onProgress?: (progressText: string, percent: number) => void;
    includeGuestbook?: boolean;
    guestbookEntries?: GuestbookEntry[];
    eventInfo?: { partner1: string; partner2: string; date: string; venue: string };
  }
): Promise<void> {
  const zip = new SimpleZip();
  const total = photos.length;

  if (total === 0 && (!options?.includeGuestbook || !options?.guestbookEntries?.length)) {
    alert('No items to download in this collection.');
    return;
  }

  for (let i = 0; i < total; i++) {
    const p = photos[i];
    const cleanGuest = p.guestName ? `${p.guestName.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}_` : '';
    const cleanAlbum = p.albumTitle ? `${p.albumTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}_` : '';
    const filename = `photos/${String(i + 1).padStart(3, '0')}_${cleanAlbum}${cleanGuest}${p.originalFilename}`;

    options?.onProgress?.(`Adding photo ${i + 1} of ${total}...`, Math.round(((i + 1) / (total + 1)) * 95));
    await zip.addFileFromUrl(filename, p.url);
  }

  if (options?.includeGuestbook && options.guestbookEntries && options.guestbookEntries.length > 0) {
    let gbText = `Wedding Memories${options.eventInfo ? ` for ${options.eventInfo.partner1} & ${options.eventInfo.partner2}` : ''}\nVenue: ${options.eventInfo?.venue || ''}\n\n=== GUESTBOOK WISHES ===\n\n`;
    options.guestbookEntries.forEach((g) => {
      gbText += `From: ${g.guestName} (${new Date(g.createdAt).toLocaleDateString()})\n"${g.message}"\n\n`;
    });
    zip.addFile('guestbook_messages.txt', gbText);
  }

  options?.onProgress?.('Compressing ZIP archive...', 98);
  const blob = zip.generateBlob();
  SimpleZip.downloadBlob(blob, zipFilename);
  options?.onProgress?.('Download complete!', 100);
}
