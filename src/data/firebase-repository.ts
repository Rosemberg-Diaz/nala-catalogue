import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import type { CatalogRepository } from './repository';
import { categorySchema, productSchema } from '../domain/models';
export const firebaseRepository: CatalogRepository = {
  async getCatalog(admin = false) {
    const products = collection(db, 'products');
    const [p, c] = await Promise.all([getDocs(admin ? products : query(products, where('active', '==', true))), getDocs(collection(db, 'categories'))]);
    return {
      products: p.docs.map(d => productSchema.parse({ ...d.data(), id: d.id })),
      categories: c.docs.map(d => categorySchema.parse({ ...d.data(), id: d.id })),
    };
  },
  async saveProduct(product) {
    const validated = productSchema.parse(product);
    if (validated.images.some(i => i.url.startsWith('local:'))) throw new Error('Publica las imágenes antes de guardar en Firebase.');
    await setDoc(doc(db, 'products', product.id), validated);
  },
  async saveCategory(category) { await setDoc(doc(db, 'categories', category.id), categorySchema.parse(category)); },
};
