'use client';

import Image from 'next/image';
import { useState } from 'react';
import { canOptimizeNewsletterImage, proxyImage } from '@/shared/lib/image';
import { AppImage, MediaFrame } from '@/shared/ui';

const explorerImageStyles = {
  thumbnail: { sizes: '56px' },
  article: { sizes: '56px' },
  bookmark: { sizes: '20px' },
  recommendation: { sizes: '(max-width: 368px) calc(100vw - 48px), 320px' },
} as const;

export function NewsletterImage({ imageUrl, cover = false, fit = 'cover', variant, priority = false }: {
  name: string;
  imageUrl: string | null;
  cover?: boolean;
  fit?: 'cover' | 'contain';
  variant?: keyof typeof explorerImageStyles;
  priority?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const src = proxyImage(imageUrl?.trim());
  const imageStyle = variant ? explorerImageStyles[variant] : {
    sizes: cover ? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 576px' : '44px',
  };
  const optimized = !!src && canOptimizeNewsletterImage(src) && originalUrl !== src;

  return (
    <MediaFrame variant={variant ?? (cover ? 'cover' : 'default')} empty={!src || failedUrl === src}>
      {src && failedUrl !== src ? (
        <Image src={src} alt="" fill preload={priority} unoptimized={!optimized} sizes={imageStyle.sizes}
          className={fit === 'contain' ? 'object-contain' : 'object-cover'} onError={() => optimized ? setOriginalUrl(src) : setFailedUrl(src)} />
      ) : (
        <AppImage name="emptyCase" alt="" fill preload={priority} sizes={imageStyle.sizes} className="object-cover" />
      )}
    </MediaFrame>
  );
}
