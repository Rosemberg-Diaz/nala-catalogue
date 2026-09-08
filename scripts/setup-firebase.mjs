import { createAdminApp } from './admin-app.mjs';
import { deleteApp } from 'firebase-admin/app';

const [projectId, action = 'inspect'] = process.argv.slice(2);
if (!projectId || !['inspect', 'enable', 'auth'].includes(action)) throw new Error('Uso: node scripts/setup-firebase.mjs PROJECT_ID inspect|enable|auth');
const app = createAdminApp(projectId);
async function api(url, method = 'GET', body) {
  const token = await app.options.credential.getAccessToken();
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${data.error?.message || 'No se pudo completar la configuración.'}`);
  return data;
}
try {
  if (action === 'inspect') {
    const billing = await api(`https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`);
    console.log(JSON.stringify({ projectId, billingEnabled: billing.billingEnabled }));
  } else if (action === 'enable') {
    const billing = await api(`https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`);
    if (billing.billingEnabled) throw new Error('Se esperaba un proyecto sin facturación. Revisa el plan antes de continuar.');
    const operation = await api(`https://serviceusage.googleapis.com/v1/projects/${projectId}/services:batchEnable`, 'POST', { serviceIds: ['firestore.googleapis.com', 'identitytoolkit.googleapis.com', 'firebaserules.googleapis.com'] });
    console.log(JSON.stringify({ operation: operation.name, done: operation.done ?? false }));
  } else {
    const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;
    const config = await api(url);
    const domains = [...new Set([...(config.authorizedDomains || []), 'localhost', `${projectId}.firebaseapp.com`, `${projectId}.web.app`, 'rosemberg-diaz.github.io'])];
    await api(`${url}?updateMask=signIn.email,authorizedDomains`, 'PATCH', { signIn: { email: { enabled: true, passwordRequired: true } }, authorizedDomains: domains });
    console.log('Acceso por correo habilitado y dominios de Nala autorizados.');
  }
} finally { await deleteApp(app); }
