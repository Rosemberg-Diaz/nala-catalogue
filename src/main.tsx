import React, { Suspense, lazy, Component, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as HistoryRouter, HashRouter, Routes, Route } from 'react-router-dom';
import StoreProvider from './state/StoreProvider';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import { Empty, Loading } from './components/ui';
import { business } from './config';
import './styles.css';
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));
const Info = lazy(() => import('./pages/Info'));
// GitHub Pages serves static files and cannot rewrite application routes.
const BrowserRouter = import.meta.env.MODE === 'pages' ? HashRouter : HistoryRouter;
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="empty"><h1>Algo no salió como esperábamos</h1><p>Tu bolsa sigue guardada. Recarga la página para volver a intentarlo.</p><button className="button" onClick={() => window.location.reload()}>Recargar página</button></div> : this.props.children; }
}
document.documentElement.style.setProperty('--olive', business.colors.primary);
document.documentElement.style.setProperty('--cream', business.colors.cream);
document.documentElement.style.setProperty('--accent', business.colors.accent);
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><BrowserRouter><StoreProvider><Suspense fallback={<Loading/>}><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="catalogo" element={<Catalog/>}/><Route path="producto/:id" element={<Product/>}/><Route path="carrito" element={<Cart/>}/><Route path="checkout" element={<Checkout/>}/><Route path="revisar" element={<Checkout review/>}/><Route path="como-pedir" element={<Info/>}/><Route path="privacidad" element={<Info privacy/>}/><Route path="admin/*" element={<Admin/>}/><Route path="*" element={<Empty title="Por aquí no era" to="/" action="Volver al inicio">Esta página no existe. Volvamos a los pequeños detalles.</Empty>}/></Route></Routes></Suspense></StoreProvider></BrowserRouter></ErrorBoundary></React.StrictMode>);
