import { useRef, useState } from 'react';
import { Link, useViewTransitionState } from 'react-router-dom';
import Pic from './Pic.jsx';
import { productPath } from '../lib/data.js';

// A product photo you can look into. At rest it shows the outside; under a mouse a stitched lens follows the cursor
// and reveals the inside. On touch screens a small button reveals it instead. Keyboard focus reveals it fully.
// The click goes to the product page, and the photo morphs into that page's gallery (View Transitions).
export default function PeekTile({ p, sizes, className = '', badge, tag }) {
  const to = productPath(p);
  const morphing = useViewTransitionState(to);
  const media = useRef(null), ring = useRef(null);
  const st = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, w: 1, h: 1, raf: 0 });
  const [peeking, setPeeking] = useState(false);

  const paint = () => {
    const o = st.current; o.raf = 0;
    const m = media.current; if (!m) return;
    o.x += (o.tx - o.x) * 0.26; o.y += (o.ty - o.y) * 0.26;
    m.style.setProperty('--x', (o.x * 100).toFixed(2) + '%');
    m.style.setProperty('--y', (o.y * 100).toFixed(2) + '%');
    ring.current.style.transform = `translate3d(${(o.x * o.w).toFixed(1)}px, ${(o.y * o.h).toFixed(1)}px, 0)`;
    if (Math.abs(o.tx - o.x) + Math.abs(o.ty - o.y) > 0.0008) o.raf = requestAnimationFrame(paint);
  };
  const aim = (e, snap) => {
    if (e.pointerType === 'touch') return;
    const o = st.current, r = media.current.getBoundingClientRect();
    o.w = r.width; o.h = r.height;
    o.tx = (e.clientX - r.left) / r.width; o.ty = (e.clientY - r.top) / r.height;
    if (snap) { o.x = o.tx; o.y = o.ty; media.current.style.setProperty('--R', Math.min(150, r.width * 0.36).toFixed(0) + 'px'); }
    if (!o.raf) o.raf = requestAnimationFrame(paint);
  };

  return (
    <div className={`pk ${className}`.trim()} style={{ '--tint': p.tint }}>
      <Link className="pk-link" to={to} viewTransition aria-label={`View ${p.name}`} data-cursor="none"
        onPointerEnter={e => aim(e, true)} onPointerMove={e => aim(e, false)}>
        <span className={`pk-media${peeking ? ' peeking' : ''}`} ref={media} style={morphing ? { viewTransitionName: 'pimg' } : undefined}>
          <Pic img={p.rest} sizes={sizes} className="pk-rest" draggable="false" />
          <span className="pk-lens" aria-hidden="true"><Pic img={p.peek} sizes={sizes} className="pk-peek" draggable="false" /></span>
          <span className="pk-ring" ref={ring} aria-hidden="true"><span className="pk-lab">{p.peekLabel}</span></span>
          {badge && <span className="pk-badge">{badge}</span>}
          {tag && <span className="pk-tag">{tag}</span>}
        </span>
      </Link>
      <button type="button" className="pk-toggle" aria-pressed={peeking} aria-label={`${p.peekLabel}: ${p.name}`} onClick={() => setPeeking(v => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg>
      </button>
    </div>
  );
}
