import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { createRequire } from 'node:module';

// Uses the locally authorized Firebase CLI session, without copying credentials into the repo.
// ADC remains available for CI or a trusted service account environment.
export function createAdminApp(projectId) {
  if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) return initializeApp({ projectId });
  if (process.env.NALA_USE_FIREBASE_CLI !== 'true') return initializeApp({ projectId, credential: applicationDefault() });
  const require = createRequire(import.meta.url);
  const auth = require('firebase-tools/lib/auth');
  const account = auth.getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error('Inicia sesión con firebase login antes de continuar.');
  return initializeApp({ projectId, credential: {
    async getAccessToken() {
      const token = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/userinfo.email']);
      return { access_token: token.access_token, expires_in: Math.max(1, Math.floor(((token.expires_at || Date.now() + 3600000) - Date.now()) / 1000)) };
    },
  } });
}
