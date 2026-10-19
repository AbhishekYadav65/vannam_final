import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { asset, byId } from '../lib/data.js';
import { attachRipple } from '../lib/ripple.js';
import { Arrow, Spark } from '../components/Icons.jsx';
import Split from '../components/Split.jsx';

const CHIPS = [
  { label: 'Hair tool', cat: 'Hair Tool Pouches', id: 3 },
  { label: 'Makeup', cat: 'Makeup Pouches', id: 12 },
  { label: 'Napkin', cat: 'Napkin & Small Pouches', id: 7 }
];

export default function Hero() {
  const hero = useRef(null), video = useRef(null), canvas = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [late] = useState(() => { const c = document.documentElement.classList; return c.contains('intro') && !c.contains('intro-done'); });

  useEffect(() => {
    const v = video.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches || navigator.connection?.saveData) return;       // poster only
    let cancelled = false, detach = () => {}, idleId = 0;

    const start = () => {
      if (cancelled) return;
      v.src = asset(matchMedia('(max-width: 800px)').matches ? 'video/hero-sm.mp4' : 'video/hero.mp4');
      v.muted = true;
      v.play().then(() => { if (!cancelled) setPlaying(true); }).catch(() => {});
      detach = attachRipple({ hero: hero.current, video: v, canvas: canvas.current });
    };
    // the poster paints first; the video starts once the page has finished loading and the browser is idle
    const afterLoad = () => { idleId = (window.requestIdleCallback || (f => setTimeout(f, 250)))(start); };
    if (document.readyState === 'complete') afterLoad(); else addEventListener('load', afterLoad, { once: true });

    // Keep the background video looping while the page is open, even when the hero
    // scrolls out of view. Pause only in a hidden tab, then resume when it is active.
    const vis = () => {
      if (!v.src) return;
      if (document.hidden) v.pause();
      else v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', vis);

    return () => {
      cancelled = true; detach();
      document.removeEventListener('visibilitychange', vis);
      removeEventListener('load', afterLoad);
      if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      v.pause(); v.removeAttribute('src'); v.load();
    };
  }, []);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = hero.current; let queued = false, px = 0, py = 0;
    const frame = () => { queued = false; el.style.setProperty('--px', px.toFixed(3)); el.style.setProperty('--py', py.toFixed(3)); };
    const onMove = e => {
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2; py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!queued) { queued = true; requestAnimationFrame(frame); }
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section className={`hero${late ? ' late' : ''}`} ref={hero} aria-label="Welcome">
      <img className="hero-poster" src={asset('img/hero-poster-1280.webp')} srcSet={`${asset('img/hero-poster-720.webp')} 720w, ${asset('img/hero-poster-1280.webp')} 1280w`} sizes="100vw" width="1280" height="720" alt="" fetchpriority="high" decoding="async" />
      <video className={`hero-video${playing ? ' on' : ''}`} ref={video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <canvas className="hero-fx" ref={canvas} aria-hidden="true" />
      <div className="hero-shade" />

      <div className="wrap hero-body">
        <p className="tag"><Spark /> Handcrafted in Coimbatore</p>
        <Split as="h1" className="hero-h1" auto squiggle="Lovingly" text={"Little things,\n*Lovingly* made."} />
        <p className="hero-sub">Bags and everyday essentials, handcrafted for your stories.</p>
        <div className="hero-actions">
          <Link className="btn btn-blush" data-magnetic to="/shop" viewTransition>Explore the collection <Arrow /></Link>
          <ul className="hero-chips" aria-label="Shop by kind">
            {CHIPS.map(c => (
              <li key={c.cat}>
                <Link to={{ pathname: '/shop', search: `?cat=${encodeURIComponent(c.cat)}` }} viewTransition>
                  <img src={asset(byId[c.id].tile.sm)} alt="" width="40" height="40" loading="lazy" decoding="async" style={{ background: byId[c.id].tint }} />
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <svg className="sticker" viewBox="0 0 120 120" role="img" aria-label="100 percent handmade in Coimbatore">
        <circle cx="60" cy="60" r="58" className="st-bg" />
        <defs><path id="st-path" d="M60,60 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" /></defs>
        <g className="st-spin"><text className="st-text"><textPath href="#st-path" startOffset="0" textLength="253" lengthAdjust="spacing">handmade • coimbatore • with love •</textPath></text></g>
        <path className="st-heart" d="M60 79C32 61 40 36 53 38c5 1 7 5 7 8 0-3 2-7 7-8 13-2 21 23-7 41z" />
      </svg>
    </section>
  );
}
