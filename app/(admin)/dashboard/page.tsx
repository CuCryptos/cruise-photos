import Link from 'next/link';
import { createServerClient } from '@/lib/db';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Session, Order } from '@/types/database';

async function getStats() {
  const supabase = createServerClient();

  const [sessionsResult, photosResult, ordersResult] = await Promise.all([
    supabase.from('sessions').select('id', { count: 'exact' }),
    supabase.from('photos').select('id', { count: 'exact' }),
    supabase
      .from('orders')
      .select('total_cents')
      .eq('status', 'paid'),
  ]);

  const paidOrders = ordersResult.data as { total_cents: number }[] | null;
  const totalRevenue =
    paidOrders?.reduce((sum, o) => sum + o.total_cents, 0) || 0;

  return {
    totalSessions: sessionsResult.count || 0,
    totalPhotos: photosResult.count || 0,
    totalOrders: paidOrders?.length || 0,
    totalRevenue,
  };
}

async function getRecentSessions(): Promise<Session[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('sessions')
    .select('*')
    .order('cruise_date', { ascending: false })
    .limit(5);

  return (data as Session[]) || [];
}

async function getRecentOrders(): Promise<Order[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5);

  return (data as Order[]) || [];
}

export default async function DashboardPage() {
  const [stats, recentSessions, recentOrders] = await Promise.all([
    getStats(),
    getRecentSessions(),
    getRecentOrders(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/sessions/new">
          <Button>New Session</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalSessions}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Photos</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalPhotos}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalOrders}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">
            ${(stats.totalRevenue / 100).toFixed(2)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Sessions</h2>
            <Link
              href="/sessions"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sessions yet</p>
          ) : (
            <ul className="space-y-3">
              {recentSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.cruise_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    href={`/sessions/${session.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Manage
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              href="/orders"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No orders yet</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{order.customer_email}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-medium text-green-600">
                    ${(order.total_cents / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
