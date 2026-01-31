const CLOVER_BASE_URL =
  process.env.CLOVER_ENVIRONMENT === 'production'
    ? 'https://api.clover.com'
    : 'https://sandbox.dev.clover.com';

const CLOVER_ECOMMERCE_URL =
  process.env.CLOVER_ENVIRONMENT === 'production'
    ? 'https://scl.clover.com'
    : 'https://scl-sandbox.dev.clover.com';

interface CloverOrderItem {
  name: string;
  price: number; // in cents
  quantity: number;
}

interface CloverOrder {
  id: string;
  total: number;
  state: string;
}

interface ChargeResult {
  id: string;
  amount: number;
  status: string;
  source?: {
    last4: string;
    brand: string;
  };
}

// Create an order in Clover
export async function createOrder(
  items: CloverOrderItem[],
  customerEmail: string
): Promise<CloverOrder> {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const apiKey = process.env.CLOVER_API_KEY;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const response = await fetch(
    `${CLOVER_BASE_URL}/v3/merchants/${merchantId}/orders`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: 'open',
        total,
        note: `Online order - ${customerEmail}`,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Clover order: ${error}`);
  }

  const order = await response.json();

  // Add line items
  for (const item of items) {
    await fetch(
      `${CLOVER_BASE_URL}/v3/merchants/${merchantId}/orders/${order.id}/line_items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }),
      }
    );
  }

  return order;
}

// Process payment using Clover Ecommerce API
export async function processPayment(
  sourceToken: string,
  amount: number, // in cents
  orderId: string,
  customerEmail: string
): Promise<ChargeResult> {
  const privateKey = process.env.CLOVER_ECOMMERCE_PRIVATE_KEY;

  const response = await fetch(`${CLOVER_ECOMMERCE_URL}/v1/charges`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'usd',
      source: sourceToken,
      capture: true,
      receipt_email: customerEmail,
      metadata: {
        orderId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Payment failed: ${error.message || 'Unknown error'}`);
  }

  return response.json();
}

// Get Clover public key for tokenization
export function getCloverPublicKey(): string {
  return process.env.CLOVER_ECOMMERCE_PUBLIC_KEY || '';
}

// Verify webhook signature (for payment webhooks)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  // TODO: Implement webhook signature verification
  // This depends on Clover's webhook signing method
  // For now, returning true - implement proper verification in production
  return true;
}

// Get order status
export async function getOrderStatus(orderId: string): Promise<CloverOrder> {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const apiKey = process.env.CLOVER_API_KEY;

  const response = await fetch(
    `${CLOVER_BASE_URL}/v3/merchants/${merchantId}/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get order status');
  }

  return response.json();
}
