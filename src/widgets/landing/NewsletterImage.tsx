'use client';

import Image from 'next/image';
import { useState } from 'react';
import { proxyImage } from '@/shared/lib/image';

const explorerImageStyles = {
  thumbnail: { className: 'h-14 w-14 rounded-[10px] border border-line-neutral', sizes: '56px' },
  article: { className: 'h-14 w-14 rounded-[12px] border border-[#808080]/30', sizes: '56px' },
  bookmark: { className: 'h-5 w-5 rounded-full border border-line-neutral', sizes: '20px' },
  recommendation: { className: 'h-[210px] w-full rounded-[12px]', sizes: '(max-width: 368px) calc(100vw - 48px), 320px' },
} as const;

export function NewsletterImage({ imageUrl, cover = false, fit = 'cover', variant }: {
  name: string;
  imageUrl: string | null;
  cover?: boolean;
  fit?: 'cover' | 'contain';
  variant?: keyof typeof explorerImageStyles;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const src = proxyImage(imageUrl);
  const imageStyle = variant ? explorerImageStyles[variant] : {
    className: cover ? 'aspect-[16/9] w-full' : 'h-11 w-11 rounded-lg',
    sizes: cover ? '(max-width: 640px) 100vw, 216px' : '44px',
  };

  return (
    <span className={`relative flex flex-none items-center justify-center overflow-hidden ${src && failedUrl !== src ? 'bg-bg' : 'bg-[#808080]/20'} ${imageStyle.className}`}>
      {src && failedUrl !== src ? (
        <Image src={src} alt="" fill unoptimized sizes={imageStyle.sizes}
          className={fit === 'contain' ? 'object-contain' : 'object-cover'} onError={() => setFailedUrl(src)} />
      ) : null}
    </span>
  );
}
