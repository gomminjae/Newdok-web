import { iconAssets, type IconName } from '../assets';

/** Uses the original icon shape with the surrounding text's semantic color. */
export function Icon({ src, name, size = 24 }: { size?: number } & ({ name: IconName; src?: never } | { src: string; name?: never })) {
  const source = name ? iconAssets[name] : src;
  return <span aria-hidden="true" className="inline-block shrink-0 bg-current" style={{ width: size, height: size, mask: `url('${source}') center / contain no-repeat` }} />;
}
