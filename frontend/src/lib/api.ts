const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Error type ─────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      body.detail ??
      body.non_field_errors?.[0] ??
      Object.values(body).flat().join(" ") ??
      `HTTP ${res.status}`;
    throw new ApiError(res.status, String(msg));
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  phone_number: string;
  is_email_verified: boolean;
  date_joined: string;
  shop_slug?: string;
}

export interface SellerProfile {
  id: number;
  user: User;
  store_name: string;
  store_description: string;
  location: string;
  categories: string[];
  approval_status: "pending" | "approved" | "rejected";
  is_live: boolean;
  created_at: string;
}

export interface BuyerProfile {
  id: number;
  user: User;
  location: string;
  main_supplier: string;
  business_type: string;
  created_at: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface ApiProduct {
  id: number;
  seller: number;
  seller_username: string;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  stock_quantity?: number;       // seller-only
  availability_label: "available" | "can_be_sourced" | "not_available";
  status: "available" | "out_of_stock" | "draft";
  is_active?: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: number;
  is_sourcing?: boolean;
}

export interface ApiOrder {
  id: number;
  buyer: number;
  buyer_username: string;
  seller?: number;
  status: string;
  total_price: string;
  delivery_address: string;
  buyer_notes: string;
  sourcing_notes?: string;
  notes?: string;
  locked_at?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: number;
  entry_type: "charge" | "payment_credit" | "correction";
  amount: string;
  order_id?: number;
  note?: string;
  reference_code?: string;
  created_at: string;
}

export interface BuyerLedger {
  buyer_id: number;
  buyer_name: string;
  total_charged: string;
  total_paid: string;
  balance: string;
  entries: LedgerEntry[];
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: "buyer" | "seller";
  // buyer
  location?: string;
  main_supplier?: string;
  business_type?: string;
  // seller
  shop_name?: string;
  shop_location?: string;
  categories?: string[];
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login: (identifier: string, password: string) =>
    request<{ user: User }>("/api/accounts/login/", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  register: (data: RegisterPayload) =>
    request<{ user: User; message: string }>("/api/accounts/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    request("/api/accounts/logout/", { method: "POST" }),

  me: () =>
    request<User>("/api/accounts/me/"),
};

// ── Sellers (buyer-facing: browse & connect) ──────────────────────────────────
export const sellers = {
  list: () =>
    request<SellerProfile[]>("/api/accounts/sellers/"),

  get: (id: number) =>
    request<SellerProfile>(`/api/accounts/sellers/${id}/`),

  requestAccess: (sellerId: number) =>
    request(`/api/accounts/sellers/${sellerId}/request-access/`, { method: "POST" }),

  approveRelationship: (relId: number) =>
    request(`/api/accounts/relationships/${relId}/approve/`, { method: "POST" }),

  denyRelationship: (relId: number) =>
    request(`/api/accounts/relationships/${relId}/deny/`, { method: "POST" }),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const products = {
  // Buyer: browse a seller's storefront
  list: (params?: { seller?: number; category?: string | number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.seller)   q.set("seller",   String(params.seller));
    if (params?.category) q.set("category", String(params.category));
    if (params?.search)   q.set("search",   params.search);
    const qs = q.toString();
    return request<ApiProduct[]>(`/api/products/${qs ? `?${qs}` : ""}`);
  },

  // Seller: own product list (includes stock_quantity)
  mine: () =>
    request<ApiProduct[]>("/api/products/mine/"),

  categories: () =>
    request<ApiCategory[]>("/api/products/categories/"),

  create: (data: Partial<ApiProduct> & { category_id?: number }) =>
    request<ApiProduct>("/api/products/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<ApiProduct>) =>
    request<ApiProduct>(`/api/products/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orders = {
  // Buyer
  list: () =>
    request<ApiOrder[]>("/api/orders/"),

  get: (id: number) =>
    request<ApiOrder>(`/api/orders/${id}/`),

  create: (data: {
    seller_id: number;
    items: { product_id: number; quantity: number }[];
    delivery_address?: string;
    buyer_notes?: string;
    sourcing_notes?: string;
  }) =>
    request<ApiOrder>("/api/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancel: (id: number) =>
    request(`/api/orders/${id}/cancel/`, { method: "POST" }),

  // Seller
  sellerList: () =>
    request<ApiOrder[]>("/api/orders/seller/"),

  sellerGet: (id: number) =>
    request<ApiOrder>(`/api/orders/${id}/`),

  sellerUpdateStatus: (id: number, status: string, finalTotal?: number) =>
    request<ApiOrder>(`/api/orders/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(finalTotal !== undefined ? { total_price: finalTotal } : {}),
      }),
    }),

  // Seller: record M-Pesa payment against an order
  recordPayment: (orderId: number, data: {
    amount: number;
    reference_code: string;
    note?: string;
  }) =>
    request(`/api/orders/${orderId}/payments/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Seller: full ledger grouped by buyer
  ledger: () =>
    request<BuyerLedger[]>("/api/orders/ledger/"),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function parsePrice(p: string | number): number {
  return typeof p === "number" ? p : parseFloat(p);
}

export function fmtKES(amount: string | number): string {
  const n = parsePrice(amount);
  return `KES ${n.toLocaleString("en-KE")}`;
}