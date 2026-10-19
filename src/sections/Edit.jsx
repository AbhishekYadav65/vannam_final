import { Link } from 'react-router-dom';
import { byId, inr, productPath } from '../lib/data.js';
import { useShop } from '../lib/shop.jsx';
import PeekTile from '../components/PeekTile.jsx';
import ProductName from '../components/ProductName.jsx';
import Rail from '../components/Rail.jsx';
import Reveal from '../components/Reveal.jsx';
import Split from '../components/Split.jsx';
import { Arrow } from '../components/Icons.jsx';

const PICKS = [{ id: 3, family: 'Hair tool' }, { id: 12, family: 'Makeup' }, { id: 7, family: 'Napkin' }];

export default function Edit() {
  const { add } = useShop();
  return (
    <section className="edit" id="little-things" aria-labelledby="edit-h">
      <div className="wrap">
        <div className="edit-head">
          <div>
            <Reveal as="p" className="eyebrow">The little things edit</Reveal>
            <Split id="edit-h" text={'The pieces we\n*keep close.*'} />
          </div>
          <Reveal as="p" className="lede" d={2}>One from each family of pouch we make: a hair tool pouch, a makeup pouch, a napkin pouch. An editor’s selection, not a sales ranking. Move your cursor over one to look inside.</Reveal>
        </div>

        <Rail label="The little things edit" className="rail-edit">
          {PICKS.map(({ id, family }) => {
            const p = byId[id];
            return (
              <article className="ec" key={id}>
                <PeekTile p={p} tag={family} sizes="(max-width: 720px) 80vw, (max-width: 1100px) 33vw, 380px" className="pk-arch" />
                <div className="ec-info">
                  <div><h3><Link to={productPath(p)} viewTransition><ProductName name={p.name} /></Link></h3><p>{inr(p.price)}</p></div>
                  <button type="button" className="ec-add" onClick={() => add(id)} aria-label={`Add ${p.name} to bag`}>+</button>
                </div>
              </article>
            );
          })}
        </Rail>

        <Reveal className="edit-more">
          <Link className="btn btn-dark" data-magnetic to="/shop" viewTransition>Shop the full collection <Arrow /></Link>
        </Reveal>
      </div>
    </section>
  );
}
