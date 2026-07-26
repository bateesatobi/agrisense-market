import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminDrawer, AdminRowMenu } from '../../components/admin/AdminChrome';
import { AdminPagination, useAdminPagination } from '../../components/admin/AdminPagination';
import { marketApi } from '../../services/api';
import { formatUgx, useMarket } from '../../store/MarketStore';
import type {
  DeliveryMode,
  DeliveryPeriod,
  MarketCategory,
  MarketUnit,
  Product,
  ProductKind,
} from '../../types';
import { DELIVERY_PERIOD_LABELS } from '../../types';
import { getPrimaryImage, getProductImages } from '../../utils/productImages';
import { getPriceDisplay, listPriceFromDiscount } from '../../utils/pricing';
import { swalConfirm, swalError, swalSuccess } from '../../utils/swal';

type ProductForm = Omit<Product, 'createdAt' | 'updatedAt'> & {
  applyDiscount: boolean;
};

const emptyForm = (kind: ProductKind = 'produce'): ProductForm => ({
  id: `new_${Date.now()}`,
  kind,
  title: '',
  category: '',
  categoryId: undefined,
  description: '',
  priceUgx: 0,
  discountPercent: undefined,
  applyDiscount: false,
  unit: 'kg',
  unitId: undefined,
  stock: 0,
  imageEmoji: '🌽',
  images: [],
  imageUrls: [],
  seller: '',
  location: '',
  featured: false,
  active: true,
  deliveryMode: 'paid',
  deliveryPeriod: '3_days',
});

function toForm(p: Product): ProductForm {
  const discount =
    p.discountPercent && p.discountPercent > 0
      ? p.discountPercent
      : p.compareAtPriceUgx && p.compareAtPriceUgx > p.priceUgx
        ? Math.round(((p.compareAtPriceUgx - p.priceUgx) / p.compareAtPriceUgx) * 100)
        : 0;
  return {
    id: p.id,
    kind: p.kind,
    title: p.title,
    category: p.category,
    categoryId: p.categoryId,
    description: p.description,
    priceUgx: p.priceUgx,
    compareAtPriceUgx: p.compareAtPriceUgx,
    discountPercent: discount || undefined,
    applyDiscount: discount > 0,
    unit: p.unit,
    unitId: p.unitId,
    stock: p.stock,
    imageEmoji: p.imageEmoji,
    images: p.images ?? [],
    imageUrls: p.imageUrls ?? [],
    seller: p.seller,
    location: p.location,
    featured: !!p.featured,
    active: p.active,
    deliveryMode: p.deliveryMode || 'paid',
    deliveryPeriod: p.deliveryPeriod || '3_days',
  };
}

function filesToDataUrls(files: FileList | null): Promise<string[]> {
  if (!files?.length) return Promise.resolve([]);
  const readers = Array.from(files).slice(0, 5).map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      }),
  );
  return Promise.all(readers);
}

