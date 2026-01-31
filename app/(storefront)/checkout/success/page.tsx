import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams.order;

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <div className="text-center py-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You for Your Purchase!
          </h1>

          <p className="text-gray-600 mb-6">
            Your photos are ready for download. We&apos;ve sent download links to
            your email.
          </p>

          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID:{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {orderId.slice(0, 8)}
              </code>
            </p>
          )}

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Check your email for download links</li>
              <li>• Download links are valid for 7 days</li>
              <li>• Save your photos to your device</li>
            </ul>
          </div>

          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
