import { NextRequest, NextResponse } from 'next/server';
import { generateBatchQRCodes } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tables } = body;

    if (!tables || !Array.isArray(tables)) {
      return NextResponse.json(
        { error: 'Tables array is required' },
        { status: 400 }
      );
    }

    const qrCodes = await generateBatchQRCodes(tables);

    return NextResponse.json({ qrCodes });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    );
  }
}
