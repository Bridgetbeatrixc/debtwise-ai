import {
  AuthResponse,
  Debt,
  DebtCreate,
  DebtUpdate,
  ChatMessageType,
  SimulationResult,
  RepaymentPlan,
  Insight,
  PurchaseInfoResponse,
  PurchaseImpactRequest,
  PurchaseImpactResult,
} from "./types";

// Use full backend URL when set (production); otherwise /api for local rewrite
const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://localhost:8002")
  ).replace(/\/$/, ""); // strip trailing slash

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("debtwise_token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// Auth
export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Debts
export async function getDebts(): Promise<Debt[]> {
  return apiFetch<Debt[]>("/debts");
}

export async function createDebt(debt: DebtCreate): Promise<Debt> {
  return apiFetch<Debt>("/debts", {
    method: "POST",
    body: JSON.stringify(debt),
  });
}

export async function updateDebt(
  id: string,
  debt: DebtUpdate
): Promise<Debt> {
  return apiFetch<Debt>(`/debts/${id}`, {
    method: "PUT",
    body: JSON.stringify(debt),
  });
}

export async function deleteDebt(id: string): Promise<void> {
  await apiFetch(`/debts/${id}`, { method: "DELETE" });
}

// Chat
export async function getChatHistory(): Promise<ChatMessageType[]> {
  return apiFetch<ChatMessageType[]>("/chat/history");
}

export async function deleteChatHistory(): Promise<void> {
  await apiFetch<{ ok: boolean }>("/chat/clear", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function sendChatMessage(
  message: string,
  onToken: (token: string) => void
): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Chat request failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}

// Simulation
export async function simulatePayment(
  extraMonthly: number,
  currency?: string
): Promise<SimulationResult> {
  return apiFetch<SimulationResult>("/simulate", {
    method: "POST",
    body: JSON.stringify({
      extra_monthly_payment: extraMonthly,
      currency: currency || undefined,
    }),
  });
}

// Plan
export async function getRepaymentPlan(
  strategy: string,
  currency?: string
): Promise<RepaymentPlan> {
  return apiFetch<RepaymentPlan>("/plan", {
    method: "POST",
    body: JSON.stringify({
      strategy,
      currency: currency || undefined,
    }),
  });
}

// Insights
export async function getInsights(): Promise<Insight[]> {
  return apiFetch<Insight[]>("/insights");
}

export async function generateInsight(): Promise<{ summary: string }> {
  return apiFetch<{ summary: string }>("/insights/generate", {
    method: "POST",
  });
}

// Purchase Simulator
export async function fetchPurchaseInfo(
  url: string
): Promise<PurchaseInfoResponse> {
  return apiFetch<PurchaseInfoResponse>("/simulate/purchase-info", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function simulatePurchaseImpact(
  data: PurchaseImpactRequest
): Promise<PurchaseImpactResult> {
  return apiFetch<PurchaseImpactResult>("/simulate/purchase-impact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
