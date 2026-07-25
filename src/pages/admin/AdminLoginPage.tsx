import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useMarket } from '../../store/MarketStore';

export function AdminLoginPage() {
  const { admin, loginAdmin } = useMarket();
  const [email, setEmail] = useState('admin@agrisense.ug');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  if (admin) return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(await loginAdmin(email, password));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(160deg,#0f1a12,#1b5e20)',
      }}
    >
      <form className="panel" style={{ width: 'min(420px, 100%)' }} onSubmit={onSubmit}>
        <h2 style={{ marginTop: 0 }}>Admin sign in</h2>
        <p className="muted">Manage products, orders, users, revenue and refunds.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Enter console
        </button>
        <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
          Demo: admin@agrisense.ug / admin123
        </p>
      </form>
    </div>
  );
}
