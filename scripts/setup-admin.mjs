import { createAdminApp } from './admin-app.mjs';
import { getAuth } from 'firebase-admin/auth';
import { deleteApp } from 'firebase-admin/app';
import { mkdir, writeFile } from 'node:fs/promises';

const [projectId, email] = process.argv.slice(2);
if (!projectId || !email?.includes('@')) throw new Error('Uso: node scripts/setup-admin.mjs PROJECT_ID CORREO');
const app = createAdminApp(projectId);
try {
  const auth = getAuth(app);
  let user;
  try { user = await auth.getUserByEmail(email); }
  catch (error) { if (error.code !== 'auth/user-not-found') throw error; user = await auth.createUser({ email, displayName: 'Administración Nala' }); }
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  const url = await auth.generatePasswordResetLink(email);
  await mkdir(new URL('../.tools/', import.meta.url), { recursive: true });
  await writeFile(new URL('../.tools/admin-access.md', import.meta.url), `# Acceso privado a Nala\n\nCuenta: ${email}\n\n[Establecer mi contraseña en Firebase](${url})\n\nEste enlace es privado y temporal. Elige tu contraseña directamente en Firebase; no la compartas con Codex. Después entra al panel con tu correo y esa contraseña.\n`);
  console.log('Cuenta administradora preparada. Enlace privado para establecer contraseña guardado en .tools/admin-access.md (fuera de Git).');
} finally { await deleteApp(app); }
