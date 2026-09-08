import { cataloguePrice } from './pricing';
import { z } from 'zod';
import { business, money } from '../config';
import type { CartItem, CartLine, Delivery, Product } from './models';
export const MAX_QUANTITY = 99;
export const MAX_LINES = 30;
export const cartKey = (item: Pick<CartItem, 'productId' | 'options'>) => JSON.stringify([item.productId, Object.entries(item.options).sort(([a], [b]) => a.localeCompare(b))]);
export function optionErrors(product: Product, options: Record<string, string>): string[] {
  return product.options.filter(o => (o.required && !options[o.id]) || (options[o.id] && !o.values.includes(options[o.id]))).map(o => `Selecciona ${o.name.toLowerCase()}.`);
}
export function resolveCart(items: CartItem[], products: Product[]) {
  const lines: CartLine[] = [], issues: string[] = [];
  for (const item of items) {
    const product = products.find(p => p.id === item.productId && p.active);
    if (!product) { issues.push('Un producto de tu bolsa ya no está disponible. Elimínalo para continuar.'); continue; }
    if (optionErrors(product, item.options).length || Object.keys(item.options).some(id => !product.options.some(o => o.id === id))) { issues.push(`Las opciones de ${product.name} cambiaron. Elimínalo y vuelve a elegirlo.`); continue; }
    lines.push({ ...item, product, key: cartKey(item), subtotal: cataloguePrice(product) * item.quantity });
  }
  return { lines, issues, total: lines.reduce((sum, line) => sum + line.subtotal, 0) };
}
const storedCart = z.array(z.object({ productId: z.string().max(100), options: z.record(z.string().max(60), z.string().max(60)), quantity: z.number().int().min(1).max(MAX_QUANTITY) })).max(MAX_LINES);
export function parseCart(raw: string | null): CartItem[] {
  try { const parsed = storedCart.safeParse(JSON.parse(raw || '[]')); if (!parsed.success) return []; const seen = new Set<string>(); return parsed.data.filter(item => { const key = cartKey(item); if (seen.has(key)) return false; seen.add(key); return true; }); } catch { return []; }
}
export function deliveryErrors(data: Delivery): Partial<Record<keyof Delivery, string>> {
  const errors: Partial<Record<keyof Delivery, string>> = {};
  if (data.name.trim().length < 3) errors.name = 'Escribe tu nombre completo.';
  if (data.city.trim().length < 2) errors.city = 'Escribe tu ciudad.';
  for (const key of ['name', 'city'] as const) if (data[key].length > 180) errors[key] = 'El texto es demasiado largo.';
  return errors;
}
export function createOrderMessage(lines: CartLine[], delivery: Delivery): string {
  if (!lines.length || Object.keys(deliveryErrors(delivery)).length) throw new Error('Revisa los productos y completa tus datos.');
  const result = ['🛍️ NUEVO PEDIDO · ' + business.name.toUpperCase(), '', '👤 CLIENTE', delivery.name.trim(), 'Ciudad: ' + delivery.city.trim()];
  result.push('', '✨ PRODUCTOS');
  lines.forEach((line, i) => {
    result.push(`${i + 1}. ${line.product.name}`);
    line.product.options.forEach(option => { if (line.options[option.id]) result.push(`   ${option.name}: ${line.options[option.id]}`); });
    result.push(`   Cantidad: ${line.quantity} · Unitario al por mayor: ${money(cataloguePrice(line.product))}`, `   Subtotal: ${money(line.subtotal)}`, '');
  });
  result.push(`TOTAL PRODUCTOS: ${money(lines.reduce((sum, l) => sum + l.subtotal, 0))} COP`);
  result.push(business.shipping, '', 'La dirección, el envío o recogida y los medios de pago se acuerdan por WhatsApp.');
  result.push('', business.wholesale.note, '', 'Pedido sujeto a confirmación por el negocio.');
  return result.join('\n');
}
export function whatsappLink(message: string, number = business.whatsappNumber) {
  if (!/^[1-9]\d{7,14}$/.test(number)) throw new Error('El WhatsApp de la tienda está pendiente de configurar. Puedes copiar tu pedido.');
  if (!message.trim()) throw new Error('No se pudo preparar el mensaje. Revisa tu pedido.');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
