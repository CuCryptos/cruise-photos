import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';
import { generateAccessCode } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('session_id', params.id)
    .order('table_number');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { table_number } = body;

    if (!table_number) {
      return NextResponse.json(
        { error: 'table_number is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tables')
      .insert({
        session_id: params.id,
        table_number,
        access_code: generateAccessCode(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
