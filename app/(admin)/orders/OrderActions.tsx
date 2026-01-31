'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface OrderActionsProps {
  orderId: string;
}

export default function OrderActions({
  orderId,
}: OrderActionsProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const resendDownloadLinks = async () => {
    setSending(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/resend`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to resend');

      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error('Error resending links:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={resendDownloadLinks}
        loading={sending}
        disabled={sent}
      >
        {sent ? 'Sent!' : 'Resend Downloads'}
      </Button>
    </div>
  );
}
