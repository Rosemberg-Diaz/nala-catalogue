import { cataloguePrice } from '../domain/pricing';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../state/store';
import { money } from '../config';
import { optionErrors } from '../domain/order';
import { Empty, ErrorState, Loading, Photo, WholesaleNotice, Quantity } from '../components/ui';
import ProductCard from '../components/ProductCard';
export default function ProductPage() {
  const { id } = useParams();
  return <ProductDetail key={id} id={id || ''}/>;
}
function ProductDetail({ id }: { id: string }) {
  const { products, categories, loading, error, refresh, add } = useStore();
  const [selected, setSelected] = useState<Record<string, string>>({}), [quantity, setQuantity] = useState(1), [image, setImage] = useState(0), [errors, setErrors] = useState<string[]>([]), [added, setAdded] = useState(false);
  if (loading) return <Loading/>;
  if (error) return <ErrorState message={error} retry={refresh}/>;
  const product = products.find(p => p.id === id && p.active);
  if (!product) return <Empty title="Este detalle no está disponible">Puede que esté tomando una pausa. Hay otros accesorios esperando por ti.</Empty>;
  const category = categories.find(c => c.id === product.categoryId);
  const related = products.filter(p => p.id !== id && p.categoryId === product.categoryId).slice(0, 4);
  function submit(e: React.FormEvent) {
    e.preventDefault(); if (!product) return;
    const problems = optionErrors(product, selected); setErrors(problems);
    if (problems.length) { document.getElementById('option-errors')?.focus(); return; }
    if (add(product, selected, quantity)) setAdded(true);
  }
  return <div className="container product-page"><nav className="breadcrumbs" aria-label="Ruta de navegación"><Link to="/catalogo">Accesorios</Link><ChevronRight size={13}/><Link to={`/catalogo?categoria=${product.categoryId}`}>{category?.name}</Link><ChevronRight size={13}/><span>{product.name}</span></nav><div className="product-detail"><div className="gallery"><div className="main-photo"><Photo src={product.images[image]?.url || product.images[0].url} alt={product.images[image]?.alt || product.name} eager/>{product.featured && <span className="product-badge">Favorito de Nala</span>}</div>{product.images.length > 1 && <div className="thumbnails">{product.images.map((photo, i) => <button key={photo.url + i} className={image === i ? 'selected' : ''} onClick={() => setImage(i)} aria-label={`Ver fotografía ${i + 1}`} aria-pressed={image === i}><Photo src={photo.url} alt={photo.alt}/></button>)}</div>}</div><div className="product-info"><span className="eyebrow">{category?.name} · ELEGIDO CON CARIÑO</span><h1>{product.name}</h1><div className="product-prices"><p className="detail-price">{money(cataloguePrice(product))} <small>COP · Al por mayor</small></p><p className="retail-price">{money(product.price)} <span>COP · Al detal</span></p></div><p className="product-description">{product.description}</p><form onSubmit={submit} noValidate>{product.options.map(option => <fieldset className="option-field" key={option.id}><legend>{option.name} <span>{option.required ? '· Elige una opción' : '· Opcional'}</span></legend><div className="option-buttons">{option.values.map(value => <label key={value} className={selected[option.id] === value ? 'selected' : ''}><input type="radio" name={option.id} value={value} checked={selected[option.id] === value} onChange={() => { setSelected({ ...selected, [option.id]: value }); setAdded(false); setErrors([]); }}/>{option.id === 'color' && <span className={`swatch swatch-${value.toLowerCase()}`}/>}<span>{value}</span>{selected[option.id] === value && <Check size={14}/>}</label>)}</div>{!option.required && selected[option.id] && <button type="button" className="text-link" onClick={() => { const next = { ...selected }; delete next[option.id]; setSelected(next); }}>Quitar selección</button>}</fieldset>)}<div id="option-errors" tabIndex={-1} role="alert">{errors.map(message => <p className="field-error" key={message}>{message}</p>)}</div><div className="add-row"><Quantity value={quantity} onChange={setQuantity}/><button className="button" type="submit"><ShoppingBag size={19}/>{added ? 'Agregar otro a mi bolsa' : 'Agregar a mi bolsa'}</button></div>{added && <Link className="added-link" to="/carrito"><Check size={17}/>Ya está en tu bolsa. Ver mi pedido <ChevronRight size={16}/></Link>}</form><WholesaleNotice/><div className="product-assurances"><span><Truck size={17}/>Envío a domicilio o recogida</span><span><ShieldCheck size={17}/>Confirmas tu pedido por WhatsApp</span></div></div></div>{related.length > 0 && <section className="related"><div className="section-heading"><h2>También van contigo.</h2><Link className="text-link" to="/catalogo">Seguir explorando <ArrowLeft size={16}/></Link></div><div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p}/>)}</div></section>}</div>;
}
