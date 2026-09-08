import { cataloguePrice } from '../domain/pricing';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CartLine } from '../domain/models';
import { money } from '../config';
import { useStore } from '../state/store';
import { Photo, Quantity } from './ui';
export default function CartLines({ lines, editable = false }: { lines: CartLine[]; editable?: boolean }) {
  const { changeQuantity, remove } = useStore();
  return <div className="cart-lines">{lines.map(line => <article className="cart-line" key={line.key}><Link to={`/producto/${line.productId}`} tabIndex={-1} aria-hidden="true"><Photo src={line.product.images[0].url} alt=""/></Link><div className="cart-line-info"><h3><Link to={`/producto/${line.productId}`}>{line.product.name}</Link></h3><p>{line.product.options.filter(o => line.options[o.id]).map(o => `${o.name}: ${line.options[o.id]}`).join(' · ')}</p><p>{money(cataloguePrice(line.product))} por unidad</p>{editable ? <Quantity value={line.quantity} onChange={quantity => changeQuantity(line.key, quantity)} label={`Cantidad de ${line.product.name}`}/> : <p>Cantidad: {line.quantity}</p>}</div><div className="cart-line-end"><strong>{money(line.subtotal)}</strong>{editable && <button className="icon-button" onClick={() => remove(line.key)} aria-label={`Eliminar ${line.product.name}`}><Trash2 size={18}/></button>}</div></article>)}</div>;
}
