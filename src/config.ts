export const business = {
  name: 'nala',
  descriptor: 'ACCESORIOS',
  provisional: false,
  logo: '/images/nala-logo.jpg',
  heart: '/images/nala-heart.jpg',
  tagline: 'Pequeños detalles, mucho de ti.',
  colors: { primary: '#a23d64', cream: '#fff9fc', accent: '#d67e9e' },
  wholesale: {
    announcement: 'Accesorios al por mayor',
    eyebrow: 'PARA TU TIENDA, TU EMPRENDIMIENTO O TU PRÓXIMA IDEA',
    title: 'Haz crecer tu negocio con Nala.',
    description: 'Llena tu tienda de detalles que enamoran. Descubre nuestros accesorios y arma una selección al por mayor para tus clientes.',
    action: 'Hablemos de tu compra al por mayor',
    message: '¡Hola, Nala! Me interesa comprar accesorios al por mayor. ¿Me comparten las condiciones y cómo hacer mi pedido?',
    note: 'Consulta las condiciones de compra al por mayor por WhatsApp.',
  },
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
