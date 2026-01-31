'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Photo } from '@/types/database';
import Button from '@/components/ui/Button';

interface PhotoGalleryProps {
  photos: Photo[];
  onAddToCart: (photoId: string) => void;
  cartItems: string[];
}

export default function PhotoGallery({
  photos,
  onAddToCart,
  cartItems,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const inCart = cartItems.includes(photo.id);

          return (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <Image
                src={photo.thumbnail_url}
                alt="Cruise photo"
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">
                    {formatPrice(photo.price_cents)}
                  </p>
                </div>
              </div>

              {/* In cart indicator */}
              {inCart && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <ShoppingCartIcon className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/20 rounded-full"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Image */}
            <div className="relative flex-1 min-h-0">
              <Image
                src={selectedPhoto.full_url}
                alt="Cruise photo preview"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />

              {/* Watermark overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/30 text-4xl font-bold rotate-[-30deg]">
                  PREVIEW
                </span>
              </div>
            </div>

            {/* Action bar */}
            <div className="bg-gray-900 p-4 rounded-b-lg flex items-center justify-between">
              <span className="text-white text-lg font-medium">
                {formatPrice(selectedPhoto.price_cents)}
              </span>
              <Button
                onClick={() => {
                  onAddToCart(selectedPhoto.id);
                  setSelectedPhoto(null);
                }}
                disabled={cartItems.includes(selectedPhoto.id)}
              >
                {cartItems.includes(selectedPhoto.id)
                  ? 'In Cart'
                  : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
