'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ShoppingCart from '@/components/storefront/ShoppingCart';
import Card from '@/components/ui/Card';
import type { Photo } from '@/types/database';

function CartContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      fetchPhotos();
      loadCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/gallery/${code}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
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

  const removeFromCart = (photoId: string) => {
    const newCart = cart.filter((id) => id !== photoId);
    localStorage.setItem(`cart_${code}`, JSON.stringify(newCart));
    setCart(newCart);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!code) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          Invalid cart. Please go back to your gallery.
        </div>
      </Card>
    );
  }

  const cartPhotos = photos.filter((p) => cart.includes(p.id));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
      <ShoppingCart
        items={cartPhotos}
        onRemove={removeFromCart}
        accessCode={code}
      />
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}
