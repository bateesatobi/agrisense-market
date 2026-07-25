import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Menu, Search, ShoppingCart, Smartphone, Sprout, User } from 'lucide-react';
import { useMarket } from '../store/MarketStore';
import './client.css';

export function ClientLayout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { cartCount, customer, logoutCustomer } = useMarket();
  const [query, setQuery] = useState(params.get('q') ?? '');

  useEffect(() => {
    setQuery(params.get('q') ?? '');
  }, [params]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    const kind = params.get('kind');
    if (kind) next.set('kind', kind);
    if (query.trim()) next.set('q', query.trim());
    navigate(`/?${next.toString()}`);
  };

  return (
    <div className="client-shell amz">
      <header className="amz-header">
        <div className="amz-header-top">
          <Link to="/" className="amz-logo" onClick={() => setQuery('')}>
            <Sprout size={22} />
            <span>
              AgriSense
              <small>.market</small>
            </span>
          </Link>

          <div className="amz-deliver">
            <MapPin size={16} />
            <div>
              <span>Deliver to</span>
              <strong>Uganda</strong>
            </div>
          </div>

          <form className="amz-search" onSubmit={onSearch}>
            <select
              aria-label="Department"
              value={params.get('kind') ?? 'all'}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                if (e.target.value === 'all') next.delete('kind');
                else next.set('kind', e.target.value);
                navigate(`/?${next.toString()}`);
              }}
            >
              <option value="all">All</option>
              <option value="produce">Produce</option>
              <option value="input">Farm inputs</option>
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search maize, fertilizer, seeds, Tororo…"
              aria-label="Search marketplace"
            />
            <button type="submit" aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          <Link to={customer ? '/orders' : '/checkout'} className="amz-account">
            <User size={16} />
            <div>
              <span>Hello, {customer ? customer.name.split(' ')[0] : 'Guest'}</span>
              <strong>{customer ? 'Orders & account' : 'Sign in at checkout'}</strong>
            </div>
          </Link>

          {customer && (
            <button type="button" className="amz-signout" onClick={logoutCustomer}>
              Sign out
            </button>
          )}

          <Link to="/cart" className="amz-cart">
            <span className="amz-cart-count">{cartCount}</span>
            <ShoppingCart size={28} />
            <strong>Cart</strong>
          </Link>
        </div>

        <nav className="amz-subnav">
          <span className="amz-menu">
            <Menu size={16} /> All
          </span>
          <NavLink to="/" end>
            Today&apos;s deals
          </NavLink>
          <NavLink to="/?kind=produce">Fresh produce</NavLink>
          <NavLink to="/?kind=input">Farm inputs</NavLink>
          <NavLink to="/?kind=input&q=fertilizer">Fertilizer</NavLink>
          <NavLink to="/?kind=input&q=seed">Seeds</NavLink>
          <NavLink to="/download-app" className="amz-app-link">
            <Smartphone size={14} /> AgriSense app
          </NavLink>
          <NavLink to="/admin/login" className="amz-admin-link">
            Seller admin
          </NavLink>
        </nav>
      </header>

      <main className="amz-main">
        <Outlet />
      </main>

      <footer className="amz-footer">
        <button
          type="button"
          className="amz-back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top
        </button>
        <div className="amz-footer-grid container-wide">
          <div>
            <h4>Get to know us</h4>
            <p>AgriSense Market connects Ugandan farms with buyers of produce and farm inputs.</p>
          </div>
          <div>
            <h4>Make money with us</h4>
            <Link to="/admin/login">Sell on AgriSense</Link>
            <Link to="/download-app">List produce from the app</Link>
          </div>
          <div>
            <h4>Farm tools (mobile)</h4>
            <Link to="/download-app">Crop scan</Link>
            <Link to="/download-app">Soil pH & yield</Link>
            <Link to="/download-app">Weather advice</Link>
          </div>
          <div>
            <h4>Let us help you</h4>
            <Link to="/cart">Your cart</Link>
            <Link to="/orders">Your orders</Link>
            <p className="muted">Login only when you checkout to pay.</p>
          </div>
        </div>
        <div className="amz-footer-brand">
          <Sprout size={18} /> AgriSense Market · BUAIIR
        </div>
      </footer>
    </div>
  );
}
