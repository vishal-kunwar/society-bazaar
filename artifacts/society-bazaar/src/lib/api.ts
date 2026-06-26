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
  if (res.status === 204) {
    return undefined as T;
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
  status: "pending" | "approved" | "rejected" | "paused";
  createdAt: string;
  updatedAt: string;
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

export interface FeedPost {
  id: number;
  businessId: number;
  clerkUserId: string;
  title: string;
  body: string;
  imageUrl: string;
  createdAt: string;
}

export interface FeedPostRow {
  post: FeedPost;
  business: Business;
  society: Society | null;
}

export interface DailyDeal {
  id: number;
  businessId: number;
  clerkUserId: string;
  title: string;
  description: string;
  expiresAt: string;
  createdAt: string;
}

export interface DealRow {
  deal: DailyDeal;
  business: Business;
  society: Society | null;
}

export interface FavouriteRow {
  fav: { id: number; clerkUserId: string; businessId: number; createdAt: string };
  business: Business;
  society: Society | null;
  avgRating: number;
  reviewCount: number;
  leadCount: number;
}

export interface SellerAnalytics {
  leadsThisMonth: number;
  totalLeads: number;
  repeatLeads: number;
  avgRating: number;
  reviewCount: number;
  subscriptionStartDate: string;
}

export interface AdminStats {
  totalBusinesses: number;
  pendingBusinesses: number;
  approvedBusinesses: number;
  totalLeads: number;
  topCategories: { category: string; count: number }[];
  topBusinesses: { business: Business; leadCount: number }[];
}

export interface Product {
  id: number;
  businessId: number;
  name: string;
  description: string;
  image: string;
  price: string;
  category: string;
  featured: boolean;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  societies: {
    list: () => request<Society[]>("/societies"),
    findOrCreate: (name: string, city?: string) =>
      request<Society>("/societies/find-or-create", {
        method: "POST",
        body: JSON.stringify({ name, city }),
      }),
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
    pause: (id: number) =>
      request<Business>(`/businesses/${id}/pause`, { method: "PATCH" }),
    unpause: (id: number) =>
      request<Business>(`/businesses/${id}/unpause`, { method: "PATCH" }),
  },
  leads: {
    track: (businessId: number, source = "whatsapp") =>
      request("/leads", { method: "POST", body: JSON.stringify({ businessId, source }) }),
  },
  reviews: {
    create: (data: { businessId: number; reviewerName: string; rating: number; comment: string }) =>
      request<Review>("/reviews", { method: "POST", body: JSON.stringify(data) }),
  },
  feed: {
    list: (societyId?: number) => {
      const qs = societyId ? `?societyId=${societyId}` : "";
      return request<FeedPostRow[]>(`/feed${qs}`);
    },
    create: (data: { businessId: number; title: string; body: string; imageUrl?: string }) =>
      request<FeedPost>("/feed", { method: "POST", body: JSON.stringify(data) }),
  },
  deals: {
    list: () => request<DealRow[]>("/deals"),
    create: (data: { businessId: number; title: string; description: string; expiresAt: string }) =>
      request<DailyDeal>("/deals", { method: "POST", body: JSON.stringify(data) }),
  },
  favourites: {
    list: () => request<FavouriteRow[]>("/favourites"),
    ids: () => request<number[]>("/favourites/ids"),
    toggle: (businessId: number) =>
      request<{ saved: boolean }>("/favourites/toggle", { method: "POST", body: JSON.stringify({ businessId }) }),
  },
  analytics: {
    seller: () => request<SellerAnalytics>("/analytics/seller"),
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
  products: {
    list: (businessId: number) => request<Product[]>(`/businesses/${businessId}/products`),
    manage: (businessId: number) => request<Product[]>(`/businesses/${businessId}/products/manage`),
    create: (businessId: number, data: {
      name: string;
      description?: string;
      image?: string;
      price?: string;
      category?: string;
      featured?: boolean;
      active?: boolean;
    }) =>
      request<Product>(`/businesses/${businessId}/products`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (productId: number, data: {
      name?: string;
      description?: string;
      image?: string;
      price?: string;
      category?: string;
      featured?: boolean;
      active?: boolean;
    }) =>
      request<Product>(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (productId: number) =>
      request<void>(`/products/${productId}`, { method: "DELETE" }),
    reorder: (businessId: number, productIds: number[]) =>
      request<Product[]>(`/businesses/${businessId}/products/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ productIds }),
      }),
  },
};

