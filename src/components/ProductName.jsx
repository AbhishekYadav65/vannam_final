// "Makeup Pouch · Cherry Cream" -> two tidy lines: the kind of pouch, then the variant in italics.
export default function ProductName({ name }) {
  const [kind, ...rest] = name.split(' · ');
  const variant = rest.join(' · ');
  return (
    <span className="pn">
      <span>{kind}</span>
      {variant && <em>{variant}</em>}
    </span>
  );
}
