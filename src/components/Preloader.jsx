import { useEffect, useState } from 'react';

// First visit of a session: the wordmark rises, a running stitch is sewn, and the curtain lifts on a ruffled edge.
const WORD = 'vannam'.split('');

export default function Preloader() {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  const [phase, setPhase] = useState(() => (root?.classList.contains('intro') ? 'in' : 'off'));

  useEffect(() => {
    if (phase === 'off') return;
    const t1 = setTimeout(() => setPhase('out'), 1350);
    const t2 = setTimeout(() => { setPhase('off'); try { sessionStorage.setItem('vannam-intro', '1'); } catch { /* private mode */ } root.classList.add('intro-done'); }, 2250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'off') return null;
  return (
    <div className={`pre ${phase}`} aria-hidden="true">
      <div className="pre-in">
        <p className="pre-word">{WORD.map((c, i) => <span key={i} style={{ '--i': i }}><b>{c}</b></span>)}</p>
        <span className="pre-stitch" />
        <p className="pre-line">little things, lovingly made</p>
      </div>
    </div>
  );
}
