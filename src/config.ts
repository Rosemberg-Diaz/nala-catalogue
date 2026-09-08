export const business = {
  name: 'nala',
  descriptor: 'ACCESORIOS',
  provisional: true,
  tagline: 'Pequeños detalles, mucho de ti.',
  colors: { primary: '#444c39', cream: '#fbf9f5', accent: '#bd845f' },
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER?.trim() || '573173560428',
  pickupName: 'Punto de recogida Nala',
  pickupAddress: import.meta.env.VITE_PICKUP_ADDRESS?.trim() || 'Dirección pendiente de configurar. La confirmaremos por WhatsApp.',
  city: 'Cali', department: 'Valle del Cauca',
  preparationDays: 3,
  preparation: 'Trabajamos bajo pedido. Tu pedido estará listo para entrega o recogida en un plazo de hasta 3 días hábiles después de su confirmación.',
  shipping: 'El costo de envío se confirma por WhatsApp y no está incluido en el total de productos.',
  social: { instagram: '', facebook: '' },
  currency: 'COP', locale: 'es-CO',
};
export const dataMode = import.meta.env.VITE_DATA_SOURCE === 'firebase' ? 'firebase' : 'mock';
// Keep the compact form readable in WhatsApp and on narrow phone screens.
export const money = (value: number) => new Intl.NumberFormat(business.locale, { style: 'currency', currency: business.currency, maximumFractionDigits: 0 }).format(value).replace(/\u00a0/g, '');
