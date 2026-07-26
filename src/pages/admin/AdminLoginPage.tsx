import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useMarket } from '../../store/MarketStore';
import {
  closeLoginProgress,
  openLoginProgress,
  setLoginProgress,
  swalError,
  swalSuccess,
} from '../../utils/swal';

export function AdminLoginPage() {
  const { admin, loginAdmin } = useMarket();
  const [email, setEmail] = useState('admin@agrisense.ug');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (admin && !busy) return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    openLoginProgress();
    const err = await loginAdmin(email, password, setLoginProgress);
    if (err) {
      closeLoginProgress();
      setError(err);
      await swalError('Sign-in failed', err);
      setBusy(false);
      return;
    }
    setLoginProgress(100, 'Ready');
    closeLoginProgress();
    await swalSuccess('Welcome back', 'Admin console is ready.');
    setBusy(false);
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
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Enter console'}
        </button>
        <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
          Demo: admin@agrisense.ug / admin123
        </p>
      </form>
    </div>
  );
}
