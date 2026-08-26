// The real backend origin — needed as-is for things that intentionally
// bypass the same-origin proxy below (Django admin is a separate surface
// entirely, and Google OAuth's redirect flow is a top-level navigation, so
// it was never subject to the cross-site cookie blocking that motivates the
// proxy), and also as the base for API_BASE_URL itself when there's no
// browser origin for a relative path to resolve against (see below).
export const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");
export const DJANGO_ADMIN_URL = new URL("/admin/", BACKEND_ORIGIN).toString();

// Same-origin on purpose in the browser — see next.config.ts's rewrites(),
// which proxies this to the real Django backend. Browsers (Brave/Safari
// especially) increasingly block cookies between two different top-level
// domains even when marked SameSite=None; Secure, treating a separate
// frontend/backend domain pair as tracking-like behavior. Routing through
// one origin makes the session/CSRF cookies genuinely first-party instead
// of fighting that.
//
// Server Components / route handlers run in Node, not a browser — there's
// no page origin for a relative "/api" fetch to resolve against there, so
// this falls back to the real backend origin outside the browser. This
// matters for any shared API-client method (e.g. `products.list()`,
// `sellers.list()`) that also gets called during server-side rendering,
// not just from client components — a plain relative-URL fetch() throws in
// that context instead of hitting the proxy.
export const API_BASE_URL = typeof window === "undefined" ? `${BACKEND_ORIGIN}/api` : "/api";

/**
 * Reads a cookie by name. In production the session/CSRF cookies are
 * SameSite=None (see backend/nyakizu/settings.py — required since the
 * frontend and backend are different sites), which only controls whether
 * the browser auto-attaches the cookie to outgoing requests; it's still
 * plain JS-readable, which is exactly what lets us pull the CSRF token
 * out here and send it back as a header.
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null; // SSR guard
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

async function fetchWithSession(url: string, options: RequestInit = {}) {
  // FormData bodies must NOT get an explicit Content-Type — the browser sets
  // its own multipart boundary, and overriding it breaks upload parsing.
  const isFormData = options.body instanceof FormData;
  const method = (options.method || "GET").toUpperCase();
  // Django's CSRF check only applies to unsafe methods — GET/HEAD/OPTIONS
  // never need the token, and skipping them means a missing/expired cookie
  // (e.g. before primeCsrf() has run) can't break read-only calls.
  const csrfToken = SAFE_METHODS.has(method) ? null : getCookie("csrftoken");

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...(options.headers || {}),
    },
  });
  return response;
}

/**
 * Ensures the browser is holding a csrftoken cookie before any mutating
 * request is attempted — Django only sets/rotates that cookie as a side
 * effect of a request touching django.middleware.csrf.get_token(), which
 * this pure-API backend otherwise never does. Called once on app load
 * (see auth-context.tsx). Failure is non-fatal: worst case the first
 * mutating request 403s and the user retries, same as a stale/missing
 * cookie any time later in the session.
 */
