import { Children, useEffect, useRef, useState } from 'react';
import { pad2 } from '../lib/data.js';

// Horizontal rail where every step lands exactly one card further on, so each slide sits in the same place.
//  - card widths come from the rail width (CSS), so the last position lines up like every other one
//  - arrows stay in one fixed spot on the rail edges; mouse drag, touch swipe and arrow keys all move exactly one card
//  - optional slow auto-advance (paused on hover, focus and interaction)
export default function Rail({ label, children, autoplay = 0, counter = false, className = '' }) {
  const track = useRef(null), api = useRef({});
  const count = Children.count(children);
  const [ui, setUi] = useState({ i: 0, p: 0, start: true, end: true, scrolls: false });

  useEffect(() => {
    const t = track.current, cards = [...t.children];
    if (!cards.length) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : t.clientWidth);
    const max = () => Math.max(0, t.scrollWidth - t.clientWidth);
    const idx = () => Math.min(cards.length - 1, Math.round(t.scrollLeft / step()));
    const go = i => t.scrollTo({ left: Math.max(0, Math.min(max(), i * step())), behavior: reduce.matches ? 'auto' : 'smooth' });

    let queued = false, holdUntil = 0, visible = false, hover = false, down = false, moved = false, sx = 0, sl = 0;
    const pause = ms => { holdUntil = Date.now() + ms; };
    api.current = { go, idx, pause };

    const paint = () => {
      queued = false;
      const m = max(), end = m > 0 && t.scrollLeft >= m - 4;
      const next = { i: end ? cards.length - 1 : idx(), p: m > 0 ? Math.round((t.scrollLeft / m) * 1000) / 1000 : 1, start: t.scrollLeft < 4, end: m < 4 || end, scrolls: m >= 4 };
      setUi(prev => (prev.i === next.i && prev.p === next.p && prev.start === next.start && prev.end === next.end && prev.scrolls === next.scrolls ? prev : next));
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
    t.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll); ro.observe(t);
    paint();

    const onKey = e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); pause(9000); go(idx() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); pause(9000); go(idx() - 1); }
    };
    t.addEventListener('keydown', onKey);

    // mouse drag (touch and trackpads scroll natively); letting go snaps to the nearest card
    const onDown = e => { if (e.pointerType !== 'mouse' || e.button) return; down = true; moved = false; sx = e.clientX; sl = t.scrollLeft; pause(9000); };
    const onMove = e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; t.classList.add('drag'); } if (moved) t.scrollLeft = sl - dx; };
    const onUp = () => { if (!down) return; down = false; if (moved) { t.classList.remove('drag'); go(idx()); } };
    const stopClick = e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    t.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp);
    t.addEventListener('click', stopClick, true);

    const enter = () => { hover = true; }, leave = () => { hover = false; }, hold = () => pause(12000), touch = () => pause(9000);
    t.addEventListener('pointerenter', enter); t.addEventListener('pointerleave', leave);
    t.addEventListener('focusin', hold); t.addEventListener('touchstart', touch, { passive: true });
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.35 });
    io.observe(t);
    const timer = autoplay ? setInterval(() => {
      if (!visible || hover || reduce.matches || document.hidden || Date.now() < holdUntil || max() < 4) return;
      idx() >= cards.length - 1 || t.scrollLeft >= max() - 4 ? go(0) : go(idx() + 1);
    }, autoplay) : 0;

    return () => {
      clearInterval(timer); io.disconnect(); ro.disconnect();
      t.removeEventListener('scroll', onScroll); t.removeEventListener('keydown', onKey);
      t.removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp);
      t.removeEventListener('click', stopClick, true);
      t.removeEventListener('pointerenter', enter); t.removeEventListener('pointerleave', leave);
      t.removeEventListener('focusin', hold); t.removeEventListener('touchstart', touch);
    };
  }, [count, autoplay]);

  const nudge = d => { api.current.pause(9000); api.current.go(api.current.idx() + d); };
  const arrow = dir => (
    <button type="button" className={`rail-btn ${dir < 0 ? 'prev' : 'next'}`} onClick={() => nudge(dir)} disabled={dir < 0 ? ui.start : ui.end} aria-label={dir < 0 ? 'Previous' : 'Next'} tabIndex={ui.scrolls ? 0 : -1}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={dir < 0 ? 'M20 12H4M10 6l-6 6 6 6' : 'M4 12h16M14 6l6 6-6 6'} /></svg>
    </button>
  );

  return (
    <div className={`rail ${ui.scrolls ? 'scrolls' : ''} ${className}`.trim()}>
      <div className="rail-track" ref={track} data-cursor="Drag" tabIndex={ui.scrolls ? 0 : -1} role="region" aria-roledescription="carousel" aria-label={`${label}. Use the arrow keys to move.`}>
        {children}
      </div>
      {arrow(-1)}{arrow(1)}
      {counter && ui.scrolls && (
        <div className="rail-foot" aria-hidden="true">
          <span className="rail-count">{pad2(ui.i + 1)} / {pad2(count)}</span>
          <span className="rail-prog"><i style={{ transform: `scaleX(${ui.p})` }} /></span>
        </div>
      )}
    </div>
  );
}
