import { useEffect, useRef } from 'react';

// Paragraph whose words light up one by one as it scrolls through the screen.
export default function ScrollWords({ as: Tag = 'p', text, className = '' }) {
  const ref = useRef(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.style.setProperty('--p', 1); return; }
    let on = false, queued = false;
    const frame = () => {
      queued = false;
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.5 + r.height * 0.6)));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; addEventListener('scroll', onScroll, { passive: true }); frame(); }
      if (!e.isIntersecting && on) { on = false; removeEventListener('scroll', onScroll); }
    }, { rootMargin: '10% 0px 10% 0px' });
    io.observe(el);
    return () => { io.disconnect(); removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <Tag ref={ref} className={`sw ${className}`.trim()} style={{ '--n': words.length, '--p': 0 }} aria-label={text}>
      {words.map((w, i) => <span key={i} className="sw-w" style={{ '--i': i }} aria-hidden="true">{w}{' '}</span>)}
    </Tag>
  );
}
