import type { ProductImage } from '../domain/models';

export async function uploadCloudinary(blob: Blob, name: string, cloudName: string, preset: string): Promise<ProductImage> {
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName) || !preset.trim()) throw new Error('Falta configurar la carga de fotografías.');
  const body = new FormData();
  body.append('file', blob, 'product.webp');
  body.append('upload_preset', preset);
  let response: Response;
  try { response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body, signal: AbortSignal.timeout(60000) }); }
  catch { throw new Error('No pudimos subir la fotografía. Revisa tu conexión e inténtalo de nuevo.'); }
  if (!response.ok) throw new Error(response.status === 429 ? 'Se alcanzó el límite de carga de fotografías. Inténtalo más tarde.' : 'No pudimos subir la fotografía. Revisa la configuración de imágenes y la cuota disponible.');
  const result = await response.json();
  const url = new URL(result.secure_url);
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.startsWith(`/${cloudName}/image/upload/`) || result.resource_type !== 'image' || result.format !== 'webp') throw new Error('El servicio devolvió una fotografía no válida.');
  return { url: url.href, alt: name.replace(/\.[^.]+$/, '').slice(0, 160) || 'Fotografía del producto' };
}
