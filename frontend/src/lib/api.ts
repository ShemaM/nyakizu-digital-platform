const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function extractMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "Something went wrong.";
  const values = Object.values(body as Record<string, unknown>).flat();
  return String(values[0] ?? "Something went wrong.");
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

  let data: unknown;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) throw new Error(extractMessage(data));
  return data as T;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  phone_number: string;
  is_email_verified: boolean;
  verification_token?: string;
}

export interface Store {
  id: number;
  store_name: string;
  store_description: string;
  location: string;
  categories: string[];
  approval_status: "pending" | "approved" | "rejected";
  is_live: boolean;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  status: "available" | "out_of_stock" | "draft";
  category: number | null;
  category_name: string | null;
  seller_username: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  status: string;
  total_amount?: string;
  created_at?: string;
  buyer?: number | User;
  seller?: number | Store;
  items?: unknown[];
}

export const auth = {
  register: (body: Record<string, unknown>) =>
    apiFetch<User & { verification_token: string }>("/api/accounts/register/", {
      method: "POST", body: JSON.stringify(body),
    }),
  login: (phone: string, password: string) =>
    apiFetch<User>("/api/accounts/login/", {
      method: "POST", body: JSON.stringify({ phone, password }),
    }),
  logout: () => apiFetch("/api/accounts/logout/", { method: "POST" }),
  me: ()    => apiFetch<User>("/api/accounts/me/"),
};

export const stores = {
  list: () => apiFetch<{ results: Store[] }>("/api/accounts/sellers/"),
  get:  (id: number) => apiFetch<Store>(`/api/accounts/sellers/${id}/`),
  requestAccess: (id: number) =>
    apiFetch(`/api/accounts/sellers/${id}/request-access/`, { method: "POST" }),
};

export const products = {
  list: (params?: { category?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", String(params.category));
    if (params?.search)   q.set("search", params.search);
    return apiFetch<{ results: Product[] }>(`/api/products/${q.toString() ? `?${q}` : ""}`);
  },
  mine: () => apiFetch<{ results: Product[] } | Product[]>("/api/products/mine/"),
  categories: () => apiFetch<{ results: Category[] } | Category[]>("/api/products/categories/"),
};

export const orders = {
  list: () => apiFetch<{ results: Order[] } | Order[]>("/api/orders/"),
};

export function normalizeList<T>(value: { results: T[] } | T[]): T[] {
  return Array.isArray(value) ? value : value.results;
}
