'use client';

import Image from 'next/image';
import { useState } from 'react';
import { proxyImage } from '@/shared/lib/image';

export function NewsletterImage({ name, imageUrl, cover = false }: {
  name: string;
  imageUrl: string | null;
  cover?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const src = proxyImage(imageUrl);

  return (
    <span className={`relative flex flex-none items-center justify-center overflow-hidden bg-tint-50 font-bold text-primary ${
      cover ? 'aspect-[16/9] w-full text-xl' : 'h-11 w-11 rounded-lg text-sm'
    }`}>
      {src && failedUrl !== src ? (
        <Image src={src} alt="" fill unoptimized sizes={cover ? '(max-width: 640px) 100vw, 216px' : '44px'}
          className="object-cover" onError={() => setFailedUrl(src)} />
      ) : (
        <span aria-hidden="true" className="truncate px-2">
          {cover ? name : Array.from(name).slice(0, 2).join('')}
        </span>
      )}
    </span>
  );
}
