import { useEffect, useRef } from 'react';
import { Spark } from '../components/Icons.jsx';

const WORDS = ['Handmade in Coimbatore', 'Little things, lovingly made', 'Quilted soft', 'Made to be carried', 'Soft colours, bold hearts'];

// The band drifts on its own and speeds up (or turns round) with how you scroll.
export default function Marquee() {
  const wrap = useRef(null), track = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = track.current;
    let x = 0, dir = -1, boost = 0, last = scrollY, raf = 0, visible = false;
    const frame = () => {
      raf = 0;
      const half = t.scrollWidth / 2;
      x += dir * (0.55 + boost);
      boost *= 0.92;
      if (x <= -half) x += half; if (x > 0) x -= half;
      t.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      if (visible) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      const dy = scrollY - last; last = scrollY;
      if (Math.abs(dy) > 1) { dir = dy > 0 ? -1 : 1; boost = Math.min(9, boost + Math.abs(dy) * 0.08); }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(wrap.current);
    addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); cancelAnimationFrame(raf); removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div className="marquee" ref={wrap} aria-hidden="true">
      <div className="mq-track" ref={track}>
        {[0, 1].map(k => <ul key={k}>{WORDS.map(w => <li key={w}>{w}<Spark /></li>)}</ul>)}
      </div>
    </div>
  );
}
