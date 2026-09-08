import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pages = mode === 'pages';
  return {
    base: pages ? './' : '/',
    define: pages ? {
      'import.meta.env.VITE_DATA_SOURCE': JSON.stringify('mock'),
      'import.meta.env.VITE_IMAGE_PROVIDER': JSON.stringify('static'),
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
