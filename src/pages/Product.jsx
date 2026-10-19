import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useViewTransitionState } from 'react-router-dom';
import { bySlug, inr, productPath, similarTo } from '../lib/data.js';
import { useShop } from '../lib/shop.jsx';
import Gallery from '../components/Gallery.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductName from '../components/ProductName.jsx';
import Rail from '../components/Rail.jsx';
import Reveal from '../components/Reveal.jsx';
import Split from '../components/Split.jsx';
import '../styles/product.css';

export default function Product() {
  const { slug } = useParams();
  const p = bySlug[slug];
  const { add } = useShop();
  const [qty, setQty] = useState(1);
  const morph = useViewTransitionState(p ? productPath(p) : '/product/none');

  useEffect(() => {
    if (p) document.title = `${p.name} — VANNAM`;
    setQty(1);
  }, [p]);

  if (!p) return <Navigate to="/shop" replace />;
  const more = similarTo(p, 8);
  const dm = p.dimensions;
  const size = dm ? (typeof dm === 'string' ? dm : Object.entries(dm).map(([k, v]) => `${k}: ${v}`).join(' · ')) : '';

  return (
    <>
      <section className="pdp" aria-labelledby="pdp-h">
        <div className="wrap">
          <p className="crumbs"><Link to="/" viewTransition>Home</Link><span aria-hidden="true">/</span><Link to="/shop" viewTransition>Shop</Link><span aria-hidden="true">/</span><span>{p.category}</span></p>
          <div className="pdp-grid">
            <Gallery key={p.id} images={p.gallery} tint={p.tint} vtName={morph ? 'pimg' : undefined} />

            <div className="pdp-info">
              <p className="kicker">{p.category}</p>
              <h1 id="pdp-h"><ProductName name={p.name} /></h1>
              <p className="price"><span>{inr(p.price)}</span><s aria-label="Original price">{inr(p.mrp)}</s><i>{p.discountPercent}% off</i></p>
              <p className="pdp-desc">{p.description}</p>
              <ul className="pdp-list">{p.highlights.map(h => <li key={h}>{h}</li>)}</ul>
              <dl className="pdp-spec">
                <div><dt>Fabric</dt><dd>{p.fabric}</dd></div>
                {size && <div><dt>Size</dt><dd>{size}</dd></div>}
                <div><dt>Made</dt><dd>Handcrafted in Coimbatore</dd></div>
              </dl>
              <div className="pdp-buy">
                <div className="qty-step" role="group" aria-label="Quantity">
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span aria-live="polite">{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(9, q + 1))} aria-label="Increase quantity">+</button>
                </div>
                <button type="button" className="btn btn-dark" data-magnetic onClick={() => add(p.id, qty)}>Add to bag · {inr(p.price * qty)}</button>
              </div>
              <p className="pdp-note">Move your cursor over the photos in the shop to look inside before you choose.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="more" aria-labelledby="more-h">
        <div className="wrap">
          <div className="more-head">
            <div>
              <Reveal as="p" className="eyebrow">Keep looking</Reveal>
              <Split id="more-h" text="You may also *love.*" />
            </div>
            <Reveal as="p" className="lede" d={2}>Pouches that sit close to this one: the same kind first, then pieces with a similar feel and price.</Reveal>
          </div>
          <Rail label="Similar pieces" className="rail-more">
            {more.map(q => <ProductCard key={q.id} p={q} reveal={false} sizes="(max-width: 720px) 80vw, (max-width: 1100px) 33vw, 290px" />)}
          </Rail>
        </div>
      </section>
    </>
  );
}
