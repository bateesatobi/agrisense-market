import { Link } from 'react-router-dom';
import { formatUgx, useMarket } from '../../store/MarketStore';
import { getPrimaryImage } from '../../utils/productImages';

export function CartPage() {
  const { cart, products, setCartQty, removeFromCart, cartTotal } = useMarket();
  const lines = cart
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? { line, product } : null;
    })
    .filter(Boolean) as Array<{
    line: { productId: string; quantity: number };
    product: (typeof products)[number];
  }>;

  const delivery = cartTotal >= 200000 ? 0 : lines.length ? 15000 : 0;

  if (!lines.length) {
    return (
      <div className="container-wide" style={{ padding: '1.5rem 0' }}>
        <div className="amz-cart-list">
          <h1>Your AgriSense Cart is empty</h1>
          <p style={{ color: '#565959' }}>
            Guest browsing is open — add produce or farm inputs, then sign in only to pay.
          </p>
          <Link
            to="/"
            className="amz-btn-cart"
            style={{ display: 'inline-block', width: 'auto', marginTop: 8, padding: '0.5rem 1.2rem' }}
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="amz-cart-page">
      <div className="amz-cart-list">
        <h1>Shopping Cart</h1>
        <p style={{ margin: 0, color: '#565959', fontSize: 14, textAlign: 'right' }}>Price</p>
        {lines.map(({ line, product }) => (
          <div key={line.productId} className="amz-cart-line">
            <div className="amz-cart-thumb">
              <img src={getPrimaryImage(product)} alt={product.title} />
            </div>
            <div>
              <Link
                to={`/product/${product.id}`}
                style={{ fontSize: 18, color: '#0f1111', fontWeight: 500 }}
              >
                {product.title}
              </Link>
              <div style={{ color: '#007600', fontSize: 13, marginTop: 4 }}>In stock</div>
              <div style={{ fontSize: 13, color: '#565959' }}>
                {product.kind === 'produce' ? 'Produce' : 'Farm input'} · {product.unit}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                <select
                  value={line.quantity}
                  onChange={(e) => setCartQty(line.productId, Number(e.target.value))}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d5d9d9' }}
                >
                  {Array.from({ length: Math.min(30, product.stock) }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        Qty: {n}
                      </option>
                    ),
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.productId)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#007185',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <strong style={{ fontSize: 18 }}>
              {formatUgx(product.priceUgx * line.quantity)}
            </strong>
          </div>
        ))}
      </div>

      <aside className="amz-cart-subtotal">
        <div style={{ fontSize: 18, marginBottom: 8 }}>
          Subtotal ({lines.reduce((s, l) => s + l.line.quantity, 0)} items):{' '}
          <strong>{formatUgx(cartTotal)}</strong>
        </div>
        <div style={{ fontSize: 13, color: '#565959', marginBottom: 12 }}>
          Est. delivery: {delivery === 0 ? 'FREE' : formatUgx(delivery)}
        </div>
        <Link to="/checkout" className="amz-btn-buy">
          Proceed to checkout
        </Link>
        <p style={{ fontSize: 12, color: '#565959', marginTop: 10 }}>
          Account required only when you pay.
        </p>
      </aside>
    </div>
  );
}
