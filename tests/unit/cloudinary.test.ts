import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadCloudinary } from '../../src/data/cloudinary';
afterEach(() => vi.unstubAllGlobals());
describe('image upload errors', () => {
  it('rejects missing configuration before sending files', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(uploadCloudinary(new Blob(), 'foto.jpg', '', '')).rejects.toThrow('configurar');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('handles quota errors and rejects URLs from another cloud', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 429 })));
    await expect(uploadCloudinary(new Blob(), 'foto.jpg', 'nala', 'preset')).rejects.toThrow('límite');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ secure_url: 'https://example.com/photo.webp', resource_type: 'image', format: 'webp' })));
    await expect(uploadCloudinary(new Blob(), 'foto.jpg', 'nala', 'preset')).rejects.toThrow('no válida');
  });
});
