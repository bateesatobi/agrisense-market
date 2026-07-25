import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminModal, AdminRowMenu } from '../../components/admin/AdminChrome';
import { AdminPagination, useAdminPagination } from '../../components/admin/AdminPagination';
import { formatUgx, useMarket } from '../../store/MarketStore';
import type { Product, ProductKind } from '../../types';
import { getPrimaryImage } from '../../utils/productImages';

const emptyForm = (): Omit<Product, 'createdAt' | 'updatedAt'> => ({
  id: `new_${Date.now()}`,
  kind: 'produce',
  title: '',
  category: '',
  description: '',
  priceUgx: 0,
  unit: 'kg',
  stock: 0,
  imageEmoji: '🌽',
  images: [],
  seller: '',
  location: '',
  featured: false,
  active: true,
});

function toForm(p: Product): Omit<Product, 'createdAt' | 'updatedAt'> {
  return {
    id: p.id,
    kind: p.kind,
    title: p.title,
    category: p.category,
    description: p.description,
    priceUgx: p.priceUgx,
    compareAtPriceUgx: p.compareAtPriceUgx,
    unit: p.unit,
    stock: p.stock,
    imageEmoji: p.imageEmoji,
    images: p.images ?? [],
    seller: p.seller,
    location: p.location,
    featured: !!p.featured,
    active: p.active,
  };
}

