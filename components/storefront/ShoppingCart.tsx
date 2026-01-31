'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { Photo } from '@/types/database';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ShoppingCartProps {
  items: Photo[];
  onRemove: (photoId: string) => void;
  accessCode: string;
}

export default function ShoppingCart({
  items,
  onRemove,
  accessCode,
}: ShoppingCartProps) {
  const total = items.reduce((sum, item) => sum + item.price_cents, 0);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link href={`/gallery/${accessCode}`}>
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold mb-4">Your Cart</h2>

        <div className="space-y-4">
          {items.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={photo.thumbnail_url}
                  alt="Cart item"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="font-medium">Digital Photo</p>
                <p className="text-sm text-gray-500">High-resolution download</p>
              </div>

              <p className="font-medium">{formatPrice(photo.price_cents)}</p>

              <button
                onClick={() => onRemove(photo.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(total)}</span>
        </div>

        <Link href={`/checkout?code=${accessCode}`}>
          <Button className="w-full" size="lg">
            Checkout - {formatPrice(total)}
          </Button>
        </Link>

        <Link
          href={`/gallery/${accessCode}`}
          className="block text-center text-sm text-blue-600 hover:underline mt-3"
        >
          Continue Shopping
        </Link>
      </Card>
    </div>
  );
}