export async function primeCsrf(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/csrf/`, { credentials: "include" });
  } catch {
    // Network hiccup — not worth surfacing to the user for a priming call.
  }
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Some list endpoints are backed by DRF's generics.ListAPIView, which applies
 * the project's global PageNumberPagination and returns { count, results }
 * instead of a bare array — even though the endpoints below are typed as
 * returning T[]. Normalize both shapes here so every caller reliably gets
 * an array, regardless of which pagination behavior the backend view uses.
 */
function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

/**
 * DRF error bodies never have a plain `message` field — they're either
 * `{"detail": "..."}`, `{"non_field_errors": ["..."]}`, or
 * `{"<field>": ["..."]}` for validation errors on a specific field. Pull
 * the first human-readable string out of whichever shape shows up so
 * callers don't fall back to a generic "Failed to..." that hides the
 * actual reason (e.g. "Not enough stock for 'X'. Available: 0, requested: 1.").
 */
function extractApiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const data = body as Record<string, unknown>;

  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;

  for (const value of Object.values(data)) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }

  return fallback;
}

export function fmtKES(amount: number | string | null | undefined): string {
  if (amount == null) return "KES 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "KES 0";
  return `KES ${num.toLocaleString("en-KE")}`;
}

export function parsePrice(price: number | string | null | undefined): number {
  if (price == null) return 0;
  if (typeof price === "number") return price;
  const cleaned = price.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  full_name: string;
  phone_number: string;
  is_email_verified: boolean;
  date_joined: string;
  avatar_url?: string | null;
  seller_profile?: {
    id: number;
    shop_name?: string;
    store_name?: string;
    location?: string;
    categories?: string[];
    is_verified?: boolean;
    approval_status?: string;
    approval_note?: string;
    mpesa_till_number?: string;
    mpesa_pochi_number?: string;
    mpesa_paybill_number?: string;
    mpesa_paybill_account?: string;
    mpesa_send_money_number?: string;
  };
  buyer_profile?: {
    id: number;
    location?: string;
    main_supplier?: string;
    business_type?: string;
  };
}

export interface ApiSeller {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  shop_name?: string;
  store_name?: string;
  shop_location?: string;
  business_type?: string;
  is_verified?: boolean;
  created_at: string;
  approval_status?: string;
  store_description?: string;
  categories?: string[];
  mpesa_till_number?: string;
  mpesa_pochi_number?: string;
  mpesa_paybill_number?: string;
  mpesa_paybill_account?: string;
  mpesa_send_money_number?: string;
  user?: {
    full_name?: string;
    username?: string;
    phone_number?: string;
    email?: string;
    avatar_url?: string | null;
  };
  is_live?: boolean;
}

export interface ApiProductAttributeValue {
  id: number;
  attribute_name: string;
  value: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  status: "available" | "out_of_stock" | "draft";
  availability_label?: "available" | "can_be_sourced" | "not_available";
  stock_quantity?: number;
  seller?: number;
  category?: number;
  category_name?: string;
  image_url?: string;
  attribute_values?: ApiProductAttributeValue[];
  created_at: string;
  updated_at?: string;
}

export interface ApiAttributeValue {
  id: number;
  value: string;
}

export interface ApiCategoryAttribute {
  id: number;
  name: string;
  values: ApiAttributeValue[];
}

export interface ApiCategory {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  attributes?: ApiCategoryAttribute[];
}

export interface ApiRelationship {
  buyer_id?: number;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_email?: string;
  id: number;
  seller_id: number;
  seller_name: string;
  status: string;
  created_at: string;
}

export interface ApiOrderItem {
  id: number;
  product_id?: number;
  product_name?: string;
  /** Set instead of a linked product when this line is a free-text sourcing request. */
  custom_name?: string;
  quantity: number;
  /** Null until the seller sources and prices a custom_name line. */
  unit_price: string | number | null;
  subtotal: string | number | null;
  is_sourcing?: boolean;
  is_packed?: boolean;
  /** The seller tried to source this and couldn't get it that day. */
  not_found?: boolean;
}

/** Shape sent to/from the cart-drafts endpoint — mirrors offline-db.ts's DraftData.items exactly, since the two stay in sync. */
export interface CartDraftItem {
  product_id?: number;
  custom_name?: string;
  quantity: number;
}

export interface ApiOrderStatusEvent {
  status: string;
  created_at: string;
}

export interface ApiPaymentClaim {
  id: number;
  amount: string | number;
  reference: string;
  submitted_at: string;
  resolved: boolean;
}

export interface ApiSellerPaymentInfo {
  till_number?: string;
  pochi_number?: string;
  paybill_number?: string;
  paybill_account?: string;
  send_money_number?: string;
}

export interface ApiOrder {
  id: number;
  status: string;
  buyer_username?: string;
  buyer_full_name?: string;
  buyer_phone?: string;
  buyer?: number;
  seller?: number;
  seller_store_name?: string;
  total_price: string | number;
  final_total?: string | number;
  amount_paid?: string | number;
  balance?: string | number;
  payment_reference?: string;
  payment_method?: string;
  /** How to pay this order's seller via M-Pesa — null if the seller hasn't filled any of it in. */
  seller_payment_info?: ApiSellerPaymentInfo | null;
  /** The date the buyer (or seller, on their behalf) said the remaining balance would be paid — for records, not enforcement. */
  expected_payment_date?: string | null;
  /** Server-computed: debt_active, has a date, and that date has passed. Never blocks anything — purely informational. */
  is_payment_late?: boolean;
  delivery_address?: string;
  buyer_notes?: string;
  sourcing_notes?: string;
  items: ApiOrderItem[];
  status_history?: ApiOrderStatusEvent[];
  /** Buyer-submitted "I paid — here's the code" claims, newest first. Informational only — see PaymentClaim on the backend. */
  payment_claims?: ApiPaymentClaim[];
  is_flagged?: boolean;
  flag_reason?: string;
  flagged_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RegisterPayload {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: "buyer" | "seller";
  location: string;
  business_type?: string;
  main_supplier?: string;
  shop_name?: string;
  store_name?: string;
  shop_location?: string;
  categories?: string[];
}

class AuthAPI {
  async login(identifier: string, password: string): Promise<User> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Login failed.", response.status);
    }
    return response.json();
  }

  async register(payload: RegisterPayload): Promise<User> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/register/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const firstError = Object.values(data).flat()[0];
      throw new ApiError(typeof firstError === "string" ? firstError : "Registration failed.", response.status);
    }
    return response.json();
  }

  async logout(): Promise<void> {
    await fetchWithSession(`${API_BASE_URL}/accounts/logout/`, { method: "POST" });
  }

  async me(): Promise<User | null> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/me/`);
    if (response.status === 403 || response.status === 401) return null;
    if (!response.ok) return null;
    return response.json();
  }

  /** Partial update of the signed-in user's own profile — pass only what changed. */
  async updateProfile(data: { full_name?: string; email?: string; phone_number?: string; avatarFile?: File }): Promise<User> {
    const formData = new FormData();
    if (data.full_name !== undefined) formData.append("full_name", data.full_name);
    if (data.email !== undefined) formData.append("email", data.email);
    if (data.phone_number !== undefined) formData.append("phone_number", data.phone_number);
    if (data.avatarFile) formData.append("avatar", data.avatarFile);

    const response = await fetchWithSession(`${API_BASE_URL}/accounts/me/`, {
      method: "PATCH",
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(errData, "Could not update your profile."), response.status);
    }
    return response.json();
  }

  /** Registers this browser's Web Push subscription against the signed-in user. Silently ignores failure — push is a nice-to-have, never something that should block the caller. */
  async subscribeToPush(subscription: PushSubscriptionJSON): Promise<void> {
    await fetchWithSession(`${API_BASE_URL}/accounts/push-subscribe/`, {
      method: "POST",
      body: JSON.stringify(subscription),
    }).catch(() => {});
  }

  async unsubscribeFromPush(endpoint: string): Promise<void> {
    await fetchWithSession(`${API_BASE_URL}/accounts/push-unsubscribe/`, {
      method: "POST",
      body: JSON.stringify({ endpoint }),
    }).catch(() => {});
  }

  async resendVerification(email: string): Promise<string> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/resend-verification/`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(extractApiErrorMessage(data, "Could not resend the email. Please try again."), response.status);
    }
    return data.message as string;
  }

  async requestPasswordReset(email: string): Promise<string> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/password-reset/`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(extractApiErrorMessage(data, "Could not send the reset link. Please try again."), response.status);
    }
    return data.message as string;
  }

  async confirmPasswordReset(uid: string, token: string, newPassword: string): Promise<string> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/password-reset/confirm/`, {
      method: "POST",
      body: JSON.stringify({ uid, token, new_password: newPassword }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(extractApiErrorMessage(data, "Could not reset your password. Please try again."), response.status);
    }
    return data.message as string;
  }
}
export const auth = new AuthAPI();

function buildProductFormData(productData: Record<string, unknown>, imageFile: File): FormData {
  const formData = new FormData();
  Object.entries(productData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // attribute_value_ids is a list — DRF reads repeated same-key form
    // fields as the list, not a single comma-joined string.
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, String(item)));
      return;
    }
    formData.append(key, String(value));
  });
  formData.append("image", imageFile);
  return formData;
}

class ProductsAPI {
  async list(params?: { seller?: number }): Promise<ApiProduct[]> {
    const url = params?.seller ? `${API_BASE_URL}/products/?seller=${params.seller}` : `${API_BASE_URL}/products/`;
    const response = await fetchWithSession(url);
    return response.ok ? unwrapList<ApiProduct>(await response.json()) : [];
  }

  async mine(): Promise<ApiProduct[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/mine/`);
    return response.ok ? unwrapList<ApiProduct>(await response.json()) : [];
  }

  async create(productData: any, imageFile?: File | null): Promise<ApiProduct> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/`, {
      method: "POST",
      body: imageFile ? buildProductFormData(productData, imageFile) : JSON.stringify(productData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to create product"), response.status);
    }
    return response.json();
  }

  async update(id: number, productData: any, imageFile?: File | null): Promise<ApiProduct> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/${id}/`, {
      method: "PATCH",
      body: imageFile ? buildProductFormData(productData, imageFile) : JSON.stringify(productData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to update product"), response.status);
    }
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/${id}/`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new ApiError("Failed to delete product", response.status);
    }
  }
}
export const products = new ProductsAPI();

// These list endpoints are paginated server-side (nyakizu.pagination.LargeResultsSetPagination,
// capped at 200) rather than returning every order unbounded. The pages that
// consume these — dashboard sales insights, the Payments ledger totals, the
// pending-activity feed — need "everything that currently exists" to stay
// correct, so we ask for the large capped page up front instead of building
// infinite-scroll for each of them; a seller/buyer with more than 200
// matching orders (not yet a real scenario at this stage) would need that
// built out, or a dedicated server-side summary endpoint.
const FULL_LIST_PAGE_SIZE = 200;

class OrdersAPI {
  async list(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/?page_size=${FULL_LIST_PAGE_SIZE}`);
    return response.ok ? unwrapList<ApiOrder>(await response.json()) : [];
  }

  async sellerList(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/seller/?page_size=${FULL_LIST_PAGE_SIZE}`);
    return response.ok ? unwrapList<ApiOrder>(await response.json()) : [];
  }

  async sellerLedger(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/ledger/seller/?page_size=${FULL_LIST_PAGE_SIZE}`);
    return response.ok ? unwrapList<ApiOrder>(await response.json()) : [];
  }

  async get(orderId: string): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/`);
    if (!response.ok) throw new ApiError("Failed to fetch order", response.status);
    return response.json();
  }

  async create(orderData: any): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to create order"), response.status);
    }
    return response.json();
  }

  async update(orderId: number, orderData: any): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/`, {
      method: "PATCH",
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to update order"), response.status);
    }
    return response.json();
  }

  async cancel(orderId: number): Promise<{ message: string }> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/cancel/`, {
      method: "POST",
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to cancel order"), response.status);
    }
    return response.json();
  }

  async buyerDebts(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/debts/?page_size=${FULL_LIST_PAGE_SIZE}`);
    return response.ok ? unwrapList<ApiOrder>(await response.json()) : [];
  }

  async toggleItemPacked(orderId: number, itemId: number): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/items/${itemId}/toggle-packed/`, {
      method: "POST",
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to update packing status"), response.status);
    }
    return response.json();
  }

  async toggleItemNotFound(orderId: number, itemId: number): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/items/${itemId}/toggle-not-found/`, {
      method: "POST",
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Could not update this item"), response.status);
    }
    return response.json();
  }

  /** Prices a sourcing line that came in with none — recalculates the order total. */
  async setItemPrice(orderId: number, itemId: number, unitPrice: number): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/items/${itemId}/set-price/`, {
      method: "POST",
      body: JSON.stringify({ unit_price: unitPrice }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Could not set that price"), response.status);
    }
    return response.json();
  }


  async recordPayment(orderId: number, paymentData: any): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/pay/`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to record payment"), response.status);
    }
    return response.json();
  }

  /** Buyer tells the seller "I paid — here's the M-Pesa code". Doesn't mark the order paid by itself; the seller still confirms it. */
  async submitPaymentClaim(orderId: number, amount: number, reference: string): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/payment-claim/`, {
      method: "POST",
      body: JSON.stringify({ amount, reference }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Could not send that payment code"), response.status);
    }
    return response.json();
  }

  /** Seller asks the buyer (by email) to pay the remaining balance on a debt_active order. */
  async requestPayment(orderId: number): Promise<void> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/request-payment/`, {
      method: "POST",
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Could not send the reminder"), response.status);
    }
  }

  // ── Cart drafts ──────────────────────────────────────────────────────
  // Server-side twin of the local IndexedDB draft (offline-db.ts) — lets a
  // cart survive a device switch/reinstall, and gives the abandoned-cart
  // reminder job something to notice (a local-only draft is invisible to
  // the backend).

  /** null if the buyer has no saved draft for this seller. */
  async getDraft(sellerId: number): Promise<CartDraftItem[] | null> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/drafts/${sellerId}/`);
    if (response.status === 404) return null;
    if (!response.ok) return null;
    const data = await response.json();
    return data.items ?? null;
  }

  /** Upserts the draft; an empty list deletes it server-side. Best-effort — a failed sync shouldn't block shopping. */
  async saveDraft(sellerId: number, items: CartDraftItem[]): Promise<void> {
    await fetchWithSession(`${API_BASE_URL}/orders/drafts/${sellerId}/`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }).catch(() => {});
  }

  /** Named to not collide with offlineDB.deleteDraft — called alongside it once an order is actually sent. */
  async deleteDraftRemote(sellerId: number): Promise<void> {
    await fetchWithSession(`${API_BASE_URL}/orders/drafts/${sellerId}/`, {
      method: "DELETE",
    }).catch(() => {});
  }
}
export const orders = new OrdersAPI();

class CategoriesAPI {
  async list(): Promise<ApiCategory[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/categories/`);
    return response.ok ? unwrapList<ApiCategory>(await response.json()) : [];
  }

  async create(name: string): Promise<ApiCategory> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/categories/`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to create category"), response.status);
    }
    return response.json();
  }

  async update(id: number, name: string): Promise<ApiCategory> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/categories/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to update category"), response.status);
    }
    return response.json();
  }
}
export const categories = new CategoriesAPI();

class RelationshipsAPI {
  async list(): Promise<ApiRelationship[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/relationships/`);
    return response.ok ? response.json() : [];
  }

  async mine(): Promise<ApiRelationship[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/relationships/mine/`);
    return response.ok ? response.json() : [];
  }

  async requestAccess(sellerId: number): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/relationships/`, {
      method: "POST",
      body: JSON.stringify({ seller_id: sellerId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to request access"), response.status);
    }
    return response.json();
  }

  async resolve(relationshipId: number, action: string): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/relationships/${relationshipId}/resolve/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Failed to resolve relationship"), response.status);
    }
    return response.json();
  }
}
export const relationships = new RelationshipsAPI();

