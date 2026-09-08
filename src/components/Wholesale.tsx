import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { business } from '../config';
import { assetUrl } from '../data/asset-url';
import { whatsappLink } from '../domain/order';

export default function Wholesale() {
  const copy = business.wholesale;
  return <section className="container wholesale-section" aria-labelledby="wholesale-title">
    <div className="wholesale-panel">
      <div className="wholesale-copy">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2 id="wholesale-title">{copy.title}</h2>
        <p>{copy.description}</p>
        <div className="wholesale-actions">
          <a className="button" href={whatsappLink(copy.message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={19}/>{copy.action}</a>
          <Link className="text-link" to="/catalogo">Armar mi selección <ArrowUpRight size={18}/></Link>
        </div>
        <p className="wholesale-note">{copy.note}</p>
      </div>
      <div className="wholesale-art" aria-hidden="true"><img src={assetUrl(business.heart)} alt="" loading="lazy"/><span>Tu idea.<br/>Nuestros detalles.<br/><em>Mucho por crecer.</em></span></div>
    </div>
  </section>;
}
