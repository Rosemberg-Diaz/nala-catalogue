import type { Catalog, Category, Product } from '../domain/models';
import { categorySchema, productSchema } from '../domain/models';
import { dataMode } from '../config';
export interface CatalogRepository {
  getCatalog(admin?: boolean): Promise<Catalog>;
  saveProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  saveCategory(category: Category): Promise<void>;
}
const KEY = 'nala.catalog.v1';
async function readLocal(): Promise<Catalog> {
  const raw = localStorage.getItem(KEY);
  if (!raw) return structuredClone((await import('./seed')).seed);
  const parsed: Catalog = JSON.parse(raw);
  return { products: productSchema.array().parse(parsed.products), categories: categorySchema.array().parse(parsed.categories) };
}
const mock: CatalogRepository = {
  async getCatalog(admin = false) { const catalog = await readLocal(); return { ...catalog, products: catalog.products.filter(p => admin || p.active) }; },
  async saveProduct(product) { const validated = productSchema.parse(product); const catalog = await readLocal(); if (!catalog.categories.some(c => c.id === product.categoryId)) throw new Error('Selecciona una categoría válida.'); catalog.products = [...catalog.products.filter(p => p.id !== product.id), validated]; localStorage.setItem(KEY, JSON.stringify(catalog)); },
  async deleteProduct(id) { const catalog = await readLocal(); catalog.products = catalog.products.filter(p => p.id !== id); localStorage.setItem(KEY, JSON.stringify(catalog)); },
  async saveCategory(category) { const validated = categorySchema.parse(category); const catalog = await readLocal(); catalog.categories = [...catalog.categories.filter(c => c.id !== category.id), validated]; localStorage.setItem(KEY, JSON.stringify(catalog)); },
};
let remote: Promise<CatalogRepository> | undefined;
export async function getRepository(): Promise<CatalogRepository> {
  if (dataMode === 'mock') return mock;
  remote ??= import('./firebase-repository').then(m => m.firebaseRepository);
  return remote;
}
