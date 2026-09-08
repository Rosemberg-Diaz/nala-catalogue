import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Pencil } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { business, money } from '../config';
import { createOrderMessage, deliveryErrors, resolveCart, whatsappLink } from '../domain/order';
import type { Delivery } from '../domain/models';
import { useStore } from '../state/store';
import { getRepository } from '../data/repository';
import { DeliveryInformation, ErrorState, Loading, WholesaleNotice } from '../components/ui';
import CartLines from '../components/CartLines';
export default function Checkout({ review = false }: { review?: boolean }) {
  const { cart, products, delivery, setDelivery, loading, error, refresh, notify } = useStore();
  const [errors, setErrors] = useState<Partial<Record<keyof Delivery, string>>>({});
  const [sending, setSending] = useState(false), [sendError, setSendError] = useState(''), [manualLink, setManualLink] = useState('');
  const navigate = useNavigate(), form = useRef<HTMLFormElement>(null);
  if (loading) return <Loading/>;
  if (error) return <ErrorState message={error} retry={refresh}/>;
  const { lines, issues, total } = resolveCart(cart, products);
  if (!cart.length || issues.length) return <Navigate to="/carrito" replace/>;
  if (review && Object.keys(deliveryErrors(delivery)).length) return <Navigate to="/checkout" replace/>;
  const previewMessage = review ? createOrderMessage(lines, delivery) : '';
  const update = (key: keyof Delivery, value: string) => { setDelivery({ ...delivery, [key]: value }); setErrors(previous => ({ ...previous, [key]: undefined })); };
  function next(event: React.FormEvent) {
    event.preventDefault(); const problems = deliveryErrors(delivery); setErrors(problems);
    if (Object.keys(problems).length) { const first = Object.keys(problems)[0]; form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    navigate('/revisar');
  }
  async function sendOrder() {
    setSending(true); setSendError(''); setManualLink('');
    try {
      const fresh = await (await getRepository()).getCatalog(); const current = resolveCart(cart, fresh.products);
      if (current.issues.length || current.total !== total || JSON.stringify(current.lines.map(l => l.product)) !== JSON.stringify(lines.map(l => l.product))) {
        await refresh(); setSendError('El catálogo cambió. Revisa los productos y precios actualizados antes de continuar.'); return;
      }
      const message = createOrderMessage(current.lines, delivery);
      try { const link = whatsappLink(message); if (link.length > 8000) { setSendError('Tu pedido es muy largo para un enlace. Copia el mensaje y pégalo en el chat.'); setManualLink(`https://wa.me/${business.whatsappNumber}`); } else window.location.assign(link); } catch (reason) { setSendError(reason instanceof Error ? reason.message : 'No pudimos preparar WhatsApp. Puedes copiar el mensaje.'); }
    } catch { setSendError('No pudimos verificar el catálogo. Comprueba tu conexión y vuelve a intentarlo.'); } finally { setSending(false); }
  }
  const field = (key: keyof Delivery, label: string, placeholder: string, required = false, autoComplete?: string) => <label className={`field ${errors[key] ? 'has-error' : ''}`} key={key}><span id={`label-${key}`}>{label}{!required && <small>Opcional</small>}</span><input aria-labelledby={`label-${key}`} name={key} value={delivery[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder} required={required} maxLength={180} autoComplete={autoComplete} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined}/>{errors[key] && <span className="field-error" id={`error-${key}`}>{errors[key]}</span>}</label>;
  return <div className="container flow-page"><Link className="back-link" to={review ? '/checkout' : '/carrito'}><ArrowLeft size={17}/>{review ? 'Modificar mis datos' : 'Volver a mi bolsa'}</Link><ol className="checkout-steps"><li className="complete"><Link to="/carrito"><Check size={15}/>Mi bolsa</Link></li><li className={review ? 'complete' : 'current'}><Link to="/checkout"><span>2</span>Tus datos</Link></li><li className={review ? 'current' : ''}><span>3</span>Revisar pedido</li></ol><div className="page-intro"><span className="eyebrow">{review ? 'TU PEDIDO SE CONFIRMA POR WHATSAPP' : 'UN PASO MÁS CERCA DE TUS FAVORITOS'}</span><h1>{review ? 'Revisa tu pedido' : 'Cuéntanos de ti'}</h1><p>{review ? 'Revisa los detalles y envía tu pedido a Nala por WhatsApp.' : 'Solo necesitamos tu nombre y ciudad. Los demás datos y el pago los acordaremos por WhatsApp.'}</p></div><div className="flow-grid"><div>{review ? <><section className="review-card"><div className="section-heading"><h2>Tus datos</h2><Link className="text-link" to="/checkout"><Pencil size={15}/>Modificar</Link></div><strong>{delivery.name}</strong><p>Ciudad: {delivery.city}</p><p>Coordinaremos la entrega y el pago por WhatsApp.</p></section><section className="review-card"><div className="section-heading"><h2>Tus accesorios</h2><Link className="text-link" to="/carrito"><Pencil size={15}/>Modificar</Link></div><CartLines lines={lines}/></section><DeliveryInformation/><WholesaleNotice/></> : <form ref={form} onSubmit={next} noValidate><section className="checkout-fields"><h2>Tu nombre y ciudad</h2>{field('name', 'Nombre completo', 'Tu nombre y apellido', true, 'name')}{field('city', 'Ciudad', 'Ej. Cali', true, 'address-level2')}<p className="privacy-note">Tu nombre y ciudad solo se usan para preparar el mensaje de WhatsApp. No se guardan en nuestra base de datos. Una recarga borrará estos campos.</p></section><DeliveryInformation/><WholesaleNotice/><button className="button next-button" type="submit">Revisar mi pedido <ArrowRight size={18}/></button></form>}</div><aside className="order-summary"><h2>Resumen de tu pedido</h2>{lines.map(line => <div className="summary-row" key={line.key}><span>{line.quantity} × {line.product.name}</span><span>{money(line.subtotal)}</span></div>)}<div className="summary-total"><span>Total productos</span><strong>{money(total)}</strong></div><p className="subtle-note">{business.shipping}</p>{review && <><p className="summary-explanation">Al pulsar el botón irás al chat de Nala con tu pedido listo. Allí pulsa Enviar. Nala te responderá para confirmar los precios y la entrega.</p><button className="button whatsapp-button full" onClick={sendOrder} disabled={sending} aria-busy={sending}>{sending ? 'Comprobando disponibilidad…' : <><WhatsAppIcon/>Enviar pedido a Nala</>}</button>{sendError && <p className="error-box" role="alert">{sendError}</p>}{manualLink && <a className="text-link" href={manualLink}>Ir al chat de Nala para pegar el pedido</a>}<div className="whatsapp-ready"><details><summary>Ver mensaje completo</summary><textarea className="message-preview" aria-label="Mensaje completo del pedido" readOnly value={previewMessage} rows={14} onFocus={e => e.target.select()}/><button className="button secondary full" onClick={async () => { try { await navigator.clipboard.writeText(previewMessage); notify('Pedido copiado. Puedes pegarlo en WhatsApp.'); } catch { setSendError('Selecciona y copia el mensaje que aparece debajo.'); } }}><Copy size={17}/>Copiar pedido</button></details></div><p className="privacy-note">Al enviar, compartes estos datos con el negocio mediante WhatsApp. <Link to="/privacidad">Ver privacidad</Link>.</p></>}</aside></div></div>;
}
function WhatsAppIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8a8.5 8.5 0 1 1 16.1-4.1Z"/><path d="m8.1 7.5 1.3-.2 1.1 2.5-1 1.1c.7 1.5 1.7 2.5 3.3 3.2l1-1 2.6 1.2-.2 1.3c-.2 1-1.3 1.4-2.2 1.1-3.8-1-6.7-3.9-7.3-7.2-.2-.9.4-1.8 1.4-2Z"/></svg>;
}
