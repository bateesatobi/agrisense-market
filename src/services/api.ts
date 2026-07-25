/** AgriSense market API client — talks to Agrobackend FastAPI. */
import type {
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductKind,
  SessionUser,
  User,
} from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://147.93.116.6:8090';

const TOKEN_KEY = 'agrisense_market_token';
const ADMIN_TOKEN_KEY = 'agrisense_market_admin_token';

export function getApiUrl() {
  return API_URL;
}

export function getCustomerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setCustomerToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

type ApiProduct = {
  id: string;
  kind: string;
  title: string;
  category: string;
  description: string;
  price_ugx: number;
  compare_at_price_ugx?: number | null;
  unit: string;
  stock: number;
  image_emoji?: string | null;
  images?: string[];
  seller_name?: string;
  seller_id?: string;
  location: string;
  featured?: boolean;
  active: boolean;
  created_at: string;
  updated_at?: string | null;
};

type ApiOrder = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Array<{
    product_id: string;
    title: string;
    unit: string;
    quantity: number;
    unit_price_ugx: number;
  }>;
  subtotal_ugx: number;
  delivery_ugx: number;
  total_ugx: number;
  status: OrderStatus;
  delivery_address: string;
  district: string;
  payment_ref: string;
  payment_method?: PaymentMethod;
  created_at: string;
  updated_at?: string | null;
  refunded_ugx?: number | null;
  refund_note?: string | null;
};

type ApiMe = {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  role: string;
  active?: boolean;
  created_at: string;
};

type ApiAdminUser = {
  id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  role: string;
  active: boolean;
  created_at?: string | null;
  order_count?: number;
  spend_ugx?: number;
};

async function request<T>(
  path: string,
  opts: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail =
      typeof data === 'object' && data && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : text || res.statusText;
    throw new Error(detail);
  }
  return data as T;
}

export function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    kind: (p.kind as ProductKind) || 'produce',
    title: p.title,
    category: p.category,
    description: p.description || '',
    priceUgx: p.price_ugx,
    compareAtPriceUgx: p.compare_at_price_ugx ?? undefined,
    unit: p.unit,
    stock: p.stock,
    imageEmoji: p.image_emoji || '🛒',
    images: Array.isArray(p.images) ? p.images : [],
    seller: p.seller_name || '',
    location: p.location || '',
    featured: !!p.featured,
    active: !!p.active,
    createdAt: typeof p.created_at === 'string' ? p.created_at : new Date(p.created_at).toISOString(),
    updatedAt: p.updated_at
      ? typeof p.updated_at === 'string'
        ? p.updated_at
        : new Date(p.updated_at).toISOString()
      : typeof p.created_at === 'string'
        ? p.created_at
        : new Date().toISOString(),
  };
}

export function mapOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    userId: o.user_id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    items: (o.items || []).map((i) => ({
      productId: i.product_id,
      title: i.title,
      unit: i.unit,
      quantity: i.quantity,
      unitPriceUgx: i.unit_price_ugx,
    })),
    subtotalUgx: o.subtotal_ugx,
    deliveryUgx: o.delivery_ugx,
    totalUgx: o.total_ugx,
    status: o.status,
    deliveryAddress: o.delivery_address,
    district: o.district,
    paymentRef: o.payment_ref,
    paymentMethod: o.payment_method,
    createdAt:
      typeof o.created_at === 'string' ? o.created_at : new Date(o.created_at).toISOString(),
    updatedAt: o.updated_at
      ? typeof o.updated_at === 'string'
        ? o.updated_at
        : new Date(o.updated_at).toISOString()
      : typeof o.created_at === 'string'
        ? o.created_at
        : new Date().toISOString(),
    refundedUgx: o.refunded_ugx ?? undefined,
    refundNote: o.refund_note ?? undefined,
  };
}

function mapSession(me: ApiMe): SessionUser {
  return {
    id: me.id,
    name: me.name,
    email: me.email || '',
    phone: me.phone_number,
    role: me.role === 'admin' ? 'admin' : 'customer',
    createdAt:
      typeof me.created_at === 'string' ? me.created_at : new Date(me.created_at).toISOString(),
    active: me.active !== false,
  };
}

