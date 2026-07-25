import { Link, Navigate } from 'react-router-dom';
import { formatUgx, useMarket } from '../../store/MarketStore';

export function OrdersPage() {
  const { customer, orders } = useMarket();
  if (!customer) return <Navigate to="/checkout" replace />;

  const mine = orders.filter((o) => o.userId === customer.id);

  return (
    <div className="container section">
      <h2>Your orders</h2>
      <p className="muted">Track fulfilment and view Pesapal payment details.</p>
      {!mine.length ? (
        <div className="empty">
          No orders yet. <Link to="/">Start shopping</Link>
        </div>
      ) : (
        <div className="amz-orders-list">
          {mine.map((o) => (
            <article key={o.id} className="amz-order-card panel">
              <div className="amz-order-card-head">
                <div>
                  <Link to={`/orders/${o.id}`}>
                    <strong>{o.id}</strong>
                  </Link>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`badge ${
                    o.status === 'refunded' || o.status === 'cancelled'
                      ? 'badge-danger'
                      : 'badge-green'
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>
                {o.items.map((i) => `${i.title} ×${i.quantity}`).join(' · ')}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 12,
                  gap: 12,
                }}
              >
                <strong>{formatUgx(o.totalUgx)}</strong>
                <Link to={`/orders/${o.id}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                  Track package
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
