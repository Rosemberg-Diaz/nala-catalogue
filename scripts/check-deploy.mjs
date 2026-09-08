import { loadEnv } from 'vite';
const env = loadEnv('production', process.cwd(), '');
const required = ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID','VITE_WHATSAPP_NUMBER','VITE_PICKUP_ADDRESS','VITE_SITE_URL'];
const missing = required.filter(key => !env[key]?.trim());
if (env.VITE_DATA_SOURCE !== 'firebase' || missing.length || env.VITE_FIREBASE_EMULATORS === 'true') {
  console.error('Publicación comercial bloqueada: activa firebase, desactiva emuladores y completa:', missing.join(', ') || 'VITE_DATA_SOURCE'); process.exit(1);
}
if (!/^[1-9]\d{7,14}$/.test(env.VITE_WHATSAPP_NUMBER) || !/^https:\/\/[a-zA-Z0-9.-]+$/.test(env.VITE_SITE_URL)) { console.error('Revisa el formato del WhatsApp y VITE_SITE_URL (origen HTTPS sin barra final).'); process.exit(1); }
console.log('Configuración técnica lista. Confirma también marca, datos comerciales e imágenes según README antes de publicar.');
