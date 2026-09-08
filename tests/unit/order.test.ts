import { describe, expect, it } from 'vitest';
import { seed } from '../../src/data/seed';
import { cartKey, createOrderMessage, deliveryErrors, optionErrors, parseCart, resolveCart, whatsappLink } from '../../src/domain/order';
import { productSchema } from '../../src/domain/models';
import type { Delivery } from '../../src/domain/models';
const pickup: Delivery = { name: 'Cliente de prueba', city: 'Cali' };
const delivery = pickup;
const item = { productId: 'aretes-sol', options: { color: 'Dorado' }, quantity: 2 };
describe('model and cart', () => {
  it('keeps wholesale prices below, at and above $50,000', () => {
    const product = { ...seed.products.find(p => p.id === item.productId)!, price: 40000, wholesalePrice: 25000 };
    for (const quantity of [1, 2, 3]) {
      const { lines, total, issues } = resolveCart([{ ...item, quantity }], [product]);
      expect(issues).toEqual([]); expect(total).toBe(25000 * quantity);
      const message = createOrderMessage(lines, pickup);
      expect(message).toContain('Unitario al por mayor: $25.000');
      expect(message).not.toMatch(/bajo pedido|días hábiles/i);
      expect(message).toContain('a partir de $50.000');
    }
  });
  it('uses wholesale prices regardless of the order total and accepts older products', () => {
    const product = seed.products.find(p => p.id === item.productId)!;
    const { wholesalePrice: unused, ...legacy } = product;
    expect(unused).toBeGreaterThan(0);
    expect(productSchema.safeParse(legacy).success).toBe(true);
    expect(productSchema.safeParse({ ...product, wholesalePrice: -1 }).success).toBe(false);
    expect(productSchema.safeParse({ ...product, wholesalePrice: null }).success).toBe(true);
    expect(resolveCart([{ ...item, quantity: 50 }], [{ ...product, wholesalePrice: 1000 }]).total).toBe(50000);
  });
  it('validates the seed with simple, multi-option and inactive products', () => { expect(seed.products.every(p => productSchema.safeParse(p).success)).toBe(true); expect(seed.products.some(p => !p.active)).toBe(true); });
  it('requires every mandatory option and rejects invalid values', () => { const ring = seed.products.find(p => p.id === 'anillo-oliva')!; expect(optionErrors(ring, {})).toHaveLength(2); expect(optionErrors(ring, { color: 'Rojo', talla: '7' })).toHaveLength(1); expect(optionErrors(ring, { color: 'Dorado', talla: '7' })).toEqual([]); });
  it('uses stable variant keys independent of selection order', () => { expect(cartKey({ productId: 'x', options: { a: '1', b: '2' } })).toBe(cartKey({ productId: 'x', options: { b: '2', a: '1' } })); expect(cartKey(item)).not.toBe(cartKey({ ...item, options: { color: 'Plateado' } })); });
  it('recovers from corrupt storage and rejects malformed quantities', () => { for (const value of ['{', 'null', '[1]', JSON.stringify([{ ...item, quantity: -1 }]), JSON.stringify([{ ...item, quantity: 1.5 }]), JSON.stringify([{ ...item, quantity: 100 }])]) expect(parseCart(value)).toEqual([]); expect(parseCart(JSON.stringify([item, item]))).toEqual([item]); });
  it('calculates current prices, subtotals, and total without trusting stored prices', () => { const result = resolveCart([item, { productId: 'pulsera-luna', options: {}, quantity: 3 }], seed.products); expect(result.total).toBe(97600); expect(result.lines[0].subtotal).toBe(44800); });
  it('blocks inactive, deleted and changed options', () => { const result = resolveCart([{ productId: 'anillo-archivo', options: {}, quantity: 1 }, { productId: 'missing', options: {}, quantity: 1 }, { ...item, options: { color: 'Rojo' } }], seed.products); expect(result.lines).toHaveLength(0); expect(result.issues).toHaveLength(3); });
  it('rejects unknown option keys and reprices changed products', () => { expect(resolveCart([{ ...item, options: { color: 'Dorado', invalid: 'x' } }], seed.products).issues).toHaveLength(1); expect(resolveCart([item], seed.products.map(p => p.id === item.productId ? { ...p, wholesalePrice: 10000 } : p)).total).toBe(20000); });
});
describe('checkout and WhatsApp', () => {
  it('requires only name and city with bounded nonblank values', () => {
    expect(deliveryErrors(delivery)).toEqual({});
    expect(deliveryErrors({ name: '  ', city: ' ' })).toEqual({ name: 'Escribe tu nombre completo.', city: 'Escribe tu ciudad.' });
    expect(deliveryErrors({ ...delivery, city: 'a'.repeat(181) })).toHaveProperty('city');
    expect(deliveryErrors({ ...delivery, name: 'a'.repeat(181) })).toHaveProperty('name');
  });
  it('includes name, city, variants and wholesale totals', () => {
    const text = createOrderMessage(resolveCart([item], seed.products).lines, { name: '  José & Ana  ', city: '  Bogotá  ' });
    for (const value of ['José & Ana', 'Ciudad: Bogotá', 'Color: Dorado', 'Cantidad: 2', '$22.400', '$44.800', 'TOTAL PRODUCTOS', 'a partir de $50.000', 'medios de pago se acuerdan por WhatsApp']) expect(text).toContain(value);
  });
  it('does not include obsolete personal fields even if provided by an old client', () => {
    const oldData = { ...delivery, method: 'delivery', address: 'DIRECCION PRIVADA', comments: 'NOTA PRIVADA', neighborhood: 'BARRIO PRIVADO' };
    const text = createOrderMessage(resolveCart([item], seed.products).lines, oldData);
    expect(text).not.toMatch(/PRIVADA|PRIVADO|ENVÍO A DOMICILIO|EL PEDIDO SERÁ RECOGIDO/);
  });
  it('generates an official encoded URL without losing accents, emoji or ampersands', () => { const message = '🛍️ José & Ana\nTalla: 7 + envío'; const url = new URL(whatsappLink(message, '12345678901')); expect(url.hostname).toBe('wa.me'); expect(url.searchParams.get('text')).toBe(message); });
  it('does not invent a telephone number or create an empty order', () => { expect(() => whatsappLink('Pedido', '')).toThrow('pendiente de configurar'); expect(() => whatsappLink('Pedido', '+57abc')).toThrow(); expect(() => createOrderMessage([], delivery)).toThrow(); expect(() => createOrderMessage(resolveCart([item], seed.products).lines, { ...delivery, name: '' })).toThrow(); });
});
