import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pages = mode === 'pages';
  const firebase = pages ? env.VITE_PAGES_DATA_SOURCE === 'firebase' : env.VITE_DATA_SOURCE === 'firebase';
  if (firebase) {
    const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
    if (env.VITE_IMAGE_PROVIDER === 'firebase-storage') required.push('VITE_FIREBASE_STORAGE_BUCKET');
    if (env.VITE_IMAGE_PROVIDER === 'cloudinary') required.push('VITE_CLOUDINARY_CLOUD_NAME', 'VITE_CLOUDINARY_UPLOAD_PRESET');
    const missing = required.filter(key => !env[key]?.trim());
    if (missing.length) throw new Error(`Completa la conexión Firebase: ${missing.join(', ')}`);
  }
  return {
    base: pages ? './' : '/',
    define: pages ? {
      'import.meta.env.VITE_DATA_SOURCE': JSON.stringify(firebase ? 'firebase' : 'mock'),
      'import.meta.env.VITE_IMAGE_PROVIDER': JSON.stringify(firebase ? env.VITE_IMAGE_PROVIDER || 'static' : 'static'),
      'import.meta.env.VITE_FIREBASE_EMULATORS': JSON.stringify('false'),
    } : {},
    plugins: [react(), {
      name: 'site-metadata',
      transformIndexHtml(html) {
        const origin = pages ? 'https://rosemberg-diaz.github.io/nala-catalogue' : /^https:\/\/[a-zA-Z0-9.-]+$/.test(env.VITE_SITE_URL || '') ? env.VITE_SITE_URL : '';
        return html.replaceAll('__SITE_URL__', origin);
      },
    }],
    server: { port: 5173, strictPort: true },
    build: { chunkSizeWarningLimit: 650, outDir: pages ? 'docs' : 'dist' },
  };
});
