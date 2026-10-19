import Reveal from '../components/Reveal.jsx';
import Split from '../components/Split.jsx';
import Rail from '../components/Rail.jsx';

/* SAMPLE COPY: these six reviews are placeholder text written for the template.
   Replace them with real customer reviews before the site goes live. */
const REVIEWS = [
  { name: 'Ananya R.', city: 'Chennai', rating: 5, product: 'Airwrap Pouch · Pink Gingham Ruffle', text: 'Four little compartments, and every barrel finally has its own place. It is quilted so softly that I stopped worrying about my curls in the suitcase. And that ruffle. I get asked about it on every trip.' },
  { name: 'Meera S.', city: 'Bengaluru', rating: 5, product: 'Makeup Pouch · Cherry Cream', text: 'I bought it for the cherries and stayed for the red lining. It opens wide, holds everything I own, and somehow still looks like a gift.' },
  { name: 'Divya K.', city: 'Hyderabad', rating: 5, product: 'Napkin Pouch · Pink Hearts', text: 'Such a tiny thing to feel so thoughtful. It closes with a satisfying magnet click, and the heart print makes a hard week a little softer.' },
  { name: 'Priya N.', city: 'Coimbatore', rating: 5, product: 'Airwrap Pouch · Blue Stripe & Bows', text: 'The tiny red bows are even cuter in person. The stitching is neat, the zip glides, and my styler sits snug in its own little room.' },
  { name: 'Sneha M.', city: 'Mumbai', rating: 5, product: 'Makeup Pouch · Cheetah', text: 'My bag is mostly black, and this is the one thing in it with a personality. Quilted, sturdy, and the black lining keeps it looking clean.' },
  { name: 'Kavya T.', city: 'Pune', rating: 5, product: 'Makeup Pouch · Meadow Gingham', text: 'Lime gingham, lilac flowers, a lilac zip. It looks like spring folded up small. I gifted one to my sister and she has already asked for a second.' }
];
const CARD_TONES = ['ink', 'blush', 'ink', 'butter', 'ink', 'mint'];

const Star = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z" /></svg>);

export default function Reviews() {
  return (
    <section className="reviews" id="reviews" aria-labelledby="rv-h">
      <div className="wrap rv-head">
        <div>
          <Reveal as="p" className="eyebrow">Customer reviews</Reveal>
          <Split id="rv-h" text="In *their* words." />
        </div>
      </div>
      <div className="wrap">
        <Rail label="Customer reviews" autoplay={5200} counter className="rail-reviews">
          {REVIEWS.map((v, i) => (
            <article key={v.name} className={`rc tone-${CARD_TONES[i % CARD_TONES.length]}`} aria-roledescription="slide" aria-label={`Review ${i + 1} of ${REVIEWS.length}`}>
              <div className="stars" role="img" aria-label={`${v.rating} out of 5 stars`}>{Array.from({ length: v.rating }, (_, k) => <Star key={k} />)}</div>
              <blockquote>{v.text}</blockquote>
              <div className="who"><b>{v.name}</b><span>{v.city}</span><em>{v.product}</em></div>
            </article>
          ))}
        </Rail>
      </div>
    </section>
  );
}
