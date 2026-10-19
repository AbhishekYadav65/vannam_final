import raw from '../data/products.json';

export const PRODUCTS = raw.products;
export const INSTAGRAM = raw.instagram;
export const IG_HANDLE = '@' + INSTAGRAM.split('/').filter(Boolean).pop();
export const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
export const CATS = [...new Set(PRODUCTS.map(p => p.category))];
export const inr = n => '₹' + n.toLocaleString('en-IN');
export const asset = path => import.meta.env.BASE_URL + path;
export const pad2 = n => String(n).padStart(2, '0');

export async function copyText(s) {
  try { await navigator.clipboard.writeText(s); return true; }
  catch {
    try {
      const a = document.createElement('textarea');
      a.value = s; document.body.appendChild(a); a.select();
      const ok = document.execCommand('copy'); a.remove(); return ok;
    } catch { return false; }
  }
}

export const bySlug = Object.fromEntries(PRODUCTS.map(p => [p.slug, p]));
export const productPath = p => `/product/${p.slug}`;

// Similar pieces: same kind of pouch first, then shared tags and a close price.
export function similarTo(p, n = 8) {
  const score = q => (q.category === p.category ? 100 : 0) + q.tags.filter(t => p.tags.includes(t)).length * 5 - Math.abs(q.price - p.price) / 100;
  return PRODUCTS.filter(q => q.id !== p.id).sort((a, b) => score(b) - score(a)).slice(0, n);
}
