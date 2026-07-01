export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: any;
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

class AuthAPI {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    localStorage.setItem("auth_token", data.access_token);
    return data;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();
    localStorage.setItem("auth_token", data.access_token);
    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }
}

export const auth = new AuthAPI();