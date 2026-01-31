'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PhotoGallery from '@/components/storefront/PhotoGallery';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Photo, Session, Table } from '@/types/database';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface GalleryData {
  table: Pick<Table, 'id' | 'table_number' | 'access_code'>;
  session: Pick<Session, 'id' | 'name' | 'cruise_date'>;
  photos: Photo[];
}

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [data, setData] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    fetchGallery();
    loadCart();
  }, [code]);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/gallery/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Invalid access code. Please check and try again.');
        } else {
          setError('Failed to load gallery');
        }
        return;
      }
      const galleryData = await response.json();
      setData(galleryData);
    } catch {
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem(`cart_${code}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: string[]) => {
    localStorage.setItem(`cart_${code}`, JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (photoId: string) => {
    if (!cart.includes(photoId)) {
      saveCart([...cart, photoId]);
    }
  };

  const cartTotal = data
    ? data.photos
        .filter((p) => cart.includes(p.id))
        .reduce((sum, p) => sum + p.price_cents, 0)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.session.name}</h1>
          <p className="text-gray-500">
            {data.table.table_number} •{' '}
            {new Date(data.session.cruise_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Cart button */}
        {cart.length > 0 && (
          <Button onClick={() => router.push(`/cart?code=${code}`)}>
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            Cart ({cart.length}) - ${(cartTotal / 100).toFixed(2)}
          </Button>
        )}
      </div>

      {/* Photos */}
      {data.photos.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            No photos available yet. Check back soon!
          </div>
        </Card>
      ) : (
        <>
          <p className="text-gray-600">
            {data.photos.length} photos available • $14.99 per digital download
          </p>
          <PhotoGallery
            photos={data.photos}
            onAddToCart={addToCart}
            cartItems={cart}
          />
        </>
      )}

      {/* Floating cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96">
          <Card className="shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{cart.length} photos selected</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(cartTotal / 100).toFixed(2)}
                </p>
              </div>
              <Button onClick={() => router.push(`/cart?code=${code}`)}>
                View Cart
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
