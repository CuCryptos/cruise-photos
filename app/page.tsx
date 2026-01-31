'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon, QrCodeIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function HomePage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      router.push(`/gallery/${accessCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Your Cruise Memories
        </h1>
        <p className="text-xl text-blue-100 mb-8">
          View and purchase your professional photos from tonight&apos;s dinner cruise
        </p>

        {/* Access Code Form */}
        <Card className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Access Code
              </label>
              <Input
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-2">
                Your access code is on the card at your table
              </p>
            </div>
            <Button type="submit" className="w-full" size="lg">
              View My Photos
            </Button>
          </form>
        </Card>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCodeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Scan or Enter Code
              </h3>
              <p className="text-gray-600 text-sm">
                Scan the QR code on your table card or enter the access code above
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhotoIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. Browse & Select
              </h3>
              <p className="text-gray-600 text-sm">
                View all the photos from your table and add your favorites to cart
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Purchase & Download
              </h3>
              <p className="text-gray-600 text-sm">
                Pay securely and receive instant download links via email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Simple Pricing
          </h2>
          <p className="text-gray-600 mb-8">
            High-resolution digital downloads you can print, share, and treasure forever
          </p>

          <Card className="max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-600">$14.99</p>
              <p className="text-gray-500">per photo</p>
              <ul className="mt-6 space-y-2 text-left">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  High-resolution digital file
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Professionally edited
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Instant download
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  Print at any size
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Cruise Photos. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Photos are available for 30 days after your cruise.
          </p>
        </div>
      </footer>
    </div>
  );
}
