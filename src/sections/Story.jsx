import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, byId, inr, pad2, productPath } from '../lib/data.js';
import Pic from '../components/Pic.jsx';
import Reveal from '../components/Reveal.jsx';
import Split from '../components/Split.jsx';
import ScrollWords from '../components/ScrollWords.jsx';
import { Arrow } from '../components/Icons.jsx';

// Six small chapters, each one a real piece from the catalogue. Edit the copy freely.
const CHAPTERS = [
  { id: 12, title: 'Sweetness', line: 'It begins with cream cotton and a scatter of cherries, the kind of sweetness you tuck into your bag just in case the day needs a little.' },
  { id: 1, title: 'A room for every curl', line: 'Four soft little rooms, one for each barrel, so the things you love most never have to rattle around. Some objects deserve a home.' },
  { id: 3, title: 'A secret in red thread', line: 'Tiny embroidered bows on a pale blue stripe. Open the zip and a flash of red waits inside, held close in quilted cotton.' },
  { id: 7, title: 'Small and tender', line: 'A pouch for the quiet, personal moments: five or six napkins, a magnet that clicks shut, and a pattern of little hearts keeping the secret.' },
  { id: 9, title: 'A little bit wild', line: 'For the days you feel bolder than your outfit. Quilted leopard print outside, a black lining within, and room for every everyday essential.' },
  { id: 10, title: 'Spring, folded small', line: 'Lime gingham, lilac flowers and a lilac zip. A little garden to carry everywhere, made by hand in Coimbatore for whoever carries it next.' }
];

export default function Story() {
  const [view, setView] = useState({ active: 0, prev: -1 });
  const { active, prev } = view;
  const items = useRef([]);

  // which chapter is in the middle of the screen? (cheap: IntersectionObserver, no scroll handler)
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { const k = Number(e.target.dataset.i); setView(v => (v.active === k ? v : { active: k, prev: v.active })); } });
    }, { rootMargin: '-42% 0px -42% 0px' });
    items.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const made = PRODUCTS.filter(p => /Coimbatore/.test(p.details?.made || '')).length;
  const madeLine = made === PRODUCTS.length ? `All ${made} of our pieces are handcrafted in Coimbatore.` : `${made} of our ${PRODUCTS.length} pieces are handcrafted in Coimbatore.`;

  return (
    <section className="story" id="story" aria-labelledby="story-h">
      <div className="wrap story-intro">
        <Reveal as="p" className="eyebrow">Our story</Reveal>
        <Split id="story-h" text={'Stitched slowly,\n*carried lovingly.*'} />
        <Reveal as="span" className="runstitch" d={2} aria-hidden="true" />
        <div className="si-body">
          <ScrollWords className="si-lede" text="In Coimbatore, every Vannam piece begins the way a good story does: quietly, with something soft to hold and someone who cares how it ends." />
          <Reveal className="si-note" d={3}>
            <p>We make the small things you reach for every day, the pouch for your curls, your lipstick, your napkins, as if each one were a gift for someone we love. Because, in the end, it is.</p>
            <p className="made">{madeLine}</p>
            <p><Link className="link" to="/shop" viewTransition>Meet the whole collection <Arrow /></Link></p>
          </Reveal>
        </div>
      </div>

      <div className="wrap story-body">
        <div className="sc-media" aria-hidden="true">
          <div className="sc-frame" style={{ '--tint': byId[CHAPTERS[active].id].tint }}>
            {CHAPTERS.map((c, i) => (
              <Pic key={c.id} img={byId[c.id].tile} sizes="(max-width: 900px) 0px, 520px" className={i === active ? 'on' : i === prev ? 'was' : ''} />
            ))}
          </div>
          <div className="sc-dots">{CHAPTERS.map((c, i) => <i key={c.id} className={i === active ? 'on' : ''} />)}</div>
        </div>

        <ol className="sc-list">
          {CHAPTERS.map((c, i) => {
            const p = byId[c.id];
            return (
              <li key={c.id} data-i={i} ref={el => (items.current[i] = el)} className={i === active ? 'on' : ''}>
                <div className="sc-m" style={{ '--tint': p.tint }}><Pic img={p.tile} sizes="(max-width: 900px) 86vw, 0px" /></div>
                <span className="sc-big" aria-hidden="true">{pad2(i + 1)}</span>
                <h3>{c.title}</h3>
                <p className="sc-line">{c.line}</p>
                <p className="sc-meta">{p.name} · {inr(p.price)}</p>
                <Link className="link" to={productPath(p)} viewTransition>Meet this piece <Arrow /></Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
