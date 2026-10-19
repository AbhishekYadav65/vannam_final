import { asset } from '../lib/data.js';

// Responsive product image: two WebP sizes, lazy by default, width/height set so the layout never jumps.
export default function Pic({ img, sizes, alt, eager = false, ...rest }) {
  const [small, big] = img.ws || [480, 800];
  return (
    <img
      src={asset(img.md)}
      srcSet={`${asset(img.sm)} ${small}w, ${asset(img.md)} ${big}w`}
      sizes={sizes}
      width={img.w}
      height={img.h}
      alt={alt ?? img.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      {...rest}
    />
  );
}
