import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  Boxes,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react';
import { useMarket } from '../store/MarketStore';
import './admin.css';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin': {
    title: 'Overview',
    subtitle: 'Marketplace health at a glance',
  },
  '/admin/products': {
    title: 'Catalogue',
    subtitle: 'Manage produce and farm inputs',
  },
  '/admin/orders': {
    title: 'Fulfilment',
    subtitle: 'Track orders, payments and refunds',
  },
  '/admin/users': {
    title: 'People',
    subtitle: 'Customers and admin accounts',
  },
  '/admin/revenue': {
    title: 'Finance',
    subtitle: 'Revenue trends and payment mix',
  },
  '/admin/disbursements': {
    title: 'Disbursements',
    subtitle: 'Pay sellers for online marketplace sales',
  },
};

export function AdminLayout() {
  const { admin, logoutAdmin } = useMarket();
  const { pathname } = useLocation();
  if (!admin) return <Navigate to="/admin/login" replace />;

  const meta = TITLES[pathname] ?? TITLES['/admin'];

  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <div className="admin-brand">
          <strong>AgriSense</strong>
          <span>Admin console</span>
        </div>
        <nav>
          <Link to="/admin" className={pathname === '/admin' ? 'active' : undefined}>
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link
            to="/admin/products"
            className={pathname.startsWith('/admin/products') ? 'active' : undefined}
          >
            <Package size={18} /> Products
          </Link>
          <Link
            to="/admin/orders"
            className={pathname.startsWith('/admin/orders') ? 'active' : undefined}
          >
            <Receipt size={18} /> Orders
          </Link>
          <Link
            to="/admin/users"
            className={pathname.startsWith('/admin/users') ? 'active' : undefined}
          >
            <Users size={18} /> Users
          </Link>
          <Link
            to="/admin/revenue"
            className={pathname.startsWith('/admin/revenue') ? 'active' : undefined}
          >
            <Wallet size={18} /> Revenue
          </Link>
          <Link
            to="/admin/disbursements"
            className={pathname.startsWith('/admin/disbursements') ? 'active' : undefined}
          >
            <HandCoins size={18} /> Disbursements
          </Link>
        </nav>
        <button type="button" className="admin-logout" onClick={logoutAdmin}>
          <LogOut size={16} /> Sign out
        </button>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <div>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="admin-user">
            <Boxes size={16} />
            {admin.name}
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
