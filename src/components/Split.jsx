import { useEffect, useRef } from 'react';
import { whenVisible } from '../lib/observe.js';

// Headline that rises word by word out of a mask.
//   text:    "The pieces we *keep close.*"  (*...* = italic accent, \n = line break)
//   squiggle: a word that gets a hand-drawn underline
//   auto:    play on mount (hero) instead of when scrolled into view
export default function Split({ as: Tag = 'h2', text, className = '', d = 0, squiggle = '', auto = false, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (auto) {
      const c = document.documentElement.classList;
      const wait = c.contains('intro') && !c.contains('intro-done') ? 1500 : 120;
      const t = setTimeout(() => el.classList.add('in'), wait);
      return () => clearTimeout(t);
    }
    return whenVisible(el, e => e.classList.add('in'));
  }, [auto]);

  let k = 0;
  const lines = text.split('\n').map(line => {
    const out = []; let em = false;
    line.split(/(\*)/).forEach(part => {
      if (part === '*') { em = !em; return; }
      part.split(' ').filter(Boolean).forEach(w => out.push({ w, em }));
    });
    return out;
  });
  const plain = text.replace(/\*/g, '').replace(/\n/g, ' ');

  return (
    <Tag ref={ref} className={`split ${className}`.trim()} style={{ '--d': d }} aria-label={plain} {...rest}>
      {lines.map((words, li) => (
        <span className="ln" key={li} aria-hidden="true">
          {words.map(({ w, em }, wi) => (
            <span key={wi}>
              <span className={`w${em ? ' em' : ''}`}>
                <span className="m"><span className="t" style={{ '--i': k++ }}>{w}</span></span>
                {squiggle && w.replace(/[^\w]/g, '') === squiggle && (
                  <svg className="sq" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 9C24 2 42 13 64 7s40-6 60 1 44 5 73-3" /></svg>
                )}
              </span>{' '}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
