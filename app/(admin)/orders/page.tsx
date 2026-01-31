import { createServerClient } from '@/lib/db';
import Card from '@/components/ui/Card';
import OrderActions from './OrderActions';
import type { Order, OrderItem } from '@/types/database';

interface OrderWithItems extends Order {
  order_items: Pick<OrderItem, 'id' | 'photo_id' | 'download_token' | 'downloaded_at'>[];
}

async function getOrders(): Promise<OrderWithItems[]> {
  const supabase = createServerClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        photo_id,
        download_token,
        downloaded_at
      )
    `)
    .order('created_at', { ascending: false });

  return (orders as OrderWithItems[]) || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            No orders yet
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{order.customer_email}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1">
                    <p>
                      Order ID:{' '}
                      <code className="bg-gray-100 px-1 rounded">
                        {order.id.slice(0, 8)}
                      </code>
                    </p>
                    <p>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>{order.order_items?.length || 0} photos</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(order.total_cents / 100).toFixed(2)}
                  </p>

                  {order.status === 'paid' && (
                    <OrderActions
                      orderId={order.id}
                    />
                  )}
                </div>
              </div>

              {/* Download status */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Downloads:{' '}
                    {order.order_items.filter((i) => i.downloaded_at).length} /{' '}
                    {order.order_items.length} completed
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
