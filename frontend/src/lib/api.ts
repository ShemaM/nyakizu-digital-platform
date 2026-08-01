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

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

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

export interface User {
  id: number;
  username: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  full_name: string;
  phone_number: string;
  is_email_verified: boolean;
  date_joined: string;
  seller_profile?: {
    id: number;
    shop_name?: string;
    store_name?: string;
    is_verified?: boolean;
    approval_status?: string;
    approval_note?: string;
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
  user?: {
    full_name?: string;
    username?: string;
  };
  is_live?: boolean;
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
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  description?: string;
  slug?: string;
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
  updated_at?: string;
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
}
export const auth = new AuthAPI();

class ProductsAPI {
  async list(params?: { seller?: number }): Promise<ApiProduct[]> {
    const url = params?.seller ? `${API_BASE_URL}/products/?seller=${params.seller}` : `${API_BASE_URL}/products/`;
    const response = await fetchWithSession(url);
    return response.ok ? response.json() : [];
  }

  async mine(): Promise<ApiProduct[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/mine/`);
    return response.ok ? response.json() : [];
  }

  async create(productData: any): Promise<ApiProduct> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/`, {
      method: "POST",
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create product");
    }
    return response.json();
  }

  async update(id: number, productData: any): Promise<ApiProduct> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update product");
    }
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetchWithSession(`${API_BASE_URL}/products/${id}/`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete product");
    }
  }
}
export const products = new ProductsAPI();

class OrdersAPI {
  async list(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/`);
    return response.ok ? response.json() : [];
  }

  async sellerList(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/seller/`);
    return response.ok ? response.json() : [];
  }

  async sellerLedger(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/ledger/`);
    return response.ok ? response.json() : [];
  }

  async get(orderId: string): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/`);
    if (!response.ok) throw new Error("Failed to fetch order");
    return response.json();
  }

  async create(orderData: any): Promise<ApiOrder> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create order");
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
      throw new Error(error.message || "Failed to update order");
    }
    return response.json();
  }

  async buyerDebts(): Promise<ApiOrder[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/debts/`);
    return response.ok ? response.json() : [];
  }

  async recordPayment(orderId: number, paymentData: any): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/orders/${orderId}/pay/`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to record payment");
    }
    return response.json();
  }
}
export const orders = new OrdersAPI();

class CategoriesAPI {
  async list(): Promise<ApiCategory[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/categories/`);
    return response.ok ? response.json() : [];
  }
}
export const categories = new CategoriesAPI();

class RelationshipsAPI {
  async list(): Promise<ApiRelationship[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/relationships/`);
    return response.ok ? response.json() : [];
  }

  async mine(): Promise<ApiRelationship[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/relationships/mine/`);
    return response.ok ? response.json() : [];
  }

  async requestAccess(sellerId: number): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/relationships/`, {
      method: "POST",
      body: JSON.stringify({ seller_id: sellerId }),
    });
    if (!response.ok) throw new Error("Failed to request access");
    return response.json();
  }

  async resolve(relationshipId: number, action: string): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/relationships/${relationshipId}/resolve/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    if (!response.ok) throw new Error("Failed to resolve relationship");
    return response.json();
  }
}
export const relationships = new RelationshipsAPI();

class SellersAPI {
  async list(): Promise<ApiSeller[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/`);
    return response.ok ? response.json() : [];
  }

  async get(id: string): Promise<ApiSeller> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch seller");
    return response.json();
  }
}
export const sellers = new SellersAPI();

class AdminAPI {
  async dashboardMetrics(): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/admin/metrics/`);
    return response.ok ? response.json() : null;
  }

  async pendingSellers(): Promise<any[]> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/pending/`);
    return response.ok ? response.json() : [];
  }

  async orderList(status?: string): Promise<any[]> {
    const url = status ? `${API_BASE_URL}/admin/orders/?status=${status}` : `${API_BASE_URL}/admin/orders/`;
    const response = await fetchWithSession(url);
    return response.ok ? response.json() : [];
  }

  async userList(role?: string): Promise<User[]> {
    const url = role ? `${API_BASE_URL}/admin/users/?role=${role}` : `${API_BASE_URL}/admin/users/`;
    const response = await fetchWithSession(url);
    return response.ok ? response.json() : [];
  }

  async approveSeller(sellerId: number): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/pending/${sellerId}/approve/`, { method: "POST" });
    return response.ok ? response.json() : null;
  }

  async rejectSeller(sellerId: number): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/accounts/sellers/pending/${sellerId}/reject/`, { method: "POST" });
    return response.ok ? response.json() : null;
  }
}
export const admin = new AdminAPI();

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
    if (!response.ok) throw new Error("Failed to follow seller");
    return response.json();
  }

  async unfollow(sellerId: number): Promise<any> {
    const response = await fetchWithSession(`${API_BASE_URL}/follows/${sellerId}/`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to unfollow seller");
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
