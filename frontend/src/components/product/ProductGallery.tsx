'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ImageRef } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: ImageRef[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });

  const list = images.length > 0 ? images : [{ url: '', alt: name }];
  const current = list[active];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-3 md:flex-col">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative h-20 w-16 overflow-hidden rounded-lg border-2 transition md:h-24 md:w-20',
                i === active ? 'border-gold' : 'border-transparent hover:border-champagne'
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image with hover zoom */}
      <div
        className="relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl bg-cream"
        onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
        onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setZoom({ on: true, x, y });
        }}
      >
        {current.url && (
          <Image
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-200"
            style={
              zoom.on
                ? { transform: 'scale(1.6)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
