export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchWithSession(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return response;
}

// ── Error helper ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Price helpers ─────────────────────────────────────────────────────────────

export function fmtKES(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "KES 0";
  return `KES ${num.toLocaleString("en-KE")}`;
}

export function parsePrice(price: number | string): number {
  if (typeof price === "number") return price;
  const cleaned = price.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

// ── Types ─────────────────────────────────────────────────────────────────────

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
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiOrderItem {
  product_id?: number;
  product_name?: string;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  is_sourcing?: boolean;
}

export interface ApiOrder {
  id: number;
  status: string;
  buyer_username?: string;
  buyer?: number;
  seller?: number;
  total_price: string | number;
  final_total?: string | number;
  amount_paid?: string | number;
  balance?: string | number;
  payment_reference?: string;
  payment_method?: string;
  delivery_address?: string;
  buyer_notes?: string;
  sourcing_notes?: string;
  items: ApiOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiRelationship {
  id: number;
  status: "pending" | "approved" | "denied";
  requested_at: string;
  seller_id?: number;
  store_name?: string;
  store_location?: string;
  buyer_id?: number;
  buyer_name?: string;
  buyer_phone?: string;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  phone_number: string;
  is_email_verified: boolean;
  date_joined: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: "buyer" | "seller";
  location: string;
  business_type?: string;
  main_supplier?: string;
  shop_name?: string;
  shop_location?: string;
  categories?: string[];
}

// ── Auth ────────────────────────────────────────────────────────────────────

class AuthAPI {
  async login(identifier: string, password: string): Promise<User> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Login failed. Please check your credentials.");
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
      throw new Error(firstError || "Registration failed. Please try again.");
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await fetchWithSession(`${API_BASE_URL}/accounts/logout/`, {
      method: "POST",
    });
  }

  async me(): Promise<User | null> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/me/`);
    if (response.status === 403 || response.status === 401) {
      return null;
    }
    if (!response.ok) {
      return null;
    }
    return response.json();
  }
}

export const auth = new AuthAPI();

// ── Sellers ───────────────────────────────────────────────────────────────────

export interface ApiSeller {
  id: number;
  store_name: string;
  store_description?: string;
  location?: string;
  categories?: string[];
  approval_status: string;
  is_live: boolean;
  created_at: string;
  user: User;
}

function unwrapDRFResults<T>(data: unknown): T[] {
  // DRF Pagination (PageNumberPagination) => { count, next, previous, results: [] }
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as { results?: unknown };
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
}

export const sellers = {
  async list(): Promise<ApiSeller[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load sellers", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiSeller>(data);
  },

  async get(id: number): Promise<ApiSeller> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/${id}/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load seller", response.status);
    }
    return response.json();
  },
};

// ── Categories ────────────────────────────────────────────────────────────────

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export const categories = {
  async list(): Promise<ApiCategory[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/categories/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load categories", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiCategory>(data);
  },
};


// ── Products ──────────────────────────────────────────────────────────────────

export const products = {
  async list(params?: { seller?: number; category?: number; search?: string }): Promise<ApiProduct[]> {
    const url = new URL(`${API_BASE_URL}/products/`);
    if (params?.seller) url.searchParams.set("seller", String(params.seller));
    if (params?.category) url.searchParams.set("category", String(params.category));
    if (params?.search) url.searchParams.set("search", params.search);

    const response = await fetchWithSession(url.toString());
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load products", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiProduct>(data);
  },

  async mine(): Promise<ApiProduct[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/mine/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load your products", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiProduct>(data);
  },


  async create(data: Omit<ApiProduct, "id" | "seller" | "created_at" | "updated_at">): Promise<ApiProduct> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to create product", response.status);
    }
    return response.json();
  },

  async update(id: number, data: Partial<ApiProduct>): Promise<ApiProduct> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to update product", response.status);
    }
    return response.json();
  },

  async remove(id: number): Promise<void> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/${id}/`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to delete product", response.status);
    }
  },
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const orders = {
  async get(id: number): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${id}/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load order", response.status);
    }
    return response.json();
  },

  async create(data: {
    seller_id?: number;
    items: { product_id: number; quantity: number }[];
    buyer_notes?: string;
  }): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to create order", response.status);
    }
    return response.json();
  },

  async update(id: number, data: Partial<ApiOrder>): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to update order", response.status);
    }
    return response.json();
  },

  async list(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load orders", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiOrder>(data);
  },

  async sellerList(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/seller/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load seller orders", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiOrder>(data);
  },


  async cancel(id: number): Promise<{ message: string }> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${id}/cancel/`, {
      method: "POST",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to cancel order", response.status);
    }
    return response.json();
  },

  async sellerLedger(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/ledger/seller/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load ledger", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiOrder>(data);
  },

  async buyerDebts(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/debts/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load debts", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiOrder>(data);
  },


  async recordPayment(id: number, data: {
    amount: number;
    payment_reference?: string;
    payment_method?: string;
  }): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${id}/pay/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to record payment", response.status);
    }
    return response.json();
  },
};

// ── Relationships ─────────────────────────────────────────────────────────────

export const relationships = {
  async mine(): Promise<ApiRelationship[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/relationships/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load relationships", response.status);
    }
    const result = await response.json();
    return result.relationships ?? [];
  },

  async requestAccess(sellerId: number): Promise<{ message: string }> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/${sellerId}/request-access/`, {
      method: "POST",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to request access", response.status);
    }
    return response.json();
  },

  async resolve(id: number, action: "approve" | "deny"): Promise<{ message: string }> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/relationships/${id}/${action}/`, {
      method: "POST",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || `Failed to ${action} buyer`, response.status);
    }
    return response.json();
  },
};

// ── Admin: Seller verification ──────────────────────────────────────────────

export const admin = {
  async pendingSellers(): Promise<ApiSeller[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/pending/`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load pending sellers", response.status);
    }
    return response.json();
  },

  async approveSeller(id: number): Promise<{ message: string }> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/${id}/approve/`, {
      method: "POST",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to approve seller", response.status);
    }
    return response.json();
  },

  async rejectSeller(id: number, note?: string): Promise<{ message: string }> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to reject seller", response.status);
    }
    return response.json();
  },

  async userList(role?: string): Promise<User[]> {
    const url = new URL(`${API_BASE_URL}/accounts/users/`);
    if (role) url.searchParams.set("role", role);
    const response = await fetchWithSession(url.toString());
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load users", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<User>(data);
  },


  async orderList(status?: string): Promise<ApiOrder[]> {
    const url = new URL(`${API_BASE_URL}/orders/admin/`);
    if (status) url.searchParams.set("status", status);
    const response = await fetchWithSession(url.toString());
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.error || "Failed to load orders", response.status);
    }
    const data = await response.json().catch(() => ({}));
    return unwrapDRFResults<ApiOrder>(data);
  },

};

// ── Generic API helpers ───────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetchWithSession(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `GET ${path} failed`);
  }
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchWithSession(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `POST ${path} failed`);
  }
  return response.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchWithSession(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `PATCH ${path} failed`);
  }
  return response.json();
}
