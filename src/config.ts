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
    note: 'Compras al por mayor a partir de $50.000. Puedes enviar pedidos por un valor menor; Nala confirmará por WhatsApp el precio aplicable.',
    shortNote: 'Compras al por mayor a partir de $50.000.',
  },
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER?.trim() || '573150026236',
  pickupName: 'Punto de recogida Nala',
  pickupAddress: import.meta.env.VITE_PICKUP_ADDRESS?.trim() || 'Dirección pendiente de configurar. La confirmaremos por WhatsApp.',
  city: 'Cali', department: 'Valle del Cauca',
  shipping: 'El costo de envío se confirma por WhatsApp y no está incluido en el total de productos.',
  social: { instagram: '', facebook: '' },
  currency: 'COP', locale: 'es-CO',
};
export const dataMode = import.meta.env.VITE_DATA_SOURCE === 'firebase' ? 'firebase' : 'mock';
// Keep the compact form readable in WhatsApp and on narrow phone screens.
export const money = (value: number) => new Intl.NumberFormat(business.locale, { style: 'currency', currency: business.currency, maximumFractionDigits: 0 }).format(value).replace(/\u00a0/g, '');
