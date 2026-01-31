import Link from 'next/link';
import { createServerClient } from '@/lib/db';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Session } from '@/types/database';

interface TableSummary {
  id: string;
  table_number: string;
  photos: { id: string }[];
}

interface SessionWithTables extends Session {
  tables: TableSummary[];
}

async function getSessions(): Promise<SessionWithTables[]> {
  const supabase = createServerClient();

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      tables (
        id,
        table_number,
        photos (id)
      )
    `)
    .order('cruise_date', { ascending: false });

  return (sessions as SessionWithTables[]) || [];
}

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <Link href="/sessions/new">
          <Button>New Session</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No sessions created yet</p>
            <Link href="/sessions/new">
              <Button>Create Your First Session</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const tableCount = session.tables?.length || 0;
            const photoCount =
              session.tables?.reduce(
                (sum, t) => sum + (t.photos?.length || 0),
                0
              ) || 0;

            return (
              <Card key={session.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{session.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(session.cruise_date).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {tableCount}
                      </p>
                      <p className="text-xs text-gray-500">Tables</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {photoCount}
                      </p>
                      <p className="text-xs text-gray-500">Photos</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/upload?session=${session.id}`}>
                        <Button variant="outline" size="sm">
                          Upload
                        </Button>
                      </Link>
                      <Link href={`/sessions/${session.id}`}>
                        <Button size="sm">Manage</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
