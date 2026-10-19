import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShopProvider } from './lib/shop.jsx';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import BagDrawer from './components/BagDrawer.jsx';
import Cursor from './components/Cursor.jsx';
import ZipProgress from './components/ZipProgress.jsx';
import Preloader from './components/Preloader.jsx';

function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) { requestAnimationFrame(() => el.scrollIntoView({ block: 'start' })); return; }
    }
    scrollTo(0, 0);
  }, [pathname, hash, key]);
  return null;
}

export default function App() {
  return (
    <ShopProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main"><Outlet /></main>
      <Footer />
      <BagDrawer />
      <Toast />
      <ZipProgress />
      <Cursor />
      <Preloader />
      <ScrollManager />
    </ShopProvider>
  );
}
