import { useCallback, useEffect, useRef, useState } from 'react';
import Pic from './Pic.jsx';
import { asset } from '../lib/data.js';

const INTERVAL = 6000;   // slow on purpose: each photo stays for six seconds, then glides to the next

// Product photos that slide on their own, slowly. Pauses while you look (hover, focus, drag), when the tab or the photo is
// out of view, and for a few seconds after you move it yourself. Swipe or drag, arrows and thumbnails all land on exact slides.
export default function Gallery({ images, tint, vtName }) {
  const n = images.length;
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const [drag, setDrag] = useState(0);
  const [hold, setHold] = useState(false);
  const [flags, setFlags] = useState({ hover: false, focus: false, visible: true, hidden: false, dragging: false });
  const stage = useRef(null), holdTimer = useRef(0), g = useRef({ x: 0, t: 0, id: null });
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const set = patch => setFlags(f => ({ ...f, ...patch }));

  const auto = !reduce && n > 1 && !hold && !flags.hover && !flags.focus && !flags.dragging && flags.visible && !flags.hidden;
  useEffect(() => { if (auto) setRun(r => r + 1); }, [auto]);
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setI(x => (x + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [auto, i, run, n]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => set({ visible: e.isIntersecting }), { threshold: 0.3 });
    io.observe(stage.current);
    const vis = () => set({ hidden: document.hidden });
    document.addEventListener('visibilitychange', vis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', vis); clearTimeout(holdTimer.current); };
  }, []);

  const goto = useCallback(k => {
    setI(((k % n) + n) % n); setHold(true);
    clearTimeout(holdTimer.current); holdTimer.current = setTimeout(() => setHold(false), 7000);
  }, [n]);

  const down = e => { if (e.target.closest('button')) return; g.current = { x: e.clientX, t: Date.now(), id: e.pointerId }; stage.current.setPointerCapture?.(e.pointerId); set({ dragging: true }); };
  const move = e => { if (g.current.id !== e.pointerId) return; setDrag(e.clientX - g.current.x); };
  const up = e => {
    if (g.current.id !== e.pointerId) return;
    const dx = e.clientX - g.current.x, w = stage.current.clientWidth, fast = Math.abs(dx) / Math.max(1, Date.now() - g.current.t) > 0.45;
    g.current.id = null; setDrag(0); set({ dragging: false });
    if (Math.abs(dx) > w * 0.16 || (fast && Math.abs(dx) > 24)) goto(i + (dx < 0 ? 1 : -1));
  };
  const key = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goto(i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goto(i - 1); }
  };

  return (
    <div className={`gal${auto ? '' : ' paused'}`} style={{ '--tint': tint, '--iv': `${INTERVAL}ms` }} onPointerEnter={e => e.pointerType === 'mouse' && set({ hover: true })} onPointerLeave={() => set({ hover: false })}
      onFocus={() => set({ focus: true })} onBlur={() => set({ focus: false })}>
      <div className="gal-stage" ref={stage} data-cursor="Drag" style={vtName ? { viewTransitionName: vtName } : undefined} role="region" aria-roledescription="carousel" aria-label="Product photos" tabIndex={0}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
        <div className={`gal-track${flags.dragging ? ' dragging' : ''}`} style={{ transform: `translate3d(calc(${-i * 100}% + ${drag}px), 0, 0)` }}>
          {images.map((m, k) => (
            <div className={`gal-slide fit-${m.fit}${k === i ? ' on' : ''}`} key={m.md} aria-hidden={k !== i} aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
              <Pic img={m} sizes="(max-width: 900px) 94vw, 620px" eager={k < 2} draggable="false" />
            </div>
          ))}
        </div>
        <span className="gal-count" aria-hidden="true">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        {n > 1 && (
          <>
            <button type="button" className="rail-btn prev" onClick={() => goto(i - 1)} aria-label="Previous photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6" /></svg></button>
            <button type="button" className="rail-btn next" onClick={() => goto(i + 1)} aria-label="Next photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6" /></svg></button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="gal-thumbs">
          {images.map((m, k) => (
            <button key={m.md} type="button" className={k === i ? 'on' : ''} onClick={() => goto(k)} aria-label={`Photo ${k + 1}`} aria-current={k === i}>
              <img src={asset(m.sm)} alt="" width="72" height="72" loading="lazy" decoding="async" />
              {k === i && <i className="gal-prog" key={`${i}-${run}`} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
