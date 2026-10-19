import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { byId } from './data.js';

const Ctx = createContext(null);
export const useShop = () => useContext(Ctx);

function load() {
  try { return JSON.parse(localStorage.getItem('vannam-bag') || '[]').filter(l => byId[l.id]); }
  catch { return []; }
}
function reducer(lines, a) {
  switch (a.type) {
    case 'add': return lines.some(l => l.id === a.id) ? lines.map(l => (l.id === a.id ? { ...l, q: l.q + a.n } : l)) : [...lines, { id: a.id, q: a.n }];
    case 'qty': return lines.map(l => (l.id === a.id ? { ...l, q: l.q + a.d } : l)).filter(l => l.q > 0);
    case 'remove': return lines.filter(l => l.id !== a.id);
    default: return lines;
  }
}

export function ShopProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  const [bagOpen, setBagOpen] = useState(false);
  const [toast, setToast] = useState('');
  const timer = useRef(0);

  useEffect(() => { try { localStorage.setItem('vannam-bag', JSON.stringify(lines)); } catch { /* storage unavailable */ } }, [lines]);

  const say = useCallback(m => {
    setToast(m); clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  }, []);
  const add = useCallback((id, n = 1) => { dispatch({ type: 'add', id, n }); say(n > 1 ? `Added ${n} to your bag` : 'Added to your bag'); }, [say]);

  const value = useMemo(() => ({
    lines,
    count: lines.reduce((n, l) => n + l.q, 0),
    total: lines.reduce((n, l) => n + l.q * byId[l.id].price, 0),
    add,
    changeQty: (id, d) => dispatch({ type: 'qty', id, d }),
    remove: id => dispatch({ type: 'remove', id }),
    bagOpen, openBag: () => setBagOpen(true), closeBag: () => setBagOpen(false),
    toast, say
  }), [lines, add, bagOpen, toast, say]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
