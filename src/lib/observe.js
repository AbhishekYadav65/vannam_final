// One shared IntersectionObserver for every "reveal when scrolled into view" element (Reveal, Split, ScrollWords...).
let io;
const callbacks = new WeakMap();
const get = () => (io ??= new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    callbacks.get(e.target)?.(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }));

export function whenVisible(el, cb) {
  if (!('IntersectionObserver' in window)) { cb(el); return () => {}; }
  callbacks.set(el, cb);
  const o = get(); o.observe(el);
  return () => { o.unobserve(el); callbacks.delete(el); };
}
