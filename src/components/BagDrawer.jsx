import { useEffect, useRef, useState } from 'react';
import { useShop } from '../lib/shop.jsx';
import { Link } from 'react-router-dom';
import { byId, copyText, inr, productPath } from '../lib/data.js';
import Pic from './Pic.jsx';
import { Close } from './Icons.jsx';
import ProductName from './ProductName.jsx';

export default function BagDrawer() {
  const { lines, total, bagOpen, closeBag, changeQty, remove } = useShop();
  const ref = useRef(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const d = ref.current;
    if (bagOpen && !d.open) { setNote(''); d.showModal(); }
    if (!bagOpen && d.open) d.close();
  }, [bagOpen]);

  const copyOrder = async () => {
    const txt = 'Hi Vannam, I would like to order:\n' + lines.map(l => `${l.q} × ${byId[l.id].name} (${inr(byId[l.id].price)})`).join('\n') + `\nSubtotal: ${inr(total)}`;
    setNote((await copyText(txt)) ? 'Copied. Paste it into an Instagram message to us. Nothing has been sent yet.' : 'Couldn’t copy automatically. Please select and copy the items above.');
  };

  return (
    <dialog ref={ref} className="dlg dlg-bag" aria-label="Your bag" onClose={closeBag} onClick={e => { if (e.target === ref.current) closeBag(); }}>
      <div className="bag">
        <div className="bag-top"><h3>Your bag</h3><button type="button" className="dlg-x static" onClick={closeBag} aria-label="Close bag"><Close /></button></div>
        {lines.length ? (
          <>
            <ul className="bag-lines">
              {lines.map(l => {
                const p = byId[l.id];
                return (
                  <li key={l.id}>
                    <div className="bag-img" style={{ '--tint': p.tint }}><Pic img={p.tile} sizes="76px" /></div>
                    <div>
                      <h4><Link to={productPath(p)} onClick={closeBag}><ProductName name={p.name} /></Link></h4>
                      <p>{inr(p.price)}</p>
                      <div className="qty">
                        <button type="button" onClick={() => changeQty(p.id, -1)} aria-label={`Decrease quantity of ${p.name}`}>−</button>
                        <span aria-label="Quantity">{l.q}</span>
                        <button type="button" onClick={() => changeQty(p.id, 1)} aria-label={`Increase quantity of ${p.name}`}>+</button>
                        <button type="button" className="rm" onClick={() => remove(p.id)}>Remove</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="bag-foot">
              <p className="bag-total"><span>Subtotal</span><span>{inr(total)}</span></p>
              <button type="button" className="btn btn-dark" onClick={copyOrder}>Copy order summary</button>
              <p className="bag-note" role="status">{note || 'Online payment isn’t connected yet. Copy your summary and send it to us on Instagram to place the order.'}</p>
            </div>
          </>
        ) : (
          <div className="bag-empty"><p className="serif">Your bag is empty</p><p>Add a pouch and it will wait for you here.</p><button type="button" className="btn btn-ghost-d" onClick={closeBag}>Keep browsing</button></div>
        )}
      </div>
    </dialog>
  );
}
