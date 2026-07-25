import { formatUgx } from '../store/MarketStore';
import { getPriceDisplay } from '../utils/pricing';

type Props = {
  priceUgx: number;
  compareAtPriceUgx?: number | null;
  unit?: string;
  /** card = compact search-grid; detail = PDP / buy box */
  size?: 'card' | 'detail';
};

/**
 * Amazon-style price block:
 * - Sale price (red)
 * - List price strikethrough
 * - “Save UGX X (Y%)”
 */
export function AmzPrice({
  priceUgx,
  compareAtPriceUgx,
  unit,
  size = 'card',
}: Props) {
  const d = getPriceDisplay(priceUgx, compareAtPriceUgx);
  const amountClass = size === 'detail' ? 'amz-price-amount--lg' : 'amz-price-amount';

  return (
    <div className={`amz-price-block amz-price-block--${size}`}>
      <div className="amz-price-row">
        <span className="currency">UGX</span>{' '}
        <span className={`${amountClass}${d.hasDiscount ? ' is-sale' : ''}`}>
          {d.priceUgx.toLocaleString()}
        </span>
        {unit ? <span className="unit"> / {unit}</span> : null}
      </div>

      {d.hasDiscount && d.listPriceUgx != null ? (
        <>
          <div className="amz-list-price">
            List:{' '}
            <span className="amz-strike">{formatUgx(d.listPriceUgx)}</span>
          </div>
          <div className="amz-save-line">
            Save {formatUgx(d.saveUgx)} ({d.percentOff}%)
          </div>
        </>
      ) : null}
    </div>
  );
}

export function DealBadge({
  priceUgx,
  compareAtPriceUgx,
}: {
  priceUgx: number;
  compareAtPriceUgx?: number | null;
}) {
  const d = getPriceDisplay(priceUgx, compareAtPriceUgx);
  if (!d.hasDiscount) return null;
  return <span className="amz-deal-badge">-{d.percentOff}%</span>;
}
