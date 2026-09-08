import type { Product } from './models';

// Legacy products may not have a wholesale price yet. No threshold changes the price.
export const cataloguePrice = (product: Product) => product.wholesalePrice ?? product.price;
