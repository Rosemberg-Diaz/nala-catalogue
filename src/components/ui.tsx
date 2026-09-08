import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { business } from '../config';
import { resolveImage } from '../data/images';
import { assetUrl } from '../data/asset-url';
export function Photo({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [resolved, setResolved] = useState(src.startsWith('local:') ? '' : assetUrl(src)), [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true, objectUrl = ''; setFailed(false);
    resolveImage(src).then(url => { if (url.startsWith('blob:')) objectUrl = url; if (active) setResolved(url); else if (objectUrl) URL.revokeObjectURL(objectUrl); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);
  return <img className={className} src={failed ? assetUrl('/images/fallback.svg') : resolved || assetUrl('/images/fallback.svg')} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}
export function WholesaleNotice({ compact = false }: { compact?: boolean }) { return <div className="preparation"><MessageCircle size={20} aria-hidden="true" /><p>{compact ? business.wholesale.shortNote : business.wholesale.note}</p></div>; }
export function Quantity({ value, onChange, label = 'Cantidad' }: { value: number; onChange: (n: number) => void; label?: string }) { return <div className="quantity" role="group" aria-label={label}><button type="button" disabled={value <= 1} onClick={() => onChange(value - 1)} aria-label={`Disminuir ${label.toLowerCase()}`}><Minus size={16}/></button><span aria-live="polite">{value}</span><button type="button" disabled={value >= 99} onClick={() => onChange(value + 1)} aria-label={`Aumentar ${label.toLowerCase()}`}><Plus size={16}/></button></div>; }
export function Empty({ title, children, to = '/catalogo', action = 'Explorar accesorios' }: { title: string; children: ReactNode; to?: string; action?: string }) { return <section className="empty"><span className="empty-icon"><ShoppingBag size={30}/></span><h1>{title}</h1><p>{children}</p><Link className="button" to={to}>{action}<ArrowRight size={18}/></Link></section>; }
export function Loading() { return <div className="container loading" role="status"><div className="spinner"/>Un momento, estamos preparando todo…</div>; }
export function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <section className="empty" role="alert"><h1>Intentémoslo de nuevo</h1><p>{message}</p><button className="button" onClick={retry}>Volver a cargar</button></section>; }
export function DeliveryInformation() { return <section className="review-card delivery-information"><h2>Entregas y pagos</h2><ul>{business.deliveryNotes.map(note => <li key={note}>{note}</li>)}</ul><p>{business.shipping}</p></section>; }
