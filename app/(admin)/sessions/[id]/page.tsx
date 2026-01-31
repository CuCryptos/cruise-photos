import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/db';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SessionQRCodes from './SessionQRCodes';
import type { Session, Table, Photo } from '@/types/database';

interface TableWithPhotos extends Table {
  photos: Photo[];
}

interface SessionWithTables extends Session {
  tables: TableWithPhotos[];
}

async function getSession(id: string): Promise<SessionWithTables | null> {
  const supabase = createServerClient();

  const { data: session } = await supabase
    .from('sessions')
    .select(`
      *,
      tables (
        *,
        photos (*)
      )
    `)
    .eq('id', id)
    .single();

  return session as SessionWithTables | null;
}

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession(params.id);

  if (!session) {
    notFound();
  }

  const totalPhotos =
    session.tables?.reduce((sum, t) => sum + (t.photos?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
          <p className="text-gray-500">
            {new Date(session.cruise_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/upload?session=${session.id}`}>
            <Button>Upload Photos</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Tables</p>
          <p className="text-3xl font-bold">{session.tables?.length || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Photos</p>
          <p className="text-3xl font-bold">{totalPhotos}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Avg Photos/Table</p>
          <p className="text-3xl font-bold">
            {session.tables?.length
              ? Math.round(totalPhotos / session.tables.length)
              : 0}
          </p>
        </Card>
      </div>

      {/* QR Codes Section */}
      <SessionQRCodes
        tables={session.tables || []}
      />

      {/* Tables and Photos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tables & Photos</h2>

        {session.tables?.map((table) => (
          <Card key={table.id}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">{table.table_number}</h3>
                <p className="text-sm text-gray-500">
                  Access code: <code className="bg-gray-100 px-2 py-0.5 rounded">{table.access_code}</code>
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {table.photos?.length || 0} photos
              </p>
            </div>

            {table.photos && table.photos.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {table.photos.slice(0, 12).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded overflow-hidden"
                  >
                    <Image
                      src={photo.thumbnail_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
                {table.photos.length > 12 && (
                  <div className="aspect-square rounded bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      +{table.photos.length - 12}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No photos uploaded yet</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
