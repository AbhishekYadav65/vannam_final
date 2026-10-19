import { Link } from 'react-router-dom';
import { inr, productPath } from '../lib/data.js';
import { useShop } from '../lib/shop.jsx';
import PeekTile from './PeekTile.jsx';
import ProductName from './ProductName.jsx';
import Reveal from './Reveal.jsx';

// Five rows (photo, name, kind, price, button) so a grid can line every card up row by row.
export default function ProductCard({ p, reveal = true, sizes = '(max-width: 700px) 46vw, (max-width: 1100px) 31vw, 290px' }) {
  const { add } = useShop();
  const Wrap = reveal ? Reveal : 'article';
  return (
    <Wrap as={reveal ? 'article' : undefined} className="pcard">
      <PeekTile p={p} sizes={sizes} badge={`${p.discountPercent}% off`} />
      <h3><Link to={productPath(p)} viewTransition><ProductName name={p.name} /></Link></h3>
      <p className="kicker">{p.category}</p>
      <p className="price"><span>{inr(p.price)}</span><s aria-label="Original price">{inr(p.mrp)}</s></p>
      <button type="button" className="btn btn-line" onClick={() => add(p.id)}>Add to bag</button>
    </Wrap>
  );
}