function mapAdminUser(u: ApiAdminUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email || '',
    phone: u.phone_number,
    role: u.role === 'admin' ? 'admin' : 'customer',
    password: '',
    createdAt: u.created_at
      ? typeof u.created_at === 'string'
        ? u.created_at
        : new Date(u.created_at).toISOString()
      : new Date().toISOString(),
    active: u.active,
  };
}

export const marketApi = {
  async listProducts(params?: { kind?: string; q?: string }) {
    const qs = new URLSearchParams();
    if (params?.kind) qs.set('kind', params.kind);
    if (params?.q) qs.set('q', params.q);
    qs.set('limit', '200');
    const data = await request<{ items: ApiProduct[]; total: number }>(
      `/market/products?${qs.toString()}`,
    );
    return data.items.map(mapProduct);
  },

  async login(emailOrPhone: string, password: string) {
    const key = emailOrPhone.trim();
    const body = key.includes('@')
      ? { email: key.toLowerCase(), password }
      : { phone_number: key, password };
    const tok = await request<{ access_token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return tok.access_token;
  },

  async register(data: { name: string; email: string; phone: string; password: string }) {
    await request('/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        phone_number: data.phone,
        password: data.password,
        area: 'Uganda',
        email: data.email,
        role: 'customer',
        profile_complete: false,
      }),
    });
    return this.login(data.phone, data.password);
  },

  async me(token: string) {
    const me = await request<ApiMe>('/me', { token });
    return mapSession(me);
  },

  async myOrders(token: string) {
    const data = await request<{ items: ApiOrder[] }>('/market/orders', { token });
    return data.items.map(mapOrder);
  },

  async adminOrders(token: string) {
    const data = await request<{ items: ApiOrder[] }>('/market/admin/orders', { token });
    return data.items.map(mapOrder);
  },

  async adminUsers(token: string) {
    const data = await request<ApiAdminUser[]>('/market/admin/users', { token });
    return data.map(mapAdminUser);
  },

  async quote(
    token: string,
    items: Array<{ product_id: string; quantity: number }>,
  ) {
    return request<{
      quote_id: string;
      total_ugx: number;
      subtotal_ugx: number;
      delivery_ugx: number;
    }>('/market/checkout/quote', {
      method: 'POST',
      token,
      body: JSON.stringify({ items }),
    });
  },

  async charge(
    token: string,
    payload: {
      amount_ugx: number;
      method: 'mtn' | 'airtel' | 'card';
      phone?: string;
      card?: Record<string, string>;
      quote_id?: string;
    },
  ) {
    return request<{
      ok: boolean;
      payment_ref: string;
      tracking_id: string;
      merchant_reference: string;
      method: string;
    }>('/market/payments/charge', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  async createOrder(
    token: string,
    payload: {
      items: Array<{ product_id: string; quantity: number }>;
      delivery_address: string;
      district: string;
      payment_method: PaymentMethod;
      payment_ref: string;
      quote_id?: string;
      payment_tracking_id?: string;
      merchant_reference?: string;
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
    },
  ) {
    const order = await request<ApiOrder>('/market/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
    return mapOrder(order);
  },

  async upsertProduct(
    token: string,
    product: Omit<Product, 'createdAt' | 'updatedAt'> & { createdAt?: string },
    isNew: boolean,
  ) {
    const body = {
      kind: product.kind,
      title: product.title,
      category: product.category,
      description: product.description,
      price_ugx: product.priceUgx,
      compare_at_price_ugx: product.compareAtPriceUgx,
      unit: product.unit,
      stock: product.stock,
      image_emoji: product.imageEmoji,
      images_base64: (product.images || []).filter(
        (img) => img.startsWith('data:') || (!img.startsWith('http') && img.length > 100),
      ),
      location: product.location,
      featured: product.featured,
      active: product.active,
    };
    // If images look like URLs only, still send empty — backend keeps existing on patch
    if (isNew) {
      const created = await request<ApiProduct>('/market/products', {
        method: 'POST',
        token,
        body: JSON.stringify(body),
      });
      return mapProduct(created);
    }
    const patched = await request<ApiProduct>(`/market/products/${product.id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        ...body,
        images_base64: body.images_base64.length ? body.images_base64 : undefined,
      }),
    });
    return mapProduct(patched);
  },

  async deleteProduct(token: string, id: string) {
    await request(`/market/products/${id}`, { method: 'DELETE', token });
  },

  async updateOrderStatus(token: string, id: string, status: OrderStatus) {
    const order = await request<ApiOrder>(`/market/admin/orders/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
    return mapOrder(order);
  },

  async refundOrder(token: string, id: string, amountUgx: number, note: string) {
    const order = await request<ApiOrder>(`/market/admin/orders/${id}/refund`, {
      method: 'POST',
      token,
      body: JSON.stringify({ amount_ugx: amountUgx, note }),
    });
    return mapOrder(order);
  },

  async upsertUser(token: string, user: User, isNew: boolean) {
    if (isNew) {
      const created = await request<ApiAdminUser>('/market/admin/users', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: user.name,
          phone_number: user.phone,
          password: user.password || 'changeme123',
          email: user.email,
          role: user.role === 'admin' ? 'admin' : 'customer',
          active: user.active,
        }),
      });
      return mapAdminUser(created);
    }
    const patched = await request<ApiAdminUser>(`/market/admin/users/${user.id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        name: user.name,
        phone_number: user.phone,
        email: user.email,
        role: user.role === 'admin' ? 'admin' : 'customer',
        active: user.active,
      }),
    });
    if (user.password) {
      await request(`/market/admin/users/${user.id}/password`, {
        method: 'POST',
        token,
        body: JSON.stringify({ password: user.password }),
      });
    }
    return mapAdminUser(patched);
  },

  async deleteUser(token: string, id: string) {
    await request(`/market/admin/users/${id}`, { method: 'DELETE', token });
  },

  async previewDisbursements(token: string, sellerIds?: string[]) {
    return request<{
      items: Array<{
        seller_id: string;
        seller_name: string;
        order_ids: string[];
        gross_ugx: number;
        platform_fee_ugx: number;
        net_ugx: number;
        destination: string;
      }>;
    }>('/market/admin/disbursements/preview', {
      method: 'POST',
      token,
      body: JSON.stringify({ seller_ids: sellerIds ?? null }),
    });
  },

  async listDisbursements(token: string, status?: string) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<
      Array<{
        id: string;
        seller_id: string;
        seller_name: string;
        order_ids: string[];
        gross_ugx: number;
        platform_fee_ugx: number;
        net_ugx: number;
        method: string;
        destination: string;
        status: string;
        payment_ref?: string | null;
        error?: string | null;
        created_at: string;
        paid_at?: string | null;
      }>
    >(`/market/admin/disbursements${qs}`, { token });
  },

  async createDisbursements(
    token: string,
    items: Array<{
      seller_id: string;
      order_ids: string[];
      destination: string;
      method: 'mtn' | 'airtel' | 'bank';
    }>,
  ) {
    return request<
      Array<{
        id: string;
        seller_id: string;
        seller_name: string;
        order_ids: string[];
        gross_ugx: number;
        platform_fee_ugx: number;
        net_ugx: number;
        method: string;
        destination: string;
        status: string;
        payment_ref?: string | null;
        created_at: string;
      }>
    >('/market/admin/disbursements', {
      method: 'POST',
      token,
      body: JSON.stringify({ items }),
    });
  },

  async payDisbursement(token: string, id: string) {
    return request<{
      id: string;
      status: string;
      payment_ref?: string | null;
      error?: string | null;
      paid_at?: string | null;
      net_ugx: number;
      seller_name: string;
    }>(`/market/admin/disbursements/${id}/pay`, {
      method: 'POST',
      token,
    });
  },
};
