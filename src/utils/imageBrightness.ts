import { cardCoverBrightness } from '../data/cardCoverBrightness';

export function getImageBrightness(img: HTMLImageElement): number {
  // These local covers are static. Reuse their measured luminance instead of
  // paying synchronous canvas readback costs for every offscreen card at load.
  const url = new URL(img.currentSrc || img.src, window.location.href);
  const known = url.origin === window.location.origin ? cardCoverBrightness[url.pathname] : undefined;
  if (known !== undefined) return known;
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  // This canvas exists only for CPU pixel sampling. A GPU-backed context makes
  // every cover load wait for a synchronous readback, especially on software GL.
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  return total / (size * size);
}
