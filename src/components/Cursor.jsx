import { useEffect, useRef } from 'react';

// Soft cursor ring with a label, plus magnetic buttons. Only for real mice, never for touch or reduced motion.
// [data-cursor="Label"] grows the ring and shows the label; [data-cursor="none"] hides it (the peek lens is the cursor there);
// [data-magnetic] elements lean toward the pointer.
export default function Cursor() {
  const ring = useRef(null), text = useRef(null);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ring.current, tx = text.current, root = document.documentElement;
    root.classList.add('has-cursor');
    let x = -100, y = -100, cx = x, cy = y, raf = 0, mode = '', label = '', mag = null;

    const loop = () => {
      raf = 0;
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(x - cx) + Math.abs(y - cy) > 0.3) raf = requestAnimationFrame(loop);
    };
    const setMode = (m, l = '') => {
      if (m !== mode) { el.dataset.mode = m; mode = m; }
      if (l !== label) { tx.textContent = l; label = l; }
    };
    const release = () => { if (mag) { mag.style.setProperty('--mx', '0px'); mag.style.setProperty('--my', '0px'); mag = null; } };

    const onMove = e => {
      x = e.clientX; y = e.clientY;
      el.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
      const t = e.target.closest?.('[data-cursor], a, button, input, select, textarea, label, [role="button"]');
      if (!t) setMode('');
      else if (t.dataset.cursor === 'none' || t.dataset.cursor === 'native') setMode('hide');
      else if (t.dataset.cursor) setMode('label', t.dataset.cursor);
      else setMode('link');
      const m = e.target.closest?.('[data-magnetic]');
      if (m !== mag) release();
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.setProperty('--mx', ((e.clientX - (r.left + r.width / 2)) * 0.22).toFixed(1) + 'px');
        m.style.setProperty('--my', ((e.clientY - (r.top + r.height / 2)) * 0.32).toFixed(1) + 'px');
        mag = m;
      }
    };
    const onDown = () => el.classList.add('down'), onUp = () => el.classList.remove('down');
    const onLeave = () => { el.classList.remove('on'); release(); };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown); addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf); root.classList.remove('has-cursor');
      removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave); release();
    };
  }, []);

  return <div className="cur" ref={ring} aria-hidden="true"><span className="cur-t" ref={text} /></div>;
}
