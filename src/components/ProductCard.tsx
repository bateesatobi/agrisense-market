import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { AmzPrice, DealBadge } from './AmzPrice';
import { useMarket } from '../store/MarketStore';
import { getPrimaryImage } from '../utils/productImages';
import { DELIVERY_PERIOD_LABELS, type Product } from '../types';

function ratingFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 3)) % 50;
  const rating = 3.8 + (h % 12) / 10;
  const reviews = 12 + (h % 40) * 7;
  return { rating: Math.min(4.9, rating), reviews };
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className="amz-stars" aria-label={`${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < full ? '#de7921' : 'transparent'}
          color="#de7921"
        />
      ))}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useMarket();
  const { rating, reviews } = ratingFromId(product.id);
  const cover = getPrimaryImage(product);
  const deliveryMode = product.deliveryMode || 'paid';
  const periodLabel =
    product.deliveryPeriod && DELIVERY_PERIOD_LABELS[product.deliveryPeriod]
      ? DELIVERY_PERIOD_LABELS[product.deliveryPeriod]
      : DELIVERY_PERIOD_LABELS['3_days'];

  return (
    <article className="amz-card">
      <Link to={`/product/${product.id}`} className="amz-card-media">
        <DealBadge
          priceUgx={product.priceUgx}
          compareAtPriceUgx={product.compareAtPriceUgx}
        />
        <img src={cover} alt={product.title} />
      </Link>
      <div className="amz-card-body">
        <Link to={`/product/${product.id}`} className="amz-card-title">
          {product.title}
        </Link>
        <div className="amz-stars">
          <Stars rating={rating} />
          <span>{reviews}</span>
        </div>
        <AmzPrice
          priceUgx={product.priceUgx}
          compareAtPriceUgx={product.compareAtPriceUgx}
          unit={product.unit}
          size="card"
        />
        <div className="amz-card-meta">
          <span className={`amz-delivery-pill ${deliveryMode === 'free' ? 'is-free' : 'is-paid'}`}>
            {deliveryMode === 'free' ? 'Free delivery' : 'Delivery fee applies'}
          </span>
          <span className="amz-delivery-period">Arrives in {periodLabel}</span>
        </div>
        <div className="amz-prime">
          {product.kind === 'produce' ? 'Farm-fresh produce' : 'Verified farm input'}
        </div>
        <div className="amz-ship">
          Ships from {product.location || 'Uganda'} · {product.stock > 0 ? 'In stock' : 'Out of stock'}
        </div>
        <button
          type="button"
          className="amz-btn-cart"
          disabled={product.stock <= 0}
          onClick={() => addToCart(product.id)}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

export { ratingFromId, Stars };
