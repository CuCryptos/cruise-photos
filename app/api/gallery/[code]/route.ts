import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = createServerClient();

  // Find table by access code
  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select(`
      *,
      session:sessions (
        id,
        name,
        cruise_date
      ),
      photos (*)
    `)
    .eq('access_code', params.code.toUpperCase())
    .single();

  if (tableError || !table) {
    return NextResponse.json(
      { error: 'Invalid access code' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    table: {
      id: table.id,
      table_number: table.table_number,
      access_code: table.access_code,
    },
    session: table.session,
    photos: table.photos || [],
  });
}
