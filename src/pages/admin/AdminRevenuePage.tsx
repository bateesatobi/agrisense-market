import { useMemo } from 'react';
import { AdminBarChart, AdminDonutChart } from '../../components/admin/AdminCharts';
import { AdminPagination, useAdminPagination } from '../../components/admin/AdminPagination';
import { formatUgx, useMarket } from '../../store/MarketStore';

export function AdminRevenuePage() {
  const { orders } = useMarket();
  const paid = orders.filter((o) =>
    ['paid', 'processing', 'shipped', 'delivered'].includes(o.status),
  );
  const refunded = orders.filter((o) => o.status === 'refunded');
  const pendingCash = orders.filter(
    (o) => o.status === 'pending' && o.paymentMethod === 'cash',
  );
  const gross = paid.reduce((s, o) => s + o.totalUgx, 0);
  const refundTotal = refunded.reduce((s, o) => s + (o.refundedUgx ?? o.totalUgx), 0);
  const net = gross - refundTotal;
  const avg = paid.length ? gross / paid.length : 0;
  const cashPending = pendingCash.reduce((s, o) => s + o.totalUgx, 0);

  const byDay = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const o of paid) {
      const day = new Date(o.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      acc[day] = (acc[day] ?? 0) + o.totalUgx;
    }
    return Object.entries(acc).map(([label, value]) => ({ label, value }));
  }, [paid]);

  const methodSegments = useMemo(() => {
    const acc: Record<string, number> = { mtn: 0, airtel: 0, card: 0, cash: 0 };
    for (const o of [...paid, ...pendingCash]) {
      const key = o.paymentMethod;
      if (key === 'mtn' || key === 'airtel' || key === 'card' || key === 'cash') {
        acc[key] += o.totalUgx;
      }
    }
    return [
      { label: 'MTN MoMo', value: acc.mtn, color: '#FFCC00' },
      { label: 'Airtel', value: acc.airtel, color: '#ED1C24' },
      { label: 'Card', value: acc.card, color: '#1565C0' },
      { label: 'Cash COD', value: acc.cash, color: '#2E7D32' },
    ].filter((s) => s.value > 0);
  }, [paid, pendingCash]);

  const dailyPage = useAdminPagination(byDay, 10, byDay.length);
  const refundPage = useAdminPagination(refunded, 10, refunded.length);

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Revenue</h2>
          <p>Sales performance, payment mix, and refunds</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Gross sales</div>
          <div className="value">{formatUgx(gross)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Refunds</div>
          <div className="value">{formatUgx(refundTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Net revenue</div>
          <div className="value">{formatUgx(net)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg order value</div>
          <div className="value">{formatUgx(avg)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Cash awaiting collection</div>
          <div className="value">{formatUgx(cashPending)}</div>
        </div>
      </div>

      <div className="admin-revenue-grid">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Sales by day</h3>
          {!byDay.length ? (
            <div className="empty">No paid orders yet.</div>
          ) : (
            <AdminBarChart data={byDay} formatValue={(n) => `${Math.round(n / 1000)}k`} />
          )}
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Payment mix</h3>
          {!methodSegments.length ? (
            <div className="empty">No payment data yet.</div>
          ) : (
            <AdminDonutChart
              segments={methodSegments}
              centerLabel="mix"
              centerValue={`${methodSegments.length}`}
            />
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.1rem 0' }}>
          <h3 style={{ marginTop: 0, marginBottom: 0 }}>Daily totals</h3>
        </div>
        {!byDay.length ? (
          <div className="empty" style={{ padding: '1rem 1.1rem' }}>
            No paid orders yet.
          </div>
        ) : (
          <>
            <div className="table-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyPage.pageItems.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{formatUgx(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={dailyPage.page}
              pageCount={dailyPage.pageCount}
              total={dailyPage.total}
              from={dailyPage.from}
              to={dailyPage.to}
              onPageChange={dailyPage.setPage}
              label="days"
            />
          </>
        )}
      </div>

      <div className="panel" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.1rem 0' }}>
          <h3 style={{ marginTop: 0, marginBottom: 0 }}>Refund log</h3>
        </div>
        {!refunded.length ? (
          <div className="empty" style={{ padding: '1rem 1.1rem' }}>
            No refunds yet.
          </div>
        ) : (
          <>
            <div className="table-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {refundPage.pageItems.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.customerName}</td>
                      <td>{formatUgx(o.refundedUgx ?? o.totalUgx)}</td>
                      <td>{o.refundNote ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={refundPage.page}
              pageCount={refundPage.pageCount}
              total={refundPage.total}
              from={refundPage.from}
              to={refundPage.to}
              onPageChange={refundPage.setPage}
              label="refunds"
            />
          </>
        )}
      </div>
    </div>
  );
}
