import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../lib/shop.jsx';
import { Bag, Burger, Close, Search } from './Icons.jsx';

const ANCHORS = [
  { to: { pathname: '/', hash: '#story' }, label: 'Our story' },
  { to: { pathname: '/', hash: '#little-things' }, label: 'The little things' },
  { to: { pathname: '/', hash: '#reviews' }, label: 'Reviews' }
];

export default function Nav() {
  const { count, openBag } = useShop();
  const navigate = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [stuck, setStuck] = useState(false);

  // floating pill: tightens after the first scroll, slides away going down, returns going up
  useEffect(() => {
    let last = scrollY, queued = false;
    const frame = () => {
      queued = false;
      const y = scrollY;
      setStuck(y > 30);
      if (y > last + 6 && y > 420) setHidden(true);
      else if (y < last - 6 || y < 200) setHidden(false);
      last = y;
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname, loc.hash]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = e => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', esc);
    return () => { removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [open]);

  const search = () => navigate('/shop?search=1');

  return (
    <>
    <header className={`nav${hidden && !open ? ' hide' : ''}${stuck ? ' stuck' : ''}${loc.pathname !== '/' ? ' solid' : ''}`}>
      <div className="nav-pill">
        <Link className="nav-logo" to="/" viewTransition aria-label="VANNAM home">VANNAM</Link>
        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/shop" viewTransition className={({ isActive }) => (isActive ? 'on' : '')}>Shop</NavLink>
          {ANCHORS.map(a => <Link key={a.label} to={a.to}>{a.label}</Link>)}
        </nav>
        <div className="nav-tools">
          <button type="button" className="nav-ico" onClick={search} aria-label="Search the shop"><Search /></button>
          <button type="button" className="nav-ico" onClick={openBag} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
            <Bag />{count > 0 && <b className="nav-badge">{count}</b>}
          </button>
          <Link className="nav-cta" data-magnetic to={{ pathname: '/', hash: '#contact' }}>Say hello</Link>
          <button type="button" className="nav-ico nav-burger" onClick={() => setOpen(o => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <Close /> : <Burger />}
          </button>
        </div>
      </div>
      {open && (
        <div className="nav-sheet" role="dialog" aria-label="Menu">
          <nav aria-label="Mobile">
            <Link to="/shop"><i>01</i>Shop</Link>
            <Link to={{ pathname: '/', hash: '#story' }}><i>02</i>Our story</Link>
            <Link to={{ pathname: '/', hash: '#little-things' }}><i>03</i>The little things</Link>
            <Link to={{ pathname: '/', hash: '#reviews' }}><i>04</i>Reviews</Link>
            <Link to={{ pathname: '/', hash: '#contact' }}><i>05</i>Say hello</Link>
          </nav>
        </div>
      )}
    </header>
    {hidden && !open && (
      <button type="button" className="bag-fab" onClick={openBag} aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}>
        <Bag />{count > 0 && <b className="nav-badge">{count}</b>}
      </button>
    )}
    </>
  );
}
