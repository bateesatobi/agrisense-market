import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AmzPrice } from '../../components/AmzPrice';
import { ImageGallery } from '../../components/ImageGallery';
import { Stars, ratingFromId } from '../../components/ProductCard';
import { useMarket } from '../../store/MarketStore';
import { DELIVERY_PERIOD_LABELS } from '../../types';
import { getPriceDisplay } from '../../utils/pricing';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useMarket();
  const product = products.find((p) => p.id === id && p.active);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="container-wide" style={{ padding: '2rem 0' }}>
        <div className="empty" style={{ background: '#fff' }}>
          Product not found.
        </div>
        <Link
          to="/"
          className="amz-btn-cart"
          style={{ display: 'inline-block', width: 'auto', marginTop: 12, padding: '0.5rem 1.2rem' }}
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const { rating, reviews } = ratingFromId(product.id);
  const deal = getPriceDisplay(product.priceUgx, product.compareAtPriceUgx);
  const maxQty = Math.max(1, Math.min(30, product.stock));
  const safeQty = Math.min(qty, maxQty);
  const deliveryMode = product.deliveryMode || 'paid';
  const periodLabel =
    product.deliveryPeriod && DELIVERY_PERIOD_LABELS[product.deliveryPeriod]
      ? DELIVERY_PERIOD_LABELS[product.deliveryPeriod]
      : DELIVERY_PERIOD_LABELS['3_days'];

  return (
    <div className="amz-pdp">
      <ImageGallery product={product} />

      <div className="amz-pdp-info">
        <h1>{product.title}</h1>
        <div className="amz-pdp-seller">
          <Link to={`/?q=${encodeURIComponent(product.seller)}`} style={{ color: 'inherit' }}>
            Visit the {product.seller} store
          </Link>
          {' · '}
          {product.location}
        </div>
        <div className="amz-stars">
          <Stars rating={rating} />
          <span>{reviews} ratings</span>
        </div>
        <hr style={{ border: 0, borderTop: '1px solid #e7e7e7', margin: '0.75rem 0' }} />
        {deal.hasDiscount ? (
          <div className="amz-limited-deal">Limited time deal</div>
        ) : null}
        <AmzPrice
          priceUgx={product.priceUgx}
          compareAtPriceUgx={product.compareAtPriceUgx}
          unit={product.unit}
          size="detail"
        />
        <p style={{ color: '#0f1111', lineHeight: 1.5 }}>{product.description}</p>
        <table style={{ fontSize: 14, marginTop: 12 }}>
          <tbody>
            <tr>
              <td style={{ color: '#565959', paddingRight: 16, paddingBottom: 6 }}>Category</td>
              <td>{product.category}</td>
            </tr>
            <tr>
              <td style={{ color: '#565959', paddingRight: 16, paddingBottom: 6 }}>Type</td>
              <td>{product.kind === 'produce' ? 'Agricultural produce' : 'Farm input'}</td>
            </tr>
            <tr>
              <td style={{ color: '#565959', paddingRight: 16, paddingBottom: 6 }}>Location</td>
              <td>{product.location}</td>
            </tr>
            <tr>
              <td style={{ color: '#565959', paddingRight: 16, paddingBottom: 6 }}>Delivery</td>
              <td>
                {deliveryMode === 'free' ? 'Free delivery' : 'Delivered at a fee'} · {periodLabel}
              </td>
            </tr>
            <tr>
              <td style={{ color: '#565959', paddingRight: 16, paddingBottom: 6 }}>Stock</td>
              <td>{product.stock.toLocaleString()} available</td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside className="amz-buybox">
        <AmzPrice
          priceUgx={product.priceUgx}
          compareAtPriceUgx={product.compareAtPriceUgx}
          size="detail"
        />
        <div className="amz-ship">
          {deliveryMode === 'free' ? 'FREE delivery' : 'Delivery fee applies'} · Arrives in{' '}
          {periodLabel}
        </div>
        <div className={product.stock > 0 ? 'stock' : 'oos'}>
          {product.stock > 0
            ? `In stock (${product.stock.toLocaleString()} available)`
            : 'Currently unavailable'}
        </div>
        {product.kind === 'produce' ? (
          <div className="amz-ship">Sold by {product.seller}</div>
        ) : null}

        {product.stock > 0 ? (
          <label className="amz-qty-label">
            Qty:{' '}
            <select
              className="amz-qty-select"
              value={safeQty}
              onChange={(e) => setQty(Number(e.target.value))}
            >
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <button
          type="button"
          className="amz-btn-cart"
          disabled={product.stock <= 0}
          onClick={() => addToCart(product.id, safeQty)}
        >
          Add to cart
        </button>
        <button
          type="button"
          className="amz-btn-buy"
          disabled={product.stock <= 0}
          onClick={() => {
            addToCart(product.id, safeQty);
            navigate('/checkout');
          }}
        >
          Buy now
        </button>
        <p style={{ margin: 0, fontSize: 12, color: '#565959' }}>
          Sign-in is only required at checkout to pay.
        </p>
      </aside>
    </div>
  );
}
