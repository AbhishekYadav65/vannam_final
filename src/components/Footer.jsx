import { Link } from 'react-router-dom';
import { INSTAGRAM, IG_HANDLE } from '../lib/data.js';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <p className="foot-line">Little things,<br /><em>lovingly made.</em></p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to={{ pathname: '/', hash: '#story' }}>Our story</Link></li>
              <li><Link to={{ pathname: '/', hash: '#little-things' }}>The little things</Link></li>
              <li><Link to={{ pathname: '/', hash: '#reviews' }}>Reviews</Link></li>
              <li><Link to={{ pathname: '/', hash: '#contact' }}>Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Find us</h4>
            <ul>
              <li><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">{IG_HANDLE}</a></li>
              <li>Handcrafted in Coimbatore</li>
            </ul>
          </div>
        </div>
        <p className="foot-mark" aria-hidden="true">vannam</p>
        <div className="foot-base"><span>© {new Date().getFullYear()} Vannam</span><span>Prices in Indian rupees</span></div>
      </div>
    </footer>
  );
}
