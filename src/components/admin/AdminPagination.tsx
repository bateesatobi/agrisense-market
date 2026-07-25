import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

export function useAdminPagination<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey?: string | number,
) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return {
    page: safePage,
    setPage,
    pageCount,
    pageItems,
    total,
    pageSize,
    from,
    to,
  };
}

type AdminPaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function AdminPagination({
  page,
  pageCount,
  total,
  from,
  to,
  onPageChange,
  label = 'rows',
}: AdminPaginationProps) {
  if (total === 0) return null;

  const pages = visiblePages(page, pageCount);

  return (
    <div className="admin-pagination" role="navigation" aria-label="Table pagination">
      <p className="admin-pagination-meta">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> {label}
      </p>
      <div className="admin-pagination-controls">
        <button
          type="button"
          className="admin-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          Prev
        </button>
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="admin-pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`admin-pagination-btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className="admin-pagination-btn"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function visiblePages(page: number, pageCount: number): Array<number | '…'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, pageCount, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pageCount));
  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}
