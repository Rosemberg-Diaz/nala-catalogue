import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { seed } from '../../src/data/seed';
export default async function setup() {
  if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Esta prueba solo puede ejecutarse dentro de los emuladores.');
  const app = initializeApp({ projectId: 'demo-nala' });
  const auth = getAuth(app);
  const email = 'admin@example.test', password = 'Only-for-local-emulator-123';
  const user = await auth.createUser({ email, password });
  await auth.setCustomUserClaims(user.uid, { admin: true });
  const db = getFirestore(app), batch = db.batch();
  for (const category of seed.categories) batch.set(db.doc(`categories/${category.id}`), category);
  batch.set(db.doc('products/database-only'), { ...seed.products[0], id: 'database-only', name: 'Producto desde Firestore' });
  await batch.commit();
  await db.terminate(); await deleteApp(app);
}
