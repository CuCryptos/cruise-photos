'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PhotoUploader from '@/components/admin/PhotoUploader';
import type { Session, Table } from '@/types/database';

function UploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>(
    sessionId || ''
  );
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchTables(selectedSession);
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const fetchTables = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/tables`);
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleUploadComplete = () => {
    // Refresh tables to show updated photo counts
    if (selectedSession) {
      fetchTables(selectedSession);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Upload Photos</h1>
      </div>

      {/* Session Selection */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Select Session:
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[300px]"
          >
            <option value="">Choose a session...</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} -{' '}
                {new Date(session.cruise_date).toLocaleDateString()}
              </option>
            ))}
          </select>

          {!sessionId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/sessions/new')}
            >
              New Session
            </Button>
          )}
        </div>
      </Card>

      {/* Upload Area */}
      {selectedSession ? (
        tables.length > 0 ? (
          <Card>
            <h2 className="text-lg font-semibold mb-4">
              Upload Photos for{' '}
              {sessions.find((s) => s.id === selectedSession)?.name}
            </h2>
            <PhotoUploader
              sessionId={selectedSession}
              tables={tables}
              onUploadComplete={handleUploadComplete}
            />
          </Card>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No tables found for this session
              </p>
              <Button onClick={() => router.push(`/sessions/${selectedSession}`)}>
                Manage Session
              </Button>
            </div>
          </Card>
        )
      ) : (
        <Card>
          <div className="text-center py-12 text-gray-500">
            Select a session to start uploading photos
          </div>
        </Card>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <UploadContent />
    </Suspense>
  );
}
