// lib/adminListingsService.ts
import { getCsrfToken } from "./csrf";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ListingOwner {
  _id: string;
  name: string;
  email: string;
}

export interface Listing {
  _id: string;
  deviceName: string;
  listingType: "swap" | "cash";
  status: "pending_review" | "active" | "rejected";
  rejectionReason: string | null;
  owner: ListingOwner;
  createdAt: string;
}

interface ApiSuccess<T> {
  status: "success";
  message: string;
  data: T;
}

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isMutation = !!options.method && options.method !== "GET";

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // send the admin's session cookie
    headers: {
      "Content-Type": "application/json",
      ...(isMutation ? { "X-CSRF-Token": getCsrfToken() ?? "" } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.message || "Something went wrong";
    throw new AdminApiError(message, res.status);
  }

  return (body as ApiSuccess<T>).data;
}

export function fetchAllListings(): Promise<{ listings: Listing[] }> {
  return request<{ listings: Listing[] }>("/api/admin/listings");
}

export function fetchPendingListings(): Promise<{ listings: Listing[] }> {
  return request<{ listings: Listing[] }>("/api/admin/listings/pending");
}

export function approveListing(
  id: string
): Promise<{ id: string; status: Listing["status"] }> {
  return request(`/api/admin/listings/${id}/approve`, { method: "PATCH" });
}

export function rejectListing(
  id: string,
  reason?: string
): Promise<{ id: string; status: Listing["status"] }> {
  return request(`/api/admin/listings/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason: reason || undefined }),
  });
}
