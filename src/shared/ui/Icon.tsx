/** Uses the original icon shape with the surrounding text's semantic color. */
export function Icon({ src, size = 24 }: { src: string; size?: number }) {
  return <span aria-hidden="true" className="inline-block shrink-0 bg-current" style={{ width: size, height: size, mask: `url('${src}') center / contain no-repeat` }} />;
}
