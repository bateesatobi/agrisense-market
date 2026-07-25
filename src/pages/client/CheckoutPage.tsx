import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PesapalPaymentPicker } from '../../components/PesapalPaymentPicker';
import {
  chargeViaPesapal,
  type PesapalMethod,
} from '../../services/pesapal';
import { formatUgx, useMarket } from '../../store/MarketStore';

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    customer,
    cart,
    cartTotal,
    products,
    loginCustomer,
    registerCustomer,
    placeOrder,
  } = useMarket();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [successMethod, setSuccessMethod] = useState<string | null>(null);
  const [successTotal, setSuccessTotal] = useState<number | null>(null);
  const [successCash, setSuccessCash] = useState(false);
  const [paying, setPaying] = useState(false);

  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [delivery, setDelivery] = useState({ address: '', district: '' });
  const [payMethod, setPayMethod] = useState<PesapalMethod>('mtn');
  const [momoPhone, setMomoPhone] = useState('');
  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    if (customer?.phone) setMomoPhone((prev) => prev || customer.phone);
  }, [customer?.phone]);

  if (!cart.length && !successId) {
    return (
      <div className="container section">
        <h2>Nothing to checkout</h2>
        <Link to="/" className="btn btn-primary">
          Browse marketplace
        </Link>
      </div>
    );
  }

  if (successId) {
    return (
      <div className="container section">
        <div className="panel" style={{ maxWidth: 560 }}>
          <div className="alert alert-ok">
            {successCash ? 'Order placed — pay cash on delivery' : 'Pesapal payment completed'}
          </div>
          <h2>Order {successId}</h2>
          <p className="muted" style={{ marginBottom: 8 }}>
            {successCash ? (
              <>
                Pay <strong>{successTotal != null ? formatUgx(successTotal) : ''}</strong> in cash
                when your order arrives ({successMethod}).
              </>
            ) : (
              <>
                Paid with <strong>{successMethod}</strong>
                {successTotal != null ? <> · {formatUgx(successTotal)}</> : null}
              </>
            )}
          </p>
          <p className="muted">
            Reference: <strong>{successRef}</strong>
          </p>
          <p className="muted" style={{ fontSize: 13 }}>
            You can track fulfilment anytime under Your orders.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to={`/orders/${successId}`} className="btn btn-primary">
              Track this order
            </Link>
            <Link to="/orders" className="btn btn-secondary">
              All orders
            </Link>
            <Link to="/" className="btn btn-secondary">
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deliveryFee = cartTotal >= 200000 ? 0 : 15000;
  const total = cartTotal + deliveryFee;

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(await loginCustomer(loginForm.id, loginForm.password));
  };

  const onRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(await registerCustomer(regForm));
  };

  const onPay = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer || paying) return;
    setOrderError(null);
    setPaying(true);

    try {
      const phone = momoPhone.trim() || customer.phone;
      const charged = await chargeViaPesapal({
        amountUgx: total,
        method: payMethod,
        phone,
        cardName: card.name,
        cardNumber: card.number,
        cardExpiry: card.expiry,
        cardCvv: card.cvv,
        customerEmail: customer.email,
        description: `AgriSense order (${cart.length} lines)`,
      });

      if (charged.ok === false) {
        setOrderError(charged.error);
        return;
      }

      const result = await placeOrder({
        deliveryAddress: delivery.address,
        district: delivery.district,
        paymentRef: charged.paymentRef,
        paymentMethod: charged.method,
        paymentTrackingId: charged.trackingId,
        merchantReference: charged.merchantReference,
      });

      if (result.ok === false) {
        setOrderError(result.error);
        return;
      }

      setSuccessId(result.order.id);
      setSuccessRef(charged.paymentRef);
      setSuccessMethod(charged.methodLabel);
      setSuccessTotal(result.order.totalUgx);
      setSuccessCash(charged.payOnDelivery);
      navigate('/checkout', { replace: true });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container section">
      <h2>Checkout</h2>
      <p className="muted">Sign in or create an account to pay — required only at this step.</p>

      <div className="amz-checkout-grid">
        <div className="panel">
          {!customer ? (
            <>
              <div className="chip-row" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className={`chip ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`chip ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  Create account
                </button>
              </div>

              {authError && <div className="alert alert-error">{authError}</div>}

              {mode === 'login' ? (
                <form onSubmit={onLogin}>
                  <div className="field">
                    <label>Phone or email</label>
                    <input
                      value={loginForm.id}
                      onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
                      placeholder="amina@example.com"
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="farmer123"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Continue to payment
                  </button>
                  <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                    Demo: amina@example.com / farmer123
                  </p>
                </form>
              ) : (
                <form onSubmit={onRegister}>
                  <div className="field">
                    <label>Full name</label>
                    <input
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Create & continue
                  </button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={onPay}>
              <div className="alert alert-ok" style={{ marginBottom: 12 }}>
                Signed in as {customer.name} ({customer.phone})
              </div>
              {orderError && <div className="alert alert-error">{orderError}</div>}
              <div className="field">
                <label>Delivery address</label>
                <input
                  value={delivery.address}
                  onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                  placeholder="Trading centre / village"
                  required
                  disabled={paying}
                />
              </div>
              <div className="field">
                <label>District</label>
                <input
                  value={delivery.district}
                  onChange={(e) => setDelivery({ ...delivery, district: e.target.value })}
                  placeholder="Tororo"
                  required
                  disabled={paying}
                />
              </div>

              <PesapalPaymentPicker
                value={payMethod}
                onChange={setPayMethod}
                disabled={paying}
              />

              {payMethod === 'mtn' || payMethod === 'airtel' ? (
                <div className="field">
                  <label>
                    {payMethod === 'mtn' ? 'MTN MoMo number' : 'Airtel Money number'}
                  </label>
                  <input
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="0772 123 456"
                    inputMode="tel"
                    disabled={paying}
                  />
                  <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>
                    Pesapal will send a payment prompt to this phone.
                  </p>
                </div>
              ) : payMethod === 'card' ? (
                <>
                  <div className="field">
                    <label>Name on card</label>
                    <input
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      placeholder="Amina Namukasa"
                      disabled={paying}
                      autoComplete="cc-name"
                    />
                  </div>
                  <div className="field">
                    <label>Card number</label>
                    <input
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                      placeholder="4111 1111 1111 1111"
                      inputMode="numeric"
                      disabled={paying}
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="pesa-card-row">
                    <div className="field">
                      <label>Expiry (MM/YY)</label>
                      <input
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                        placeholder="12/28"
                        disabled={paying}
                        autoComplete="cc-exp"
                      />
                    </div>
                    <div className="field">
                      <label>CVV</label>
                      <input
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                        placeholder="123"
                        inputMode="numeric"
                        disabled={paying}
                        autoComplete="cc-csc"
                      />
                    </div>
                  </div>
                  <p className="muted" style={{ marginTop: 0, fontSize: 12 }}>
                    Demo card: 4111 1111 1111 1111 · any future expiry · any CVV
                  </p>
                </>
              ) : (
                <div className="alert alert-ok" style={{ marginBottom: 12 }}>
                  Have exact cash ready for the delivery agent. Your order is confirmed now; payment
                  is collected on arrival.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-gold"
                style={{ width: '100%' }}
                disabled={paying}
              >
                {paying
                  ? payMethod === 'cash'
                    ? 'Confirming cash order…'
                    : payMethod === 'card'
                      ? 'Processing card with Pesapal…'
                      : 'Waiting for Pesapal MoMo approval…'
                  : payMethod === 'cash'
                    ? `Place order · Pay ${formatUgx(total)} cash on delivery`
                    : `Pay ${formatUgx(total)} with Pesapal`}
              </button>
            </form>
          )}
        </div>

        <aside className="panel">
          <h3 style={{ marginTop: 0 }}>Order summary</h3>
          {cart.map((line) => {
            const p = products.find((x) => x.id === line.productId);
            if (!p) return null;
            return (
              <div
                key={line.productId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '0.45rem 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>
                  {p.title} × {line.quantity}
                </span>
                <strong>{formatUgx(p.priceUgx * line.quantity)}</strong>
              </div>
            );
          })}
          <div style={{ marginTop: 12 }} className="muted">
            Delivery: {deliveryFee === 0 ? 'Free' : formatUgx(deliveryFee)}
          </div>
          <div className="price" style={{ marginTop: 6 }}>
            {formatUgx(total)}
          </div>
          <p className="muted" style={{ marginTop: 14, fontSize: 12 }}>
            Pay with Pesapal (MTN MoMo, Airtel Money, or card) or choose cash on delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
