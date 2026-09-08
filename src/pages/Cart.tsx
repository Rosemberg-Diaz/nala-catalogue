import { ArrowLeft, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { cartKey, resolveCart } from '../domain/order';
import { money } from '../config';
import CartLines from '../components/CartLines';
import { Empty, ErrorState, Loading, Preparation } from '../components/ui';
export default function Cart() {
  const { cart, products, remove, loading, error, refresh } = useStore();
  if (loading) return <Loading/>;
  if (error) return <ErrorState message={error} retry={refresh}/>;
  if (!cart.length) return <Empty title="Tu bolsa espera un detalle">Encuentra algo que te guste y guárdalo aquí. Elegir es la parte bonita.</Empty>;
  const { lines, total, issues } = resolveCart(cart, products);
  const invalid = cart.filter(item => !lines.some(line => line.key === cartKey(item)));
  return <div className="container flow-page"><Link className="back-link" to="/catalogo"><ArrowLeft size={17}/>Seguir explorando</Link><div className="page-intro"><span className="eyebrow">TUS PEQUEÑOS FAVORITOS</span><h1>Mi bolsa<span>.</span></h1><p>{cart.reduce((sum, item) => sum + item.quantity, 0)} accesorios elegidos por ti.</p></div><div className="flow-grid"><div>{issues.length > 0 && <div className="error-box" role="alert"><h3>Tu bolsa necesita una actualización</h3>{invalid.map((item, i) => <div className="invalid-line" key={cartKey(item)}><p>{issues[i]}</p><button className="text-link" onClick={() => remove(cartKey(item))}><Trash2 size={15}/>Eliminar producto no disponible</button></div>)}</div>}<CartLines lines={lines} editable/><p className="subtle-note">Los precios y opciones se verifican de nuevo antes de abrir WhatsApp.</p></div><aside className="order-summary"><h2>Tu pedido, de un vistazo</h2><div className="summary-row"><span>Subtotal de productos</span><span>{money(total)}</span></div><div className="summary-row muted"><span>Entrega</span><span>A elegir en el siguiente paso</span></div><div className="summary-total"><span>Total productos</span><strong>{money(total)}</strong></div><p className="subtle-note">El envío, si aplica, se confirma por WhatsApp.</p>{issues.length ? <button className="button full" disabled>Actualiza tu bolsa para continuar</button> : <Link className="button full" to="/checkout">Continuar con mi pedido <ArrowRight size={18}/></Link>}<Preparation/><p className="secure-note"><ShieldCheck size={16}/>No realizas ningún pago en esta página.</p></aside></div></div>;
}