export function AdminProductsPage() {
  const { products, upsertProduct, deleteProduct } = useMarket();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<ReturnType<typeof emptyForm> | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | ProductKind>('all');

  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(emptyForm());
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const list = useMemo(
    () => products.filter((p) => (filter === 'all' ? true : p.kind === filter)),
    [products, filter],
  );
  const {
    pageItems,
    page,
    setPage,
    pageCount,
    total,
    from,
    to,
  } = useAdminPagination(list, 10, filter);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.title.trim() || editing.priceUgx <= 0) return;
    const err = await upsertProduct(editing);
    if (err) {
      alert(err);
      return;
    }
    setEditing(null);
  };

  const cover = (p: Product) => {
    try {
      return getPrimaryImage(p);
    } catch {
      return '';
    }
  };

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Products & produce</h2>
          <p>Catalogue photos, pricing, stock and visibility</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing(emptyForm())}>
          Add product
        </button>
      </div>

      <div className="chip-row" style={{ marginBottom: 12 }}>
        {(['all', 'produce', 'input'] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={`chip ${filter === k ? 'active' : ''}`}
            onClick={() => setFilter(k)}
          >
            {k === 'all' ? 'All' : k === 'produce' ? 'Produce' : 'Inputs'}
          </button>
        ))}
      </div>

      {editing && (
        <form className="panel" style={{ marginBottom: 16 }} onSubmit={onSave}>
          <h3 style={{ marginTop: 0 }}>
            {products.some((p) => p.id === editing.id) ? 'Update product' : 'New product'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Title</label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Kind</label>
              <select
                value={editing.kind}
                onChange={(e) =>
                  setEditing({ ...editing, kind: e.target.value as ProductKind })
                }
              >
                <option value="produce">Produce</option>
                <option value="input">Farm input</option>
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <input
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Unit</label>
              <input
                value={editing.unit}
                onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Price (UGX)</label>
              <input
                type="number"
                value={editing.priceUgx}
                onChange={(e) =>
                  setEditing({ ...editing, priceUgx: Number(e.target.value) })
                }
              />
            </div>
            <div className="field">
              <label>List price (UGX)</label>
              <input
                type="number"
                value={editing.compareAtPriceUgx ?? ''}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    compareAtPriceUgx: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Stock</label>
              <input
                type="number"
                value={editing.stock}
                onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Seller</label>
              <input
                value={editing.seller}
                onChange={(e) => setEditing({ ...editing, seller: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Location</label>
              <input
                value={editing.location}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Emoji fallback</label>
              <input
                value={editing.imageEmoji}
                onChange={(e) => setEditing({ ...editing, imageEmoji: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Flags</label>
              <div style={{ display: 'flex', gap: 16, paddingTop: 10 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={editing.featured}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  />{' '}
                  Featured
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  />{' '}
                  Active
                </label>
              </div>
            </div>
          </div>
          <div className="field">
            <label>Image URLs (one per line)</label>
            <textarea
              value={(editing.images ?? []).join('\n')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  images: e.target.value
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Kind</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ width: 56 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty">No products in this filter.</div>
                </td>
              </tr>
            ) : (
              pageItems.map((p) => {
                const img = cover(p);
                const isPhoto = img.startsWith('http') || img.startsWith('data:');
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        {isPhoto ? (
                          <img className="admin-thumb" src={img} alt="" />
                        ) : (
                          <div className="admin-thumb-fallback">{p.imageEmoji || '📦'}</div>
                        )}
                        <div>
                          <strong>{p.title}</strong>
                          <div className="muted">
                            {p.category} · {p.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.kind}</td>
                    <td>
                      {formatUgx(p.priceUgx)} / {p.unit}
                    </td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`badge ${p.active ? 'badge-green' : 'badge-muted'}`}>
                        {p.active ? 'active' : 'hidden'}
                      </span>
                    </td>
                    <td>
                      <AdminRowMenu
                        items={[
                          { label: 'View', onClick: () => setViewing(p) },
                          { label: 'Update', onClick: () => setEditing(toForm(p)) },
                          {
                            label: 'Delete',
                            tone: 'danger',
                            onClick: async () => {
                              if (confirm(`Delete ${p.title}?`)) {
                                const err = await deleteProduct(p.id);
                                if (err) alert(err);
                              }
                            },
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <AdminPagination
          page={page}
          pageCount={pageCount}
          total={total}
          from={from}
          to={to}
          onPageChange={setPage}
          label="products"
        />
      </div>

      <AdminModal
        open={!!viewing}
        title={viewing?.title ?? 'Product'}
        onClose={() => setViewing(null)}
        wide
        footer={
          viewing ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setViewing(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditing(toForm(viewing));
                  setViewing(null);
                }}
              >
                Update
              </button>
            </>
          ) : null
        }
      >
        {viewing ? (
          <>
            {(() => {
              const img = cover(viewing);
              const isPhoto = img.startsWith('http') || img.startsWith('data:');
              return isPhoto ? (
                <img className="admin-view-hero" src={img} alt={viewing.title} />
              ) : (
                <div className="admin-view-hero-fallback">{viewing.imageEmoji || '📦'}</div>
              );
            })()}
            <div className="admin-detail-grid">
              <div>
                <span className="admin-detail-label">Kind</span>
                <div className="admin-detail-value">{viewing.kind}</div>
              </div>
              <div>
                <span className="admin-detail-label">Category</span>
                <div className="admin-detail-value">{viewing.category}</div>
              </div>
              <div>
                <span className="admin-detail-label">Price</span>
                <div className="admin-detail-value">
                  {formatUgx(viewing.priceUgx)} / {viewing.unit}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">List price</span>
                <div className="admin-detail-value">
                  {viewing.compareAtPriceUgx
                    ? formatUgx(viewing.compareAtPriceUgx)
                    : '—'}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Stock</span>
                <div className="admin-detail-value">{viewing.stock}</div>
              </div>
              <div>
                <span className="admin-detail-label">Status</span>
                <div className="admin-detail-value">
                  {viewing.active ? 'Active' : 'Hidden'}
                  {viewing.featured ? ' · Featured' : ''}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Seller</span>
                <div className="admin-detail-value">{viewing.seller}</div>
              </div>
              <div>
                <span className="admin-detail-label">Location</span>
                <div className="admin-detail-value">{viewing.location}</div>
              </div>
              <div className="full">
                <span className="admin-detail-label">Description</span>
                <div className="admin-detail-value" style={{ fontWeight: 500 }}>
                  {viewing.description || '—'}
                </div>
              </div>
              <div className="full">
                <span className="admin-detail-label">Gallery</span>
                <div className="admin-detail-value">
                  {(viewing.images?.length ?? 0)} photo
                  {(viewing.images?.length ?? 0) === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </AdminModal>
    </div>
  );
}
