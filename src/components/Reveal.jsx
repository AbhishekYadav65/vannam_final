import { useEffect, useRef } from 'react';
import { whenVisible } from '../lib/observe.js';

export default function Reveal({ as: Tag = 'div', d = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => whenVisible(ref.current, el => el.classList.add('in')), []);
  return <Tag ref={ref} className={`rv ${className}`.trim()} style={{ '--d': d }} {...rest}>{children}</Tag>;
}
