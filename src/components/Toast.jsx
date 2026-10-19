import { useShop } from '../lib/shop.jsx';

export default function Toast() {
  const { toast } = useShop();
  return <div className={`toast${toast ? ' on' : ''}`} role="status" aria-live="polite">{toast}</div>;
}
