import type { ApiError, ApiEnvelope } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const TIMEOUT_MS = 30000;

class ApiClientError extends Error {
  status: number;
  kod: string;
  butiran?: Record<string, string[]>;

  constructor(status: number, error: ApiError) {
    super(error.mesej);
    this.name = "ApiClientError";
    this.status = status;
    this.kod = error.kod;
    this.butiran = error.butiran;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: { detail?: ApiError } | undefined;
    try {
      errorBody = await response.json();
    } catch {
      throw new ApiClientError(response.status, {
        mesej: "Ralat tidak dijangka. Sila cuba lagi.",
        kod: "RALAT_TIDAK_DIJANGKA",
      });
    }

    const detail = errorBody?.detail ?? {
      mesej: "Ralat tidak dijangka. Sila cuba lagi.",
      kod: "RALAT_TIDAK_DIJANGKA",
    };

    throw new ApiClientError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as ApiEnvelope<T> & {
    meta?: unknown;
  };

  // Paginated endpoints return { data, meta }. The envelope must be kept whole
  // so consumers can read both the item list and the pagination metadata.
  // Single-resource responses return { data }, which we unwrap as usual.
  if (json && "meta" in json) {
    return json as T;
  }

  return json.data as T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return handleResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError(0, {
        mesej: "Permintaan mengambil masa terlalu lama. Sila cuba lagi.",
        kod: "MASA_TAMAT",
      });
    }

    throw new ApiClientError(0, {
      mesej: "Gagal menyambung ke pelayan. Sila periksa sambungan anda.",
      kod: "RALAT_RANGKAIAN",
    });
  }
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return request<T>(url, { method: "GET" });
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" });
}

export { ApiClientError };
