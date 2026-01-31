'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowDownTrayIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DownloadPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      // Just check if the token is valid by making a HEAD request
      const response = await fetch(`/api/download/${token}`, {
        method: 'HEAD',
      });

      if (response.ok || response.redirected) {
        setStatus('ready');
      } else if (response.status === 410) {
        setStatus('expired');
        setErrorMessage('This download link has expired.');
      } else {
        setStatus('error');
        setErrorMessage('Invalid download link.');
      }
    } catch {
      setStatus('ready'); // Assume ready if HEAD fails but we can try the download
    }
  };

  const handleDownload = () => {
    // Redirect to the download API which will redirect to Cloudinary
    window.location.href = `/api/download/${token}`;
  };

  if (status === 'loading') {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Preparing your download...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'error' || status === 'expired') {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <div className="text-center py-12">
            <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {status === 'expired' ? 'Link Expired' : 'Invalid Link'}
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <p className="text-sm text-gray-500">
              If you need access to your photos, please check your email for
              valid download links or contact support.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <div className="text-center py-8">
          <ArrowDownTrayIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Photo is Ready
          </h1>

          <p className="text-gray-600 mb-6">
            Click the button below to download your high-resolution photo.
          </p>

          <Button onClick={handleDownload} size="lg">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Photo
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            This link will expire 7 days after purchase.
          </p>
        </div>
      </Card>
    </div>
  );
}
