import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';

export type AdminMenuItem = {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type Props = {
  items: AdminMenuItem[];
  label?: string;
};

export function AdminRowMenu({ items, label = 'Actions' }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="admin-menu" ref={rootRef}>
      <button
        type="button"
        className="admin-menu-trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={18} />
      </button>
      {open ? (
        <div className="admin-menu-panel" role="menu" id={menuId}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`admin-menu-item ${item.tone === 'danger' ? 'danger' : ''}`}
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
};

export function AdminModal({ open, title, onClose, children, wide, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal-root" role="presentation">
      <button type="button" className="admin-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div
        className={`admin-modal-panel ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer ? <div className="admin-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
