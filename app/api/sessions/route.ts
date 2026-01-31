import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db';
import { generateAccessCode } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('cruise_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { name, cruise_date, table_count } = body;

    if (!name || !cruise_date) {
      return NextResponse.json(
        { error: 'Name and cruise_date are required' },
        { status: 400 }
      );
    }

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ name, cruise_date })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    // Create tables if table_count is provided
    if (table_count && table_count > 0) {
      const tables = [];
      for (let i = 1; i <= table_count; i++) {
        tables.push({
          session_id: session.id,
          table_number: `Table ${i}`,
          access_code: generateAccessCode(),
        });
      }

      const { error: tablesError } = await supabase
        .from('tables')
        .insert(tables);

      if (tablesError) {
        console.error('Error creating tables:', tablesError);
      }
    }

    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
