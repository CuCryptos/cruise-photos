import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createServerClient();

  // Find the order item by download token
  const { data: orderItem, error: itemError } = await supabase
    .from('order_items')
    .select(`
      *,
      order:orders (
        status
      ),
      photo:photos (
        full_url
      )
    `)
    .eq('download_token', params.token)
    .single();

  if (itemError || !orderItem) {
    return NextResponse.json(
      { error: 'Invalid download token' },
      { status: 404 }
    );
  }

  // Check if order is paid
  if (orderItem.order?.status !== 'paid') {
    return NextResponse.json(
      { error: 'Order not paid' },
      { status: 403 }
    );
  }

  // Check download expiry (7 days)
  const orderDate = new Date(orderItem.created_at);
  const expiryDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (new Date() > expiryDate) {
    return NextResponse.json(
      { error: 'Download link expired' },
      { status: 410 }
    );
  }

  // Mark as downloaded if first time
  if (!orderItem.downloaded_at) {
    await supabase
      .from('order_items')
      .update({ downloaded_at: new Date().toISOString() })
      .eq('id', orderItem.id);
  }

  // Redirect to the Vercel Blob URL for download
  const downloadUrl = orderItem.photo?.full_url;

  if (!downloadUrl) {
    return NextResponse.json(
      { error: 'Photo not found' },
      { status: 404 }
    );
  }

  // Redirect to Vercel Blob URL
  return NextResponse.redirect(downloadUrl);
}
