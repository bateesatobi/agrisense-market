import { Link, Navigate, useParams } from 'react-router-dom';
import { formatUgx, useMarket } from '../../store/MarketStore';
import type { OrderStatus } from '../../types';

const STEPS: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

function stepIndex(status: OrderStatus, cash: boolean): number {
  if (status === 'cancelled' || status === 'refunded') return -1;
  const steps = cash ? STEPS : (['paid', 'processing', 'shipped', 'delivered'] as OrderStatus[]);
  const i = steps.indexOf(status);
  if (status === 'pending' && !cash) return 0;
  return i >= 0 ? i : 0;
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { customer, orders } = useMarket();
  if (!customer) return <Navigate to="/checkout" replace />;

  const order = orders.find((o) => o.id === id && o.userId === customer.id);
  if (!order) {
    return (
      <div className="container section">
        <div className="empty">Order not found.</div>
        <Link to="/orders" className="btn btn-primary">
          Back to orders
        </Link>
      </div>
    );
  }

  const isCash = order.paymentMethod === 'cash';
  const active = stepIndex(order.status, isCash);
  const trackSteps = isCash
    ? STEPS
    : (['paid', 'processing', 'shipped', 'delivered'] as OrderStatus[]);
  const methodLabel =
    order.paymentMethod === 'mtn'
      ? 'MTN MoMo (Pesapal)'
      : order.paymentMethod === 'airtel'
        ? 'Airtel Money (Pesapal)'
        : order.paymentMethod === 'card'
          ? 'Card (Pesapal)'
          : order.paymentMethod === 'cash'
            ? 'Cash on delivery'
            : 'Payment';

  return (
    <div className="container section">
      <p style={{ marginBottom: 8 }}>
        <Link to="/orders" style={{ color: 'var(--amz-link)', fontWeight: 600 }}>
          ← Your orders
        </Link>
      </p>
      <h2 style={{ marginBottom: 4 }}>Order {order.id}</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="amz-order-grid">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Tracking</h3>
          {order.status === 'refunded' || order.status === 'cancelled' ? (
            <div className="alert alert-error" style={{ marginBottom: 0 }}>
              Status: {order.status}
              {order.refundNote ? ` — ${order.refundNote}` : ''}
            </div>
          ) : (
            <ol className="amz-track">
              {trackSteps.map((s, i) => (
                <li key={s} className={i <= active ? 'done' : ''}>
                  <span className="dot" />
                  <div>
                    <strong>
                      {s === 'pending' ? 'Awaiting cash' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </strong>
                    {i === active ? (
                      <div className="muted" style={{ fontSize: 13 }}>
                        Current status
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}

          <h3>Items</h3>
          {order.items.map((i) => (
            <div key={i.productId} className="amz-order-line">
              <div>
                <Link to={`/product/${i.productId}`}>{i.title}</Link>
                <div className="muted" style={{ fontSize: 13 }}>
                  Qty {i.quantity} · {i.unit}
                </div>
              </div>
              <strong>{formatUgx(i.unitPriceUgx * i.quantity)}</strong>
            </div>
          ))}
        </div>

        <aside className="panel">
          <h3 style={{ marginTop: 0 }}>Payment</h3>
          <div className="muted">{methodLabel}</div>
          {order.paymentMethod === 'cash' ? (
            <div className="alert alert-ok" style={{ marginTop: 8, marginBottom: 0 }}>
              Collect {formatUgx(order.totalUgx)} in cash on delivery
            </div>
          ) : null}
          <div>
            Ref: <strong>{order.paymentRef}</strong>
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '14px 0' }} />
          <h3 style={{ marginTop: 0 }}>Delivery</h3>
          <div>{order.deliveryAddress}</div>
          <div className="muted">{order.district}</div>
          <div className="muted" style={{ marginTop: 8 }}>
            {order.customerName} · {order.customerPhone}
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '14px 0' }} />
          <div className="amz-order-totals">
            <div>
              <span>Subtotal</span>
              <span>{formatUgx(order.subtotalUgx)}</span>
            </div>
            <div>
              <span>Delivery</span>
              <span>{order.deliveryUgx === 0 ? 'FREE' : formatUgx(order.deliveryUgx)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>{formatUgx(order.totalUgx)}</span>
            </div>
          </div>
          <Link to="/" className="btn btn-secondary" style={{ width: '100%', marginTop: 14 }}>
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
