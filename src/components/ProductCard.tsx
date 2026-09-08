import { cataloguePrice } from '../domain/pricing';
import { ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../domain/models';
import { money } from '../config';
import { useStore } from '../state/store';
import { Photo } from './ui';
export default function ProductCard({ product }: { product: Product }) {
  const { add, categories } = useStore();
  return <article className="product-card"><Link to={`/producto/${product.id}`} className="product-image-link"><Photo src={product.images[0].url} alt={product.images[0].alt}/>{product.featured && <span className="product-badge">Favorito de Nala</span>}<span className="product-discover"><ArrowUpRight size={21}/></span></Link><div className="product-card-body"><span className="eyebrow">{categories.find(c => c.id === product.categoryId)?.name}</span><div className="product-name-row"><h3><Link to={`/producto/${product.id}`}>{product.name}</Link></h3><span>{money(cataloguePrice(product))}<small className="price-caption">Al por mayor</small></span></div><div className="product-card-bottom"><span>{product.options.length ? product.options.map(o => o.name).join(' · ') + ' a elegir' : 'Un detalle para todos los días'}</span>{product.options.length ? <Link to={`/producto/${product.id}`} className="add-small" aria-label={`Elegir opciones de ${product.name}`}><Plus size={19}/></Link> : <button className="add-small" onClick={() => add(product, {}, 1)} aria-label={`Agregar ${product.name} a la bolsa`}><Plus size={19}/></button>}</div></div></article>;
}