class SellersAPI {
  async list(params?: { username?: string }): Promise<ApiSeller[]> {
    const url = params?.username
      ? `${API_BASE_URL}/accounts/sellers/?username=${encodeURIComponent(params.username)}`
      : `${API_BASE_URL}/accounts/sellers/`;
    const response = await fetchWithSession(url);
    return response.ok ? unwrapList<ApiSeller>(await response.json()) : [];
  }

  async get(id: string): Promise<ApiSeller> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/${id}/`);
    if (!response.ok) throw new ApiError("Failed to fetch seller", response.status);
    return response.json();
  }

  /** Partial update of the signed-in seller's own store profile — pass only what changed. */
  async update(id: number, data: Record<string, unknown>): Promise<ApiSeller> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(extractApiErrorMessage(error, "Could not save your changes."), response.status);
    }
    return response.json();
  }
}
export const sellers = new SellersAPI();

class FollowsAPI {
  async list(): Promise<any[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/follows/`);
    return response.ok ? response.json() : [];
  }

  async mine(): Promise<any[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/follows/mine/`);
    return response.ok ? response.json() : [];
  }

  async follow(sellerId: number): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/follows/`, {
      method: "POST",
      body: JSON.stringify({ seller_id: sellerId }),
    });
    if (!response.ok) throw new ApiError("Failed to follow seller", response.status);
    return response.json();
  }

  async unfollow(sellerId: number): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/follows/${sellerId}/`, { method: "DELETE" });
    if (!response.ok) throw new ApiError("Failed to unfollow seller", response.status);
    return response.json();
  }
}
export const follows = new FollowsAPI();

export interface CommunityStats {
  members: number;
  stores: number;
  products: number;
  cities: number;
}

export interface CommunityMember {
  id: number;
  name: string;
  role: "Seller" | "Buyer";
  verified: boolean;
  location: string;
  joined: string;
  avatar: string | null;
}

export interface CommunityActivityData {
  stats: CommunityStats;
  recent_members: CommunityMember[];
}

class CommunityAPI {
  async activity(): Promise<CommunityActivityData | null> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/community/`);
    return response.ok ? response.json() : null;
  }
}
export const community = new CommunityAPI();
