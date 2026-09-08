import { createContext, useContext } from 'react';
import type { CartItem, Catalog, Delivery, Product } from '../domain/models';
export type Store = Catalog & {
  loading: boolean; error: string; refresh: () => Promise<void>;
  cart: CartItem[]; add: (product: Product, options: Record<string, string>, quantity: number) => boolean;
  changeQuantity: (key: string, quantity: number) => void; remove: (key: string) => void; clear: () => void;
  delivery: Delivery; setDelivery: (data: Delivery) => void;
  notice: string; notify: (text: string) => void;
};
export const StoreContext = createContext<Store | null>(null);
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error('Store unavailable'); return value; }
