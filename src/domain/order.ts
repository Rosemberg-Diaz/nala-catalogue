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
    lines.push({ ...item, product, key: cartKey(item), subtotal: product.price * item.quantity });
  }
  return { lines, issues, total: lines.reduce((sum, line) => sum + line.subtotal, 0) };
}
const storedCart = z.array(z.object({ productId: z.string().max(100), options: z.record(z.string().max(60), z.string().max(60)), quantity: z.number().int().min(1).max(MAX_QUANTITY) })).max(MAX_LINES);
export function parseCart(raw: string | null): CartItem[] {
  try { const parsed = storedCart.safeParse(JSON.parse(raw || '[]')); if (!parsed.success) return []; const seen = new Set<string>(); return parsed.data.filter(item => { const key = cartKey(item); if (seen.has(key)) return false; seen.add(key); return true; }); } catch { return []; }
}
export function deliveryErrors(data: Delivery): Partial<Record<keyof Delivery, string>> {
  const errors: Partial<Record<keyof Delivery, string>> = {};
  if (!['pickup', 'delivery'].includes(data.method)) errors.method = 'Elige cómo recibir tu pedido.';
  if (data.name.trim().length < 3) errors.name = 'Escribe tu nombre completo.';
  if (data.method === 'delivery') {
    const fields = { city: 'tu ciudad', department: 'tu departamento', neighborhood: 'tu barrio', address: 'tu dirección completa' } as const;
    for (const [key, label] of Object.entries(fields)) if (data[key as keyof typeof fields].trim().length < 2) errors[key as keyof Delivery] = `Escribe ${label}.`;
  }
  for (const [key, value] of Object.entries(data)) if (value.length > (['comments', 'instructions'].includes(key) ? 500 : 180)) errors[key as keyof Delivery] = 'El texto es demasiado largo.';
  return errors;
}
export function createOrderMessage(lines: CartLine[], delivery: Delivery): string {
  if (!lines.length || Object.keys(deliveryErrors(delivery)).length) throw new Error('Revisa los productos y completa tus datos.');
  const result = ['🛍️ NUEVO PEDIDO · ' + business.name.toUpperCase(), '', '👤 CLIENTE', delivery.name.trim(), '', delivery.method === 'delivery' ? '🚚 ENVÍO A DOMICILIO' : '🏪 RECOGER EN EL LOCAL'];
  if (delivery.method === 'delivery') {
    result.push(`${delivery.city.trim()}, ${delivery.department.trim()}`, `Barrio: ${delivery.neighborhood.trim()}`, `Dirección: ${delivery.address.trim()}`);
    if (delivery.complement.trim()) result.push(`Conjunto / edificio / apartamento: ${delivery.complement.trim()}`);
    if (delivery.instructions.trim()) result.push(`Indicaciones: ${delivery.instructions.trim()}`);
  } else result.push(business.pickupName, business.pickupAddress, 'EL PEDIDO SERÁ RECOGIDO EN EL LOCAL.');
  result.push('', '✨ PRODUCTOS');
  lines.forEach((line, i) => {
    result.push(`${i + 1}. ${line.product.name}`);
    line.product.options.forEach(option => { if (line.options[option.id]) result.push(`   ${option.name}: ${line.options[option.id]}`); });
    result.push(`   Cantidad: ${line.quantity} · Unitario: ${money(line.product.price)}`, `   Subtotal: ${money(line.subtotal)}`, '');
  });
  result.push(`TOTAL PRODUCTOS: ${money(lines.reduce((sum, l) => sum + l.subtotal, 0))} COP`);
  if (delivery.method === 'delivery') result.push(business.shipping);
  if (delivery.comments.trim()) result.push('', `💬 COMENTARIOS\n${delivery.comments.trim()}`);
  result.push('', '🕒 ' + business.preparation, '', 'Pedido sujeto a confirmación por el negocio.');
  return result.join('\n');
}
export function whatsappLink(message: string, number = business.whatsappNumber) {
  if (!/^[1-9]\d{7,14}$/.test(number)) throw new Error('El WhatsApp de la tienda está pendiente de configurar. Puedes copiar tu pedido.');
  if (!message.trim()) throw new Error('No se pudo preparar el mensaje. Revisa tu pedido.');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
