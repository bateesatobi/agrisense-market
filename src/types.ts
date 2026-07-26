export type ProductKind = 'produce' | 'input';

export type DeliveryMode = 'free' | 'paid';
export type DeliveryPeriod = '24_hours' | '3_days' | '1_week';

export const DELIVERY_PERIOD_LABELS: Record<DeliveryPeriod, string> = {
  '24_hours': '24 hours',
  '3_days': '3 days',
  '1_week': '1 week',
};

export type MarketCategory = {
  id: string;
  name: string;
  kind: ProductKind;
  description: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
};

export type MarketUnit = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
};

export type Product = {
  id: string;
  kind: ProductKind;
  title: string;
  category: string;
  categoryId?: string;
  description: string;
  /**
   * List / reference price derived from discount %.
   * When higher than priceUgx, cards show strikethrough + % off.
   */
  compareAtPriceUgx?: number;
  /** Discount percent applied to list price (1–99). */
  discountPercent?: number;
  priceUgx: number;
  unit: string;
  unitId?: string;
  stock: number;
  /** Fallback glyph when no photo URL is available */
  imageEmoji: string;
  /** Product photos — https URLs and/or data: URIs */
  images: string[];
  /** Explicit remote image URLs persisted on the product */
  imageUrls?: string[];
  seller: string;
  location: string;
  featured?: boolean;
  active: boolean;
  deliveryMode?: DeliveryMode;
  deliveryPeriod?: DeliveryPeriod;
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
  area?: string;
  orderCount?: number;
  spendUgx?: number;
  payoutPhone?: string;
  payoutMethod?: string;
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
