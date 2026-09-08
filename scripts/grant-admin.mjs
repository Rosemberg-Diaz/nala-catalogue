import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
const [uid, projectId] = process.argv.slice(2);
if (!uid || !projectId || uid.startsWith('-') || projectId.startsWith('-')) throw new Error('Uso: npm run admin:grant -- UID PROJECT_ID. Usa credenciales ADC de un entorno de confianza.');
initializeApp({ credential: applicationDefault(), projectId });
const auth = getAuth();
const user = await auth.getUser(uid);
await auth.setCustomUserClaims(uid, { ...user.customClaims, admin: true });
console.log('Permiso administrativo asignado. Cierra e inicia sesión para renovar el token.');
