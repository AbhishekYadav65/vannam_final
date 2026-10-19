import { useEffect, useRef } from 'react';

// A zipper down the right edge that closes as you read. One transform per frame, only on screens with room for it.
export default function ZipProgress() {
  const ref = useRef(null);
  useEffect(() => {
    if (!matchMedia('(min-width: 1100px) and (hover: hover)').matches) return;
    const el = ref.current; let queued = false;
    const frame = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      el.style.setProperty('--p', (max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0).toFixed(4));
    };
    const on = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); frame();
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);
  return (
    <div className="zip" ref={ref} aria-hidden="true">
      <i className="zip-teeth" /><i className="zip-done" />
      <span className="zip-pull"><b /></span>
    </div>
  );
}
