import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CATS, PRODUCTS, inr } from '../lib/data.js';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import Split from '../components/Split.jsx';
import '../styles/shop.css';

const CHIPS = ['All', ...CATS];

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const loc = useLocation();
  const [sort, setSort] = useState('f');
  const input = useRef(null);
  const cat = CHIPS.includes(sp.get('cat')) ? sp.get('cat') : 'All';
  const q = sp.get('q') || '';

  useEffect(() => { document.title = 'Shop — VANNAM'; }, []);
  useEffect(() => {                                     // the nav's search icon lands here with ?search=1
    if (sp.get('search') !== '1') return;
    const t = setTimeout(() => { input.current?.focus({ preventScroll: true }); input.current?.scrollIntoView({ block: 'center' }); }, 350);
    return () => clearTimeout(t);
  }, [loc.key]);   // eslint-disable-line react-hooks/exhaustive-deps

  const update = (k, v) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    n.delete('search');
    setSp(n, { replace: true });
  };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    let L = PRODUCTS.filter(p => (cat === 'All' || p.category === cat) && (!s || `${p.name} ${p.category} ${p.fabric} ${p.tags.join(' ')}`.toLowerCase().includes(s)));
    if (sort === 'lo') L = [...L].sort((a, b) => a.price - b.price);
    if (sort === 'hi') L = [...L].sort((a, b) => b.price - a.price);
    return L;
  }, [cat, q, sort]);

  const filtered = cat !== 'All' || q;
  const clear = () => setSp({}, { replace: true });

  return (
    <>
      <section className="shop-hero" aria-labelledby="store-h">
        <div className="wrap">
          <p className="crumbs"><Link to="/" viewTransition>Home</Link><span aria-hidden="true">/</span><span>Shop</span></p>
          <div className="shop-head">
            <div>
              <Reveal as="p" className="eyebrow">The Vannam store</Reveal>
              <Split as="h1" id="store-h" className="page-title" text={'Everything we make,\n*in one place.*'} />
            </div>
            <Reveal as="p" className="lede" d={2}>{PRODUCTS.length} handcrafted pieces across {CATS.length} kinds of pouch, from {inr(Math.min(...PRODUCTS.map(p => p.price)))}. Handcrafted in Coimbatore.</Reveal>
          </div>
        </div>
      </section>

      <section className="store" aria-label="Products">
        <div className="wrap">
          <div className="toolbar" role="toolbar" aria-label="Filter and sort products">
            <div className="chips">
              {CHIPS.map(c => (
                <button key={c} type="button" className="chip" aria-pressed={c === cat} onClick={() => update('cat', c === 'All' ? '' : c)}>
                  {c}<span>{c === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === c).length}</span>
                </button>
              ))}
            </div>
            <input ref={input} type="search" className="field" placeholder="Search pouches" aria-label="Search products" value={q} onChange={e => update('q', e.target.value)} />
            <select className="field" aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="f">Featured</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option>
            </select>
          </div>

          <p className="count" aria-live="polite"><span>Showing <b>{list.length}</b> of {PRODUCTS.length} pieces</span>{filtered && <button type="button" className="link sm" onClick={clear}>Clear filters</button>}</p>

          {list.length ? (
            <div className="pgrid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <div className="empty"><p className="serif">Nothing matches that</p><p>Try another word, or clear the filters.</p><button type="button" className="btn btn-dark" onClick={clear}>Clear filters</button></div>
          )}
        </div>
      </section>
    </>
  );
}
