import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';
import { createOrder, processPayment } from '@/lib/clover';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import type { Photo, Order, OrderItem } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { photoIds, email, sourceToken } = body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: 'Photo IDs are required' },
        { status: 400 }
      );
    }

    if (!email || !sourceToken) {
      return NextResponse.json(
        { error: 'Email and payment token are required' },
        { status: 400 }
      );
    }

    // Get photos and calculate total
    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .in('id', photoIds);

    const photos = photosData as Photo[] | null;

    if (photosError || !photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'Invalid photos' },
        { status: 400 }
      );
    }

    const total = photos.reduce((sum, p) => sum + p.price_cents, 0);

    // Create order in our database first (pending status)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: email,
        status: 'pending',
        total_cents: total,
      })
      .select()
      .single();

    const order = orderData as Order | null;

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    try {
      // Create Clover order
      const cloverOrder = await createOrder(
        photos.map((p) => ({
          name: 'Digital Photo',
          price: p.price_cents,
          quantity: 1,
        })),
        email
      );

      // Process payment
      const chargeResult = await processPayment(
        sourceToken,
        total,
        cloverOrder.id,
        email
      );

      // Update order with Clover ID and mark as paid
      await supabase
        .from('orders')
        .update({
          clover_order_id: cloverOrder.id,
          status: 'paid',
        })
        .eq('id', order.id);

      // Create order items with download tokens
      const orderItems = photos.map((photo) => ({
        order_id: order.id,
        photo_id: photo.id,
        download_token: uuidv4(),
      }));

      const { data: createdItemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      const createdItems = createdItemsData as OrderItem[] | null;

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      // Send confirmation email
      if (createdItems) {
        await sendOrderConfirmationEmail(
          email,
          order.id,
          createdItems.map((item) => ({
            photoId: item.photo_id,
            token: item.download_token,
          })),
          total
        );
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        chargeId: chargeResult.id,
      });
    } catch (paymentError) {
      // Mark order as failed
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', order.id);

      console.error('Payment error:', paymentError);
      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
