import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import { useMarket } from '../../store/MarketStore';
import type { ProductKind } from '../../types';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export function ShopPage() {
  const { products } = useMarket();
  const [params, setParams] = useSearchParams();
  const kind = (params.get('kind') as ProductKind | 'all') || 'all';
  const q = params.get('q') ?? '';
  const sort = (params.get('sort') as SortKey) || 'featured';
  const inStockOnly = params.get('stock') === '1';
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const list = useMemo(() => {
    let rows = products
      .filter((p) => p.active)
      .filter((p) => (kind === 'all' ? true : p.kind === kind))
      .filter((p) => (inStockOnly ? p.stock > 0 : true))
      .filter((p) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return (
          p.title.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.location.toLowerCase().includes(s) ||
          p.seller.toLowerCase().includes(s)
        );
      });

    rows = [...rows];
    if (sort === 'price-asc') rows.sort((a, b) => a.priceUgx - b.priceUgx);
    else if (sort === 'price-desc') rows.sort((a, b) => b.priceUgx - a.priceUgx);
    else if (sort === 'newest')
      rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    else rows.sort((a, b) => Number(b.featured) - Number(a.featured));

    return rows;
  }, [products, kind, q, sort, inStockOnly]);

  const patch = (key: string, value: string | null) => {
    const n = new URLSearchParams(params);
    if (!value) n.delete(key);
    else n.set(key, value);
    setParams(n);
  };

  const setKind = (next: string) => patch('kind', next === 'all' ? null : next);

  const title =
    kind === 'produce' ? 'Fresh produce' : kind === 'input' ? 'Farm inputs' : 'Results';

  const Filters = (
    <>
      <h3>Department</h3>
      <div className="filter-group">
        {[
          { id: 'all', label: 'All categories' },
          { id: 'produce', label: 'Produce' },
          { id: 'input', label: 'Farm inputs' },
        ].map((c) => (
          <label key={c.id}>
            <input
              type="radio"
              name="kind"
              checked={kind === c.id}
              onChange={() => setKind(c.id)}
            />
            {c.label}
          </label>
        ))}
      </div>
      <div className="filter-group">
        <h3>Availability</h3>
        <label>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => patch('stock', e.target.checked ? '1' : null)}
          />
          In stock only
        </label>
      </div>
      <div className="filter-group">
        <h3>Sort by</h3>
        <select
          value={sort}
          onChange={(e) => patch('sort', e.target.value === 'featured' ? null : e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8 }}
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      <div className="filter-group">
        <h3>Need scanning tools?</h3>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--amz-muted)' }}>
          Crop scan, soil pH, yield map & weather are in the AgriSense mobile app.
        </p>
        <Link to="/download-app" style={{ color: 'var(--amz-link)', fontWeight: 700, fontSize: 13 }}>
          Get the app →
        </Link>
      </div>
    </>
  );

  return (
    <div className="amz-shop">
      <aside className="amz-filters">{Filters}</aside>

      <section>
        <div className="amz-banner">
          <div>
            <strong>AgriSense Market</strong>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              Uganda produce & farm inputs — pay only at checkout
            </div>
          </div>
          <Link to="/download-app">Download farm app</Link>
        </div>

        <div className="amz-mobile-filter-bar">
          <button type="button" className="amz-filter-chip" onClick={() => setMobileFiltersOpen(true)}>
            Filters & sort
          </button>
          <button
            type="button"
            className={`amz-filter-chip ${kind === 'produce' ? 'active' : ''}`}
            onClick={() => setKind(kind === 'produce' ? 'all' : 'produce')}
          >
            Produce
          </button>
          <button
            type="button"
            className={`amz-filter-chip ${kind === 'input' ? 'active' : ''}`}
            onClick={() => setKind(kind === 'input' ? 'all' : 'input')}
          >
            Inputs
          </button>
          <button
            type="button"
            className={`amz-filter-chip ${inStockOnly ? 'active' : ''}`}
            onClick={() => patch('stock', inStockOnly ? null : '1')}
          >
            In stock
          </button>
        </div>

        <div className="amz-results-head">
          <div>
            <h1>
              {q ? `“${q}”` : title}
              {kind !== 'all' && q ? ` in ${title}` : ''}
            </h1>
            <p>
              {list.length} result{list.length === 1 ? '' : 's'}
              {q ? ` for “${q}”` : ''}
            </p>
          </div>
          <label className="amz-sort-desktop">
            Sort:{' '}
            <select
              value={sort}
              onChange={(e) => patch('sort', e.target.value === 'featured' ? null : e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        {list.length === 0 ? (
          <div className="empty" style={{ background: '#fff', border: '1px solid #d5d9d9' }}>
            No products match. Try another search or clear filters.
          </div>
        ) : (
          <div className="amz-grid">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {mobileFiltersOpen ? (
        <div className="amz-filter-sheet" role="dialog" aria-modal="true">
          <button
            type="button"
            className="amz-filter-sheet-backdrop"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="amz-filter-sheet-panel">
            <div className="amz-filter-sheet-head">
              <strong>Filters & sort</strong>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                Done
              </button>
            </div>
            {Filters}
          </div>
        </div>
      ) : null}
    </div>
  );
}
