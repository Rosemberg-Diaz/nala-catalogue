import { get, set } from 'idb-keyval';
import { dataMode } from '../config';
import type { ProductImage } from '../domain/models';
import { assetUrl } from './asset-url';
export interface ImageStore { upload(file: File): Promise<ProductImage>; }
export async function optimizeImage(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Selecciona una fotografía JPG, PNG o WebP.');
  if (file.size > 20 * 1024 * 1024) throw new Error('La imagen debe pesar menos de 20 MB.');
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error('No pudimos leer esta fotografía. Intenta con otra.'); }
  try {
    if (bitmap.width * bitmap.height > 80000000) throw new Error('La resolución es demasiado grande. Elige otra fotografía.');
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d'); if (!context) throw new Error('No pudimos procesar la imagen.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('No pudimos optimizar la imagen.')), 'image/webp', 0.8));
    if (blob.size > 2 * 1024 * 1024) throw new Error('La fotografía sigue siendo muy pesada. Selecciona una más sencilla.');
    return blob;
  } finally { bitmap.close(); }
}
export const imageStore: ImageStore = {
  async upload(file) {
    const blob = await optimizeImage(file), id = crypto.randomUUID();
    if (dataMode === 'mock') { await set(`nala.image.${id}`, blob); return { url: `local:${id}`, alt: file.name.replace(/\.[^.]+$/, '') }; }
    if (import.meta.env.VITE_IMAGE_PROVIDER === 'firebase-storage') {
      const [{ firebaseApp }, { getStorage, ref, uploadBytes, getDownloadURL, connectStorageEmulator }] = await Promise.all([import('./firebase'), import('firebase/storage')]);
      const storage = getStorage(firebaseApp);
      if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === 'true' && !storageEmulatorConnected) { connectStorageEmulator(storage, '127.0.0.1', 9199); storageEmulatorConnected = true; }
      const target = ref(storage, `products/${id}.webp`);
      await uploadBytes(target, blob, { contentType: 'image/webp', cacheControl: 'public,max-age=31536000,immutable' });
      return { url: await getDownloadURL(target), alt: file.name.replace(/\.[^.]+$/, '') };
    }
    throw new Error('Este catálogo usa imágenes estáticas. Descarga la foto optimizada, publícala en Hosting y pega su ruta /images/nombre.webp.');
  },
};
let storageEmulatorConnected = false;
export async function resolveImage(url: string): Promise<string> {
  if (!url.startsWith('local:')) return assetUrl(url);
  const blob = await get<Blob>(`nala.image.${url.slice(6)}`);
  if (!blob) throw new Error('Imagen local no encontrada.');
  return URL.createObjectURL(blob);
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
