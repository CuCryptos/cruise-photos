'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Photo } from '@/types/database';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code') || '';

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

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

  const cartPhotos = photos.filter((p) => cart.includes(p.id));
  const total = cartPhotos.reduce((sum, p) => sum + p.price_cents, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // In production, you would:
      // 1. Use Clover's iframe or SDK to tokenize the card
      // 2. Send the token to your backend
      // For now, we'll simulate the tokenization

      // This is a placeholder - in production, use Clover's JS SDK
      const mockToken = 'clv_token_' + Math.random().toString(36).substr(2, 9);

      const response = await fetch('/api/clover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoIds: cart,
          email,
          sourceToken: mockToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Payment failed');
      }

      const result = await response.json();

      // Clear cart
      localStorage.removeItem(`cart_${code}`);

      // Redirect to success page
      router.push(`/checkout/success?order=${result.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (cartPhotos.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Button onClick={() => router.push(`/gallery/${code}`)}>
            Back to Gallery
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order summary */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4">
            {cartPhotos.map((photo) => (
              <div key={photo.id} className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={photo.thumbnail_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Digital Photo</p>
                  <p className="text-xs text-gray-500">High-resolution download</p>
                </div>
                <p className="font-medium">
                  ${(photo.price_cents / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Payment form */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4111 1111 1111 1111"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={processing}
            >
              Pay ${(total / 100).toFixed(2)}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your payment is secured by Clover. Download links will be sent to
              your email.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
