import { useEffect } from 'react';
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Brand from './Brand';
import { business, dataMode } from '../config';
import { useStore } from '../state/store';
export default function Layout() {
  const { cart, notice } = useStore(), location = useLocation(); const [open, setOpen] = useState(false);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  useEffect(() => { window.scrollTo(0, 0); const main = document.getElementById('contenido'); main?.focus({ preventScroll: true }); }, [location.pathname]);
  return <>
    <a className="skip-link" href="#contenido" onClick={event => { event.preventDefault(); document.getElementById('contenido')?.focus(); }}>Saltar al contenido</a>
    <div className="announcement"><span>{business.wholesale.announcement}</span><span className="announcement-divider">✦</span><span>Desde $50.000</span></div>
    <header className="site-header"><div className="container header-inner">
      <Link to="/" className="brand" aria-label={`${business.name}, inicio`}><Brand/></Link>
      <nav className="desktop-nav" aria-label="Navegación principal"><NavLink to="/" end>Inicio</NavLink><NavLink to="/catalogo">Todos los accesorios</NavLink><Link to="/catalogo?destacados=1">Favoritos de Nala <Heart size={13}/></Link><Link to="/como-pedir">Cómo pedir</Link></nav>
      <div className="header-actions"><Link className="icon-button search-shortcut" to="/catalogo?buscar=1" aria-label="Buscar accesorios"><Search size={21}/></Link><Link className="bag-link" to="/carrito" aria-label={`Mi bolsa, ${count} productos`}><ShoppingBag size={21}/><span className="bag-label">Mi bolsa</span><span className="bag-count">{count}</span></Link><button className="icon-button mobile-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>{open ? <X/> : <Menu/>}</button></div>
    </div>{open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Menú móvil" onClick={() => setOpen(false)}><Link to="/">Inicio</Link><Link to="/catalogo">Todos los accesorios</Link><Link to="/catalogo?destacados=1">Favoritos de Nala</Link><Link to="/como-pedir">Cómo pedir</Link></nav>}</header>
    <main id="contenido" tabIndex={-1}><Outlet/></main>
    <footer className="footer"><div className="container footer-top"><div><Link className="brand" to="/"><Brand/></Link><p>Detalles que te acompañan.<br/>Accesorios que hablan de ti.</p></div><div><h3>Encuentra tu próximo favorito</h3><Link to="/catalogo">Explorar accesorios <ArrowUpRight size={15}/></Link><Link to="/como-pedir">Cómo hacer tu pedido</Link></div><div><h3>Estamos cerca</h3><p>Accesorios al por mayor<br/>Pedidos y asesoría por WhatsApp</p><Link to="/privacidad">Privacidad y condiciones</Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {business.name}. {business.tagline}</span><span>{dataMode === 'mock' ? 'Catálogo de muestra' : business.provisional ? 'Identidad provisional' : 'Hecho con cariño'}<Link to="/admin">Administración</Link></span></div></footer>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><ShoppingBag size={18}/>{notice}<Link to="/carrito">Ver bolsa</Link></>}</div>
  </>;
}
