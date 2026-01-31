import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';
import { sendDownloadRecoveryEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  // Get order with items
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        photo_id,
        download_token
      )
    `)
    .eq('id', params.id)
    .eq('status', 'paid')
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: 'Order not found or not paid' },
      { status: 404 }
    );
  }

  try {
    await sendDownloadRecoveryEmail(
      order.customer_email,
      order.order_items.map((item: { photo_id: string; download_token: string }) => ({
        photoId: item.photo_id,
        token: item.download_token,
      }))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
