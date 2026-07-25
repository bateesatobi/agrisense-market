export type ProductKind = 'produce' | 'input';

export type Product = {
  id: string;
  kind: ProductKind;
  title: string;
  category: string;
  description: string;
  priceUgx: number;
  /**
   * List / reference price (Amazon “List Price”).
   * When higher than priceUgx, cards show strikethrough + % off.
   */
  compareAtPriceUgx?: number;
  unit: string;
  stock: number;
  /** Fallback glyph when no photo URL is available */
  imageEmoji: string;
  /** Product photos (Amazon-style gallery). Prefer https image URLs. */
  images: string[];
  seller: string;
  location: string;
  featured?: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserRole = 'customer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  createdAt: string;
  active: boolean;
};

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/** Checkout payment channels */
export type PaymentMethod = 'mtn' | 'airtel' | 'card' | 'cash';

export type OrderItem = {
  productId: string;
  title: string;
  unit: string;
  quantity: number;
  unitPriceUgx: number;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotalUgx: number;
  deliveryUgx: number;
  totalUgx: number;
  status: OrderStatus;
  deliveryAddress: string;
  district: string;
  paymentRef: string;
  /** Pesapal method used at checkout */
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  refundedUgx?: number;
  refundNote?: string;
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export type SessionUser = Omit<User, 'password'>;
