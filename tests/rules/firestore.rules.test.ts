import { afterAll, beforeAll, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { readFile } from 'node:fs/promises';
import { seed } from '../../src/data/seed';

let testEnv: RulesTestEnvironment;
const product = seed.products.find(p => p.id === 'pulsera-luna')!;
const inactive = seed.products.find(p => !p.active)!;
beforeAll(async () => {
  testEnv = await initializeTestEnvironment({ projectId: 'demo-nala', firestore: { rules: await readFile('firestore.rules', 'utf8') } });
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'categories', 'pulseras'), seed.categories.find(c => c.id === 'pulseras')!);
    await setDoc(doc(db, 'categories', inactive.categoryId), seed.categories.find(c => c.id === inactive.categoryId)!);
    await setDoc(doc(db, 'products', product.id), product);
    await setDoc(doc(db, 'products', inactive.id), inactive);
  });
});
afterAll(async () => { await testEnv.cleanup(); });
describe('Firestore security rules', () => {
  it('protects deletion and validates the optional wholesale price', async () => {
    const admin = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
    const regular = testEnv.authenticatedContext('customer').firestore();
    const guest = testEnv.unauthenticatedContext().firestore();
    const ref = doc(admin, 'products', 'pricing-test');
    await assertSucceeds(setDoc(ref, { ...product, id: 'pricing-test', wholesalePrice: 18000 }));
    await assertFails(setDoc(ref, { ...product, id: 'pricing-test', wholesalePrice: -1 }));
    await assertFails(setDoc(ref, { ...product, id: 'pricing-test', wholesalePrice: 12.5 }));
    await assertSucceeds(setDoc(ref, { ...product, id: 'pricing-test', wholesalePrice: null }));
    await assertFails(deleteDoc(doc(regular, 'products', 'pricing-test')));
    await assertFails(deleteDoc(doc(guest, 'products', 'pricing-test')));
    await assertSucceeds(deleteDoc(ref));
  });
  it('lets the public read active products but not inactive products', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, 'products', product.id)));
    await assertFails(getDoc(doc(db, 'products', inactive.id)));
  });
  it('does not let the public write products or categories', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, 'products', product.id), product));
    await assertFails(setDoc(doc(db, 'categories', 'new'), { id: 'new', name: 'Nueva' }));
  });
  it('allows an admin claim to create a valid product and rejects unknown fields', async () => {
    const db = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
    const next = { ...product, id: 'nuevo-producto', createdAt: Date.now() };
    await assertSucceeds(setDoc(doc(db, 'products', next.id), next));
    await assertFails(setDoc(doc(db, 'products', 'invalid-producto'), { ...next, id: 'invalid-producto', unexpected: true }));
  });
});