export function AdminProductsPage() {
  const { products, upsertProduct, deleteProduct } = useMarket();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ProductKind>('all');
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [units, setUnits] = useState<MarketUnit[]>([]);

  useEffect(() => {
    if (params.get('new') === '1') {
      const kindFromTab = filter === 'input' || filter === 'produce' ? filter : 'produce';
      setEditing(emptyForm(kindFromTab));
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
    }
  }, [params, setParams, filter]);

  useEffect(() => {
    void (async () => {
      try {
        const [cats, unitList] = await Promise.all([
          marketApi.listCategories({ includeInactive: false }),
          marketApi.listUnits(),
        ]);
        setCategories(cats.filter((c) => c.active));
        setUnits(unitList.filter((u) => u.active));
      } catch (err) {
        console.error('Failed to load categories/units', err);
      }
    })();
  }, []);

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

  const formKind: ProductKind = editing?.kind ?? (filter === 'input' ? 'input' : 'produce');

  const categoriesForKind = useMemo(
    () => categories.filter((c) => c.kind === formKind),
    [categories, formKind],
  );

  const startNewProduct = () => {
    const kindFromTab = filter === 'input' || filter === 'produce' ? filter : 'produce';
    setEditing(emptyForm(kindFromTab));
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.title.trim() || editing.priceUgx <= 0) return;
    if (!editing.categoryId && !editing.category.trim()) {
      await swalError('Missing category', 'Select a category before saving.');
      return;
    }
    const isNew = editing.id.startsWith('new_') || !products.some((p) => p.id === editing.id);
    const discountPercent =
      editing.applyDiscount && editing.discountPercent && editing.discountPercent > 0
        ? Math.min(99, Math.round(editing.discountPercent))
        : 0;
    const payload: Omit<Product, 'createdAt' | 'updatedAt'> = {
      ...editing,
      discountPercent: discountPercent || undefined,
      compareAtPriceUgx:
        discountPercent > 0
          ? listPriceFromDiscount(editing.priceUgx, discountPercent)
          : undefined,
      seller: editing.kind === 'input' ? editing.seller || 'AgriSense' : editing.seller,
    };
    const err = await upsertProduct(payload);
    if (err) {
      await swalError(isNew ? 'Could not add product' : 'Could not update product', err);
      return;
    }
    setEditing(null);
    await swalSuccess(
      isNew ? 'Product added' : 'Product updated',
      isNew
        ? `${payload.title} was added to the catalogue.`
        : `${payload.title} was saved successfully.`,
    );
  };

  const setKind = (kind: ProductKind) => {
    if (!editing) return;
    const stillValid = categories.some(
      (c) => c.id === editing.categoryId && c.kind === kind,
    );
    setEditing({
      ...editing,
      kind,
      categoryId: stillValid ? editing.categoryId : undefined,
      category: stillValid ? editing.category : '',
    });
  };

  const setCategoryId = (categoryId: string) => {
    if (!editing) return;
    const cat = categories.find((c) => c.id === categoryId);
    setEditing({
      ...editing,
      categoryId: cat?.id,
      category: cat?.name || '',
    });
  };

  const setUnitId = (unitId: string) => {
    if (!editing) return;
    const unit = units.find((u) => u.id === unitId);
    setEditing({
      ...editing,
      unitId: unit?.id,
      unit: unit?.symbol || unit?.name || editing.unit,
    });
  };

  const onUploadFiles = async (fileList: FileList | null) => {
    if (!editing || !fileList?.length) return;
    try {
      const dataUrls = await filesToDataUrls(fileList);
      setEditing({ ...editing, images: [...editing.images, ...dataUrls] });
      await swalSuccess(
        fileList.length === 1 ? 'Image uploaded' : 'Images uploaded',
        `${fileList.length} image${fileList.length === 1 ? '' : 's'} ready to save with the product.`,
      );
    } catch (err) {
      await swalError(
        'Upload failed',
        err instanceof Error ? err.message : 'Image upload failed',
      );
    }
  };

  const openView = async (p: Product) => {
    setViewing(p);
    setViewLoading(true);
    setViewError(null);
    try {
      const fresh = await marketApi.getProduct(p.id, true);
      setViewing(fresh);
    } catch (err) {
      setViewError(err instanceof Error ? err.message : 'Could not refresh product details');
    } finally {
      setViewLoading(false);
    }
  };

  const openEdit = (p: Product) => {
    const form = toForm(p);
    if (!form.categoryId) {
      const cat = categories.find(
        (c) => c.kind === form.kind && c.name.toLowerCase() === form.category.toLowerCase(),
      );
      if (cat) {
        form.categoryId = cat.id;
        form.category = cat.name;
      }
    }
    if (!form.unitId) {
      const unit = units.find(
        (u) =>
          u.symbol.toLowerCase() === form.unit.toLowerCase() ||
          u.name.toLowerCase() === form.unit.toLowerCase(),
      );
      if (unit) {
        form.unitId = unit.id;
        form.unit = unit.symbol || unit.name;
      }
    }
    setEditing(form);
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
        <button type="button" className="btn btn-primary" onClick={startNewProduct}>
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

      <AdminDrawer
        open={!!editing}
        wide
        title={
          editing && products.some((p) => p.id === editing.id)
            ? 'Update product'
            : 'New product'
        }
        onClose={() => setEditing(null)}
        footer={
          editing ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" form="admin-product-form" className="btn btn-primary">
                Save
              </button>
            </>
          ) : null
        }
      >
        {editing && (
          <form id="admin-product-form" onSubmit={onSave}>
            <div className="admin-form-grid">
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
                  onChange={(e) => setKind(e.target.value as ProductKind)}
                >
                  <option value="produce">Produce</option>
                  <option value="input">Farm input</option>
                </select>
              </div>
              <div className="field">
                <label>Category</label>
                <select
                  value={editing.categoryId || ''}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select {editing.kind} category
                  </option>
                  {categoriesForKind.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {!categoriesForKind.length && (
                  <small className="muted">No categories — create one under Categories.</small>
                )}
              </div>
              <div className="field">
                <label>Unit</label>
                <select
                  value={editing.unitId || ''}
                  onChange={(e) => setUnitId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
                {!units.length && (
                  <small className="muted">No units — create one under Units.</small>
                )}
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
                <label>Discount</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editing.applyDiscount}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          applyDiscount: e.target.checked,
                          discountPercent: e.target.checked
                            ? editing.discountPercent || 10
                            : undefined,
                        })
                      }
                    />{' '}
                    Apply discount
                  </label>
                  {editing.applyDiscount ? (
                    <>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={editing.discountPercent ?? ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            discountPercent: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="% off"
                      />
                      {editing.priceUgx > 0 &&
                      editing.discountPercent &&
                      editing.discountPercent > 0 ? (
                        <small className="muted">
                          Was{' '}
                          {formatUgx(
                            listPriceFromDiscount(editing.priceUgx, editing.discountPercent),
                          )}{' '}
                          · Now {formatUgx(editing.priceUgx)} (−{editing.discountPercent}%)
                        </small>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label>Stock</label>
                <input
                  type="number"
                  value={editing.stock}
                  onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                />
              </div>
              {editing.kind === 'produce' ? (
                <div className="field">
                  <label>Seller</label>
                  <input
                    value={editing.seller}
                    onChange={(e) => setEditing({ ...editing, seller: e.target.value })}
                  />
                </div>
              ) : null}
              <div className="field">
                <label>Location</label>
                <input
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Delivery</label>
                <select
                  value={editing.deliveryMode || 'paid'}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      deliveryMode: e.target.value as DeliveryMode,
                    })
                  }
                >
                  <option value="free">Free delivery</option>
                  <option value="paid">Delivered at a fee</option>
                </select>
              </div>
              <div className="field">
                <label>Delivery period</label>
                <select
                  value={editing.deliveryPeriod || '3_days'}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      deliveryPeriod: e.target.value as DeliveryPeriod,
                    })
                  }
                >
                  {(Object.keys(DELIVERY_PERIOD_LABELS) as DeliveryPeriod[]).map((key) => (
                    <option key={key} value={key}>
                      {DELIVERY_PERIOD_LABELS[key]}
                    </option>
                  ))}
                </select>
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
              <label>Product images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => void onUploadFiles(e.target.files)}
              />
              <small className="muted">Upload up to 5 photos.</small>
            </div>
            {editing.images.length > 0 && (
              <div className="chip-row" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
                {editing.images.map((src, idx) => (
                  <div key={`${idx}-${src.slice(0, 24)}`} style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt=""
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ display: 'block', fontSize: 12, padding: '2px 6px' }}
                      onClick={() =>
                        setEditing({
                          ...editing,
                          images: editing.images.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="field">
              <label>Description</label>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
          </form>
        )}
      </AdminDrawer>

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
                          { label: 'View', onClick: () => void openView(p) },
                          { label: 'Update', onClick: () => openEdit(p) },
                          {
                            label: 'Delete',
                            tone: 'danger',
                            onClick: async () => {
                              const ok = await swalConfirm(
                                'Delete product?',
                                `Remove “${p.title}” from the catalogue.`,
                              );
                              if (!ok) return;
                              const err = await deleteProduct(p.id);
                              if (err) {
                                await swalError('Delete failed', err);
                                return;
                              }
                              await swalSuccess('Product deleted', `${p.title} was removed.`);
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
          from={from}
          to={to}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <AdminDrawer
        open={!!viewing}
        wide
        title={viewing ? viewing.title : 'Product details'}
        onClose={() => {
          setViewing(null);
          setViewError(null);
        }}
        footer={
          viewing ? (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setViewing(null);
                  setViewError(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  openEdit(viewing);
                  setViewing(null);
                }}
              >
                Edit product
              </button>
            </>
          ) : null
        }
      >
        {viewLoading && !viewing ? <p>Loading…</p> : null}
        {viewError ? <p className="admin-error">{viewError}</p> : null}
        {viewing ? (
          <div className="admin-detail-panel">
            {viewLoading ? <p className="muted">Refreshing from server…</p> : null}
            <div className="admin-detail-gallery">
              {getProductImages(viewing).slice(0, 6).map((src, i) => (
                <img key={`${viewing.id}-img-${i}`} src={src} alt="" />
              ))}
            </div>
            <div className="admin-detail-grid">
              <div>
                <span className="admin-detail-label">Product ID</span>
                <div className="admin-detail-value">
                  <code>{viewing.id}</code>
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Kind</span>
                <div className="admin-detail-value">
                  {viewing.kind === 'produce' ? 'Produce' : 'Farm input'}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Category</span>
                <div className="admin-detail-value">{viewing.category || '—'}</div>
              </div>
              <div>
                <span className="admin-detail-label">Unit</span>
                <div className="admin-detail-value">{viewing.unit}</div>
              </div>
              <div>
                <span className="admin-detail-label">Selling price</span>
                <div className="admin-detail-value">{formatUgx(viewing.priceUgx)}</div>
              </div>
              <div>
                <span className="admin-detail-label">Discount</span>
                <div className="admin-detail-value">
                  {(() => {
                    const deal = getPriceDisplay(viewing.priceUgx, viewing.compareAtPriceUgx);
                    if (!deal.hasDiscount) return 'None';
                    return `${deal.percentOff}% off · was ${formatUgx(deal.listPriceUgx!)}`;
                  })()}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Stock</span>
                <div className="admin-detail-value">{viewing.stock.toLocaleString()}</div>
              </div>
              <div>
                <span className="admin-detail-label">Status</span>
                <div className="admin-detail-value">
                  <span className={`badge ${viewing.active ? 'badge-green' : 'badge-muted'}`}>
                    {viewing.active ? 'active' : 'hidden'}
                  </span>
                  {viewing.featured ? ' · featured' : ''}
                </div>
              </div>
              {viewing.kind === 'produce' ? (
                <div>
                  <span className="admin-detail-label">Seller</span>
                  <div className="admin-detail-value">{viewing.seller || '—'}</div>
                </div>
              ) : null}
              <div>
                <span className="admin-detail-label">Ships from</span>
                <div className="admin-detail-value">{viewing.location || '—'}</div>
              </div>
              <div>
                <span className="admin-detail-label">Delivery</span>
                <div className="admin-detail-value">
                  {(viewing.deliveryMode || 'paid') === 'free'
                    ? 'Free delivery'
                    : 'Delivered at a fee'}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Delivery period</span>
                <div className="admin-detail-value">
                  {viewing.deliveryPeriod && DELIVERY_PERIOD_LABELS[viewing.deliveryPeriod]
                    ? DELIVERY_PERIOD_LABELS[viewing.deliveryPeriod]
                    : DELIVERY_PERIOD_LABELS['3_days']}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Created</span>
                <div className="admin-detail-value">
                  {new Date(viewing.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="admin-detail-label">Updated</span>
                <div className="admin-detail-value">
                  {new Date(viewing.updatedAt).toLocaleString()}
                </div>
              </div>
              <div className="full">
                <span className="admin-detail-label">Description</span>
                <div className="admin-detail-value" style={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                  {viewing.description || '—'}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </AdminDrawer>
    </div>
  );
}
