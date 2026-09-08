import { deleteApp } from 'firebase-admin/app';
import { createAdminApp } from './admin-app.mjs';
import { seed } from '../src/data/seed.ts';
import { productSchema, categorySchema } from '../src/domain/models.ts';

const args = process.argv.slice(2).filter(value => value !== '--');
const projectId = args.find(value => !value.startsWith('--'));
const write = args.includes('--write');
if (!projectId || !/^[a-z][a-z0-9-]{4,62}$/.test(projectId)) throw new Error('Uso: pnpm firebase:seed PROJECT_ID [--write]. Sin --write solo muestra qué se agregará.');
if (process.env.FIRESTORE_EMULATOR_HOST && !projectId.startsWith('demo-')) throw new Error('Usa un proyecto demo- para cargar el emulador.');
if (!process.env.FIRESTORE_EMULATOR_HOST && projectId.startsWith('demo-')) throw new Error('Los proyectos demo- requieren FIRESTORE_EMULATOR_HOST.');
const app = createAdminApp(projectId);
const base = process.env.FIRESTORE_EMULATOR_HOST ? `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1` : 'https://firestore.googleapis.com/v1';
const database = `projects/${projectId}/databases/(default)`;
async function api(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (!process.env.FIRESTORE_EMULATOR_HOST) headers.Authorization = `Bearer ${(await app.options.credential.getAccessToken()).access_token}`;
  else headers.Authorization = 'Bearer owner';
  const response = await fetch(`${base}/${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${result.error?.message || 'No se pudo cargar el catálogo.'}`);
  return result;
}
function field(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(field) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, value]) => [key, field(value)])) } };
}
const entries = [
  ...seed.categories.map(value => ({ collection: 'categories', data: categorySchema.parse(value) })),
  ...seed.products.map(value => ({ collection: 'products', data: productSchema.parse(value) })),
];
try {
  const name = entry => `${database}/documents/${entry.collection}/${entry.data.id}`;
  const snapshots = await api(`${database}/documents:batchGet`, { documents: entries.map(name) });
  const missingNames = new Set(snapshots.filter(snapshot => snapshot.missing).map(snapshot => snapshot.missing));
  const missing = entries.filter(entry => missingNames.has(name(entry)));
  if (write && missing.length) await api(`${database}/documents:commit`, { writes: missing.map(entry => ({ update: { name: name(entry), fields: field(entry.data).mapValue.fields }, currentDocument: { exists: false } })) });
  const result = missing.map(entry => `${entry.collection}/${entry.data.id}`);
  console.log(`${write ? 'Creados' : 'Por crear'} en ${projectId}: ${result.length}. Los documentos existentes no se modifican.`);
  result.forEach(path => console.log(path));
  if (!write) console.log('Repite con --write para guardar estos datos de muestra.');
} finally { await deleteApp(app); }
