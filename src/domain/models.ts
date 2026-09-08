import { z } from 'zod';
export const imageSchema = z.object({
  url: z.string().max(2048).refine(v => /^https:\/\/[^\s]+$/.test(v) || /^\/images\/[a-zA-Z0-9/_.-]+$/.test(v) || /^local:[a-zA-Z0-9-]+$/.test(v), 'Usa una URL HTTPS o una imagen del catálogo.'),
  alt: z.string().trim().min(1).max(160),
});
export const optionSchema = z.object({
  id: z.string().min(1).max(60), name: z.string().trim().min(1).max(60),
  required: z.boolean(), values: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
});
export const productSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]+$/).max(100), name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(3000), price: z.number().int().min(1).max(100000000),
  categoryId: z.string().min(1).max(100), images: z.array(imageSchema).min(1).max(8),
  options: z.array(optionSchema).max(5).refine(options => new Set(options.map(o => o.id)).size === options.length, 'Las opciones deben tener identificadores diferentes.'),
  featured: z.boolean(), active: z.boolean(), createdAt: z.number().finite(),
});
export const categorySchema = z.object({ id: z.string().regex(/^[a-zA-Z0-9-]+$/).max(100), name: z.string().trim().min(2).max(60) });
export type Product = z.infer<typeof productSchema>;
export type ProductImage = z.infer<typeof imageSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CartItem = { productId: string; options: Record<string, string>; quantity: number };
export type CartLine = CartItem & { key: string; product: Product; subtotal: number };
export type Delivery = { method: 'delivery' | 'pickup' | ''; name: string; city: string; department: string; neighborhood: string; address: string; complement: string; instructions: string; comments: string };
export type Catalog = { products: Product[]; categories: Category[] };
