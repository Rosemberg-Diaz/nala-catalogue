import { createAdminApp } from './admin-app.mjs';
import { getAuth } from 'firebase-admin/auth';
const [identity, projectId] = process.argv.slice(2);
if (!identity || !projectId || identity.startsWith('-') || projectId.startsWith('-')) throw new Error('Uso: pnpm admin:grant CORREO_O_UID PROJECT_ID. Usa credenciales ADC de un entorno de confianza.');
createAdminApp(projectId);
const auth = getAuth();
const user = identity.includes('@') ? await auth.getUserByEmail(identity) : await auth.getUser(identity);
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
console.log('Permiso administrativo asignado. Cierra e inicia sesión para renovar el token.');
