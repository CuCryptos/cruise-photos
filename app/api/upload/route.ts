import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';
import { uploadImage, deleteImage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tableId = formData.get('tableId') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!file || !tableId) {
      return NextResponse.json(
        { error: 'File and tableId are required' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${ext}`;

    // Upload to Vercel Blob
    const { url, pathname } = await uploadImage(file, filename, {
      folder: `sessions/${sessionId}`,
    });

    // Save to database
    const defaultPrice = parseInt(
      process.env.DEFAULT_PHOTO_PRICE_CENTS || '1499'
    );

    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        table_id: tableId,
        cloudinary_public_id: pathname, // Reusing field name for blob pathname
        thumbnail_url: url,
        full_url: url,
        price_cents: defaultPrice,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up blob if DB insert fails
      await deleteImage(url);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
