// A row of ruffle bumps in the next section's colour, laid over the bottom of the previous one.
export default function Scallop({ to }) {
  return <div className="scallop" style={{ '--c': `var(--${to})` }} aria-hidden="true" />;
}
