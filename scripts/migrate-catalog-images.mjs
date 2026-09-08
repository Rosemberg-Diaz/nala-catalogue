import { createAdminApp } from './admin-app.mjs';
import { deleteApp } from 'firebase-admin/app';
import { chromium } from '@playwright/test';
import { loadEnv } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const env = loadEnv('production', process.cwd(), '');
const projectId = env.VITE_FIREBASE_PROJECT_ID;
const write = process.argv.includes('--write');
if (!projectId) throw new Error('Configura VITE_FIREBASE_PROJECT_ID.');
const app = createAdminApp(projectId);
const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
let browser;
async function api(path, options = {}) {
  const token = await app.options.credential.getAccessToken();
  const response = await fetch(`${endpoint}${path}`, { ...options, headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' } });
  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.error?.message}`);
  return result;
}
try {
  const products = []; let cursor = '';
  do {
    const result = await api(`/products?pageSize=1000${cursor ? `&pageToken=${encodeURIComponent(cursor)}` : ''}`);
    products.push(...(result.documents || [])); cursor = result.nextPageToken || '';
  } while (cursor);
  const urls = product => product.fields.images.arrayValue.values.map(image => image.mapValue.fields.url.stringValue);
  const local = [...new Set(products.flatMap(urls).filter(url => url.startsWith('/images/')))];
  console.log(JSON.stringify({ products: products.length, imageReferences: products.flatMap(urls).length, cloudinaryReferences: products.flatMap(urls).filter(url => url.startsWith(`https://res.cloudinary.com/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/`)).length, localImages: local }));
  if (write && local.length) {
    await mkdir('.tools', { recursive: true });
    const manifestFile = `.tools/image-migration-${projectId}.json`;
    let manifest = {};
    try { manifest = JSON.parse(await readFile(manifestFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173');
    for (const url of local) {
      if (manifest[url]) continue;
      const image = await page.evaluate(async url => {
        const { optimizeImage } = await import('/src/data/images.ts');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Imagen no encontrada: ${url}`);
        const blob = await response.blob();
        return Array.from(new Uint8Array(await (await optimizeImage(new File([blob], url.split('/').pop(), { type: blob.type }))).arrayBuffer()));
      }, url);
      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(image)], { type: 'image/webp' }), 'product.webp');
      form.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
      const uploaded = await response.json();
      if (!response.ok || !uploaded.secure_url?.startsWith(`https://res.cloudinary.com/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/`)) throw new Error(uploaded.error?.message || 'Respuesta de carga inválida.');
      manifest[url] = uploaded.secure_url;
      await writeFile(manifestFile, JSON.stringify(manifest, null, 2));
      console.log(`Subida: ${url} (${uploaded.bytes} bytes)`);
    }
    for (const product of products) {
      if (!urls(product).some(url => manifest[url])) continue;
      for (const image of product.fields.images.arrayValue.values) {
        const field = image.mapValue.fields.url;
        if (manifest[field.stringValue]) field.stringValue = manifest[field.stringValue];
      }
      const id = product.name.split('/').pop();
      await api(`/products/${id}?updateMask.fieldPaths=images&currentDocument.updateTime=${encodeURIComponent(product.updateTime)}`, { method: 'PATCH', body: JSON.stringify({ fields: { images: product.fields.images } }) });
      console.log(`Referencias actualizadas: ${id}`);
    }
  }
} finally { if (browser) await browser.close(); await deleteApp(app); }
