/** Scale (w, h) down so the longest side is at most `max`. Never upscales. */
export function fitWithin(w: number, h: number, max = 1600): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Browser only. Resizes to a 1600px longest side and re-encodes (WebP, else JPEG).
 * Re-encoding also strips EXIF/GPS metadata.
 */
export async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('RESIZE_FAILED');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const webp = await toBlob(canvas, 'image/webp', 0.82);
  if (webp && webp.type === 'image/webp') return webp; // older Safari silently returns PNG
  const jpeg = await toBlob(canvas, 'image/jpeg', 0.85);
  if (!jpeg) throw new Error('RESIZE_FAILED');
  return jpeg;
}
