const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface Society {
  id: number;
  name: string;
  city: string;
}

export interface Business {
  id: number;
  clerkUserId: string;
  ownerName: string;
  businessName: string;
  societyId: number;
  category: string;
  phone: string;
  whatsapp: string;
  description: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface BusinessRow {
  business: Business;
  society: Society | null;
  avgRating: number;
  reviewCount: number;
  leadCount: number;
  reviews?: Review[];
}

export interface Review {
  id: number;
  businessId: number;
  clerkUserId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminStats {
  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalLeads: number;
  topCategories: { category: string; count: number }[];
  topBusinesses: { business: Business; leadCount: number }[];
}

export const api = {
  societies: {
    list: () => request<Society[]>("/societies"),
  },
  businesses: {
    list: (params?: { societyId?: number; category?: string }) => {
      const qs = new URLSearchParams();
      if (params?.societyId) qs.set("societyId", String(params.societyId));
      if (params?.category) qs.set("category", params.category);
      return request<BusinessRow[]>(`/businesses?${qs}`);
    },
    get: (id: number) => request<BusinessRow>(`/businesses/${id}`),
    create: (data: Record<string, unknown>) =>
      request<Business>("/businesses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      request<Business>(`/businesses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    mine: () => request<BusinessRow[]>("/my-businesses"),
  },
  leads: {
    track: (businessId: number, source = "whatsapp") =>
      request("/leads", { method: "POST", body: JSON.stringify({ businessId, source }) }),
  },
  reviews: {
    create: (data: { businessId: number; reviewerName: string; rating: number; comment: string }) =>
      request<Review>("/reviews", { method: "POST", body: JSON.stringify(data) }),
  },
  admin: {
    stats: () => request<AdminStats>("/admin/stats"),
    businesses: (status?: string) => {
      const qs = status ? `?status=${status}` : "";
      return request<{ business: Business; society: Society | null }[]>(`/admin/businesses${qs}`);
    },
    updateStatus: (id: number, status: string) =>
      request<Business>(`/admin/businesses/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },
};
