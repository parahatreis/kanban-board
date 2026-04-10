import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

/** Base URL without trailing slash. Empty string = same-origin (Vite proxy to API). */
export function getApiBase(): string {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (typeof v === "string" && v.length > 0) {
    return v.replace(/\/$/, "");
  }
  return "";
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function errorMessageFromBody(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: { message?: unknown } }).error === "object" &&
    (data as { error: { message?: unknown } }).error !== null
  ) {
    const m = (data as { error: { message?: unknown } }).error.message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return fallback;
}

const apiClient = axios.create({
  baseURL: getApiBase(),
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      const msg = errorMessageFromBody(
        data,
        error.message || "Request failed",
      );
      return Promise.reject(new ApiError(status, msg, data));
    }
    return Promise.reject(error);
  },
);

/**
 * JSON request via axios. 204 responses resolve to `undefined`.
 * Non-2xx responses are turned into {@link ApiError} by the interceptor.
 */
export async function apiFetch<T>(
  path: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const url = path.startsWith("/") ? path : `/${path}`;
  const response = await apiClient.request<T>({
    url,
    ...config,
  });
  if (response.status === 204) {
    return undefined as T;
  }
  return response.data;
}
