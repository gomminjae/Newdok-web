import Image, { type ImageProps } from 'next/image';
import { imageAssets, type ImageName } from '../assets';

export function AppImage({ name, alt = '', ...props }: { name: ImageName; alt?: string } & Omit<ImageProps, 'src' | 'alt'>) {
  const asset = imageAssets[name];
  return <Image {...(props.fill ? {} : { width: asset.width, height: asset.height })} {...props} src={asset.src} alt={alt} />;
}
