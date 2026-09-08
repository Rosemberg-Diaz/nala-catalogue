import { ArrowDown, ArrowRight, Check, Heart, MessageCircle, PackageCheck, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { business } from '../config';
import { assetUrl } from '../data/asset-url';
import ProductCard from '../components/ProductCard';
import Wholesale from '../components/Wholesale';
import { ErrorState, Loading } from '../components/ui';
export default function Home() {
  const { products, categories, loading, error, refresh } = useStore();
  return <>
    <section className="hero container"><div className="hero-copy"><div className="eyebrow hero-eyebrow"><span/> ACCESORIOS AL POR MAYOR, CON AMOR</div><h1>Tu esencia.<br/>Un pequeño<br/><em>detalle.</em><Sparkles className="hero-sparkle" size={43} strokeWidth={1}/></h1><p>Detalles que enamoran a tus clientes. <br/>Encuentra accesorios para tu tienda <br/>y haz crecer tu emprendimiento con Nala.</p><Link className="button" to="/catalogo">Explorar accesorios <ArrowUpRightIcon/></Link><div className="hero-note"><span className="tiny-heart"><Heart size={15}/></span>Elegidos con cariño, para acompañarte.</div></div><div className="hero-photo"><img src={assetUrl('/images/hero.jpg')} alt="Una selección de accesorios dorados sobre telas de tonos cálidos" fetchPriority="high"/><div className="hero-photo-label"><span>EL ARTE DE LOS PEQUEÑOS DETALLES</span><span>nala collection — 01</span></div><div className="hero-float"><Sparkles size={24} strokeWidth={1.3}/><div>Tu próximo favorito<small>está por aquí.</small></div><ArrowDown size={18}/></div></div></section>
    <div className="benefit-strip"><div className="container benefits"><span><Heart/>Accesorios elegidos con cariño</span><span><PackageCheck/>Compras al por mayor para tu negocio</span><span><MessageCircle/>Confirma fácil por WhatsApp</span></div></div>
    <section className="container home-catalog"><div className="section-heading"><div><span className="eyebrow">ENCUENTRA ESO QUE VA CONTIGO</span><h2>Pequeños grandes favoritos<span>.</span></h2></div><Link className="text-link" to="/catalogo">Ver todos los accesorios <ArrowRight size={18}/></Link></div><div className="category-pills"><Link className="active" to="/catalogo">Todos los accesorios</Link>{categories.map(c => <Link key={c.id} to={`/catalogo?categoria=${c.id}`}>{c.name}</Link>)}</div>{loading ? <Loading/> : error ? <ErrorState message={error} retry={refresh}/> : products.length ? <div className="product-grid">{products.filter(p => p.featured).slice(0, 4).map(product => <ProductCard key={product.id} product={product}/>)}</div> : <p className="quiet-message">Estamos preparando nuevos detalles para ti. Vuelve pronto.</p>}</section>
    <Wholesale/>
    <section className="container how-home"><div className="section-heading centered"><span className="eyebrow">ASÍ DE FÁCIL, ASÍ DE CERCANO</span><h2>De aquí a tus manos.</h2><p>Tú eliges los detalles. Nosotras te acompañamos.</p></div><div className="steps-grid"><div><span className="step-icon"><Heart/></span><small>01</small><h3>Encuentra tus favoritos</h3><p>Explora, elige tus opciones<br/>y agrégalos a tu bolsa.</p></div><div><span className="step-icon"><Truck/></span><small>02</small><h3>Cuéntanos cómo recibirlos</h3><p>Envío a domicilio o recogida.<br/>Lo que sea más cómodo para ti.</p></div><div><span className="step-icon"><MessageCircle/></span><small>03</small><h3>Hablemos por WhatsApp</h3><p>Envíanos tu pedido y<br/>lo confirmamos contigo.</p></div></div><p className="preparation-centered"><Check size={17}/>{business.preparation}</p></section>
  </>;
}
function ArrowUpRightIcon() { return <ArrowRight size={19} className="diagonal-arrow"/>; }
