'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function NewSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      cruise_date: formData.get('cruise_date') as string,
      table_count: parseInt(formData.get('table_count') as string) || 0,
    };

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const session = await response.json();
      router.push(`/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Session</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Session Name"
            name="name"
            placeholder="e.g., Evening Cruise - Jan 15"
            required
          />

          <Input
            label="Cruise Date"
            name="cruise_date"
            type="date"
            defaultValue={today}
            required
          />

          <Input
            label="Number of Tables"
            name="table_count"
            type="number"
            min="1"
            max="50"
            defaultValue="10"
            required
          />

          <p className="text-sm text-gray-500">
            Tables will be created automatically (Table 1, Table 2, etc.). You
            can rename or add more tables later.
          </p>

          <div className="flex gap-4">
            <Button type="submit" loading={loading}>
              Create Session
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
