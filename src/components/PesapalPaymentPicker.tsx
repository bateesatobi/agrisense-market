import type { PesapalMethod } from '../services/pesapal';
import { PESAPAL_METHODS } from '../services/pesapal';
import './PesapalPaymentPicker.css';

type Props = {
  value: PesapalMethod;
  onChange: (method: PesapalMethod) => void;
  disabled?: boolean;
};

export function PesapalPaymentPicker({ value, onChange, disabled }: Props) {
  return (
    <div className="pesa-wrap">
      <div className="pesa-brand">
        <span className="pesa-mark">Payment</span>
        <span className="pesa-secure">Pesapal · Cash on delivery</span>
      </div>
      <div className="pesa-grid" role="radiogroup" aria-label="Pesapal payment method">
        {PESAPAL_METHODS.map((m) => {
          const active = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              className={`pesa-option pesa-${m.id} ${active ? 'active' : ''}`}
              onClick={() => onChange(m.id)}
            >
              <span className="pesa-radio" aria-hidden />
              <span className="pesa-copy">
                <strong>{m.label}</strong>
                <small>{m.hint}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
