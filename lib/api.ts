const API = "http://localhost:8000";

// ─── Auth helpers ────────────────────────────────────────────────────
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("transfund_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: { email: string; name: string; role: string }) {
  localStorage.setItem("transfund_user", JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem("transfund_user");
}

// ─── Auth API ─────────────────────────────────────────────────────────
type AuthUser = { id: number; name: string; email: string; role: "donor" | "organizer" };

async function _postAuth(path: string, body: unknown) {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach server. Is the backend running?");
  }
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const j = await res.json();
      if (j?.detail) detail = j.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json() as Promise<{ message: string; user: AuthUser }>;
}

export function upsertUser(data: {
  role: "donor" | "organizer";
  name: string;
  email: string;
  password?: string;
}) {
  return _postAuth("/auth/upsert", data);
}

export function registerUser(data: {
  role: "donor" | "organizer";
  name: string;
  email: string;
  password: string;
}) {
  return _postAuth("/auth/register", data);
}

export function loginUser(data: {
  role: "donor" | "organizer";
  name: string;
  email: string;
  password: string;
}) {
  return _postAuth("/auth/login", data);
}

// ─── Campaign API ─────────────────────────────────────────────────────
export async function getCampaigns(params?: { category?: string; organizer_email?: string }) {
  const qs = new URLSearchParams();
  if (params?.category && params.category !== "All") qs.set("category", params.category);
  if (params?.organizer_email) qs.set("organizer_email", params.organizer_email);
  const res = await fetch(`${API}/campaigns/?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

export async function getCampaign(id: number) {
  const res = await fetch(`${API}/campaigns/${id}`);
  if (!res.ok) throw new Error("Campaign not found");
  return res.json();
}

export async function createCampaign(formData: FormData) {
  const res = await fetch(`${API}/campaigns/`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to create campaign");
  return res.json();
}

export async function deleteCampaign(id: number) {
  const res = await fetch(`${API}/campaigns/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete campaign");
  return res.json();
}

export async function closeCampaign(id: number, reason: string) {
  const res = await fetch(`${API}/campaigns/${id}/close`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to close campaign");
  return res.json();
}

// ─── Donation API ─────────────────────────────────────────────────────
export async function makeDonation(data: {
  campaign_id: number;
  donor_name: string;
  donor_email: string;
  amount: number;
}) {
  const res = await fetch(`${API}/donations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let detail = "Failed to record donation";
    try { const j = await res.json(); if (j?.detail) detail = j.detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export async function getDonorDonations(donor_email: string) {
  const res = await fetch(`${API}/donations/?donor_email=${encodeURIComponent(donor_email)}`);
  if (!res.ok) throw new Error("Failed to fetch donor donations");
  return res.json();
}

export async function getOrganizerDonations(organizer_email: string) {
  const res = await fetch(`${API}/donations/?organizer_email=${encodeURIComponent(organizer_email)}`);
  if (!res.ok) throw new Error("Failed to fetch organizer donations");
  return res.json();
}

export async function getCampaignDonations(campaign_id: number) {
  const res = await fetch(`${API}/donations/?campaign_id=${campaign_id}`);
  if (!res.ok) throw new Error("Failed to fetch campaign donations");
  return res.json();
}

// ─── Utilization API ──────────────────────────────────────────────
export async function getUtilizations(campaign_id: number) {
  const res = await fetch(`${API}/utilizations/?campaign_id=${campaign_id}`);
  if (!res.ok) throw new Error("Failed to fetch utilizations");
  return res.json();
}

export async function getUtilizationSummary(campaign_id: number) {
  const res = await fetch(`${API}/utilizations/summary/${campaign_id}`);
  if (!res.ok) throw new Error("Failed to fetch utilization summary");
  return res.json();
}

// ─── Formatters ───────────────────────────────────────────────────────
export function fmtINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
