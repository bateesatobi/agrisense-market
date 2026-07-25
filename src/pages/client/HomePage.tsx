import { Link } from 'react-router-dom';
import { ArrowRight, CloudSun, FlaskConical, ScanLine, Sprout, Tractor } from 'lucide-react';
import { formatUgx, useMarket } from '../../store/MarketStore';
import './home.css';

export function HomePage() {
  const { products, addToCart } = useMarket();
  const featured = products.filter((p) => p.active && p.featured).slice(0, 4);

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Uganda farm marketplace</p>
            <h1>
              Fresh <span>produce</span> & trusted <span>farm inputs</span>
            </h1>
            <p className="lede">
              Browse freely as a guest. Sign in only when you checkout to pay —
              simple, fast, and built for farmers and buyers.
            </p>
            <div className="hero-cta">
              <Link to="/shop?kind=produce" className="btn btn-primary">
                Shop produce <ArrowRight size={16} />
              </Link>
              <Link to="/shop?kind=input" className="btn btn-secondary">
                Buy farm inputs
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="orb orb-a" />
            <div className="orb orb-b" />
            <div className="hero-card">
              <Tractor size={28} />
              <strong>From field to buyer</strong>
              <span>Maize · Beans · Fertilizer · Seeds</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Featured this week</h2>
          <Link to="/shop">View all</Link>
        </div>
        <div className="card-grid">
          {featured.map((p) => (
            <article key={p.id} className="product-card">
              <div className="product-media">
                <span>{p.imageEmoji}</span>
                <span className={`badge ${p.kind === 'produce' ? 'badge-green' : 'badge-gold'}`} style={{ position: 'absolute', top: 10, left: 10 }}>
                  {p.kind === 'produce' ? 'Produce' : 'Input'}
                </span>
              </div>
              <div className="product-body">
                <h3>{p.title}</h3>
                <p className="muted">{p.location} · {p.seller}</p>
                <div className="price">
                  {formatUgx(p.priceUgx)} <small>/{p.unit}</small>
                  {p.compareAtPriceUgx && p.compareAtPriceUgx > p.priceUgx ? (
                    <div className="muted" style={{ fontSize: 13, textDecoration: 'line-through' }}>
                      {formatUgx(p.compareAtPriceUgx)}
                    </div>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Link to={`/product/${p.id}`} className="btn btn-secondary" style={{ flex: 1 }}>
                    View
                  </Link>
                  <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => addToCart(p.id)}>
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section app-cta">
        <div className="app-cta-panel">
          <div>
            <p className="eyebrow">Field intelligence</p>
            <h2>Scanning, soil pH, yield & weather live in the AgriSense app</h2>
            <p>
              This website is for marketplace shopping. For symptom scan, early spectrum scan,
              GPS soil pH, satellite yield mapping, and weather advice — download the mobile app.
            </p>
            <Link to="/download-app" className="btn btn-gold">
              Get the mobile app
            </Link>
          </div>
          <div className="tool-grid">
            {[
              { icon: ScanLine, label: 'Crop scan' },
              { icon: FlaskConical, label: 'Soil pH' },
              { icon: Sprout, label: 'Yield map' },
              { icon: CloudSun, label: 'Weather' },
            ].map((t) => (
              <div key={t.label} className="tool-tile">
                <t.icon size={22} />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
