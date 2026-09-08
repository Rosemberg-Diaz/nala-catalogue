import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StoreContext } from './store';
import type { Catalog, Delivery, Product } from '../domain/models';
import { cartKey, MAX_LINES, MAX_QUANTITY, optionErrors, parseCart } from '../domain/order';
import { getRepository } from '../data/repository';
const CART_KEY = 'nala.cart.v1';
export default function StoreProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>({ products: [], categories: [] });
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, notify] = useState('');
  const [cart, setCart] = useState(() => { try { return parseCart(localStorage.getItem(CART_KEY)); } catch { return []; } });
  const [delivery, setDelivery] = useState<Delivery>({ name: '', city: '' });
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setCatalog(await (await getRepository()).getCatalog()); } catch { setError('No pudimos cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { notify('Tu navegador no pudo guardar la bolsa. Mantenla abierta hasta terminar.'); } }, [cart]);
  useEffect(() => { const handler = (event: StorageEvent) => { if (event.key === CART_KEY) setCart(parseCart(event.newValue)); }; window.addEventListener('storage', handler); return () => window.removeEventListener('storage', handler); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => notify(''), 5000); return () => clearTimeout(timer); }, [notice]);
  function add(product: Product, options: Record<string, string>, quantity: number) {
    if (!product.active || optionErrors(product, options).length || quantity < 1 || quantity > MAX_QUANTITY || !Number.isInteger(quantity)) return false;
    const item = { productId: product.id, options, quantity }, key = cartKey(item), existing = cart.find(i => cartKey(i) === key);
    if ((!existing && cart.length >= MAX_LINES) || (existing && existing.quantity + quantity > MAX_QUANTITY)) { notify(`Puedes elegir hasta ${MAX_LINES} combinaciones y ${MAX_QUANTITY} unidades de cada una.`); return false; }
    setCart(previous => {
      const match = previous.find(i => cartKey(i) === key);
      if (match) return previous.map(i => cartKey(i) === key ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + quantity) } : i);
      return previous.length < MAX_LINES ? [...previous, item] : previous;
    });
    notify(`${product.name} se agregó a tu bolsa.`); return true;
  }
  return <StoreContext.Provider value={{ ...catalog, loading, error, refresh, cart, add,
    changeQuantity: (key, quantity) => { if (Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY) setCart(items => items.map(item => cartKey(item) === key ? { ...item, quantity } : item)); },
    remove: key => setCart(items => items.filter(item => cartKey(item) !== key)), clear: () => setCart([]), delivery, setDelivery, notice, notify,
  }}>{children}</StoreContext.Provider>;
}
