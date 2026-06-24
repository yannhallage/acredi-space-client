import { clearAuthSession } from "./auth/session";

const PRODUCTION_API_BASE_URL = "https://srv.acredispace.acredigroup.com/api";
const DEVELOPMENT_API_BASE_URL = "http://localhost:8080/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type QueryParamValue = boolean | number | string | null | undefined;

export interface HttpRequestOptions
  extends Omit<RequestInit, "body" | "headers" | "method"> {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
  method?: HttpMethod;
  params?: Record<string, QueryParamValue>;
}

export interface ApiErrorPayload {
  error?: string;
  errors?: unknown;
  message?: string;
  [key: string]: unknown;
}

export class HttpError extends Error {
  readonly payload: ApiErrorPayload | null;
  readonly status: number;

  constructor(status: number, message: string, payload: ApiErrorPayload | null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.PROD ? PRODUCTION_API_BASE_URL : DEVELOPMENT_API_BASE_URL
);

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

// Origine du serveur d'API (schema + host + port), sans le suffixe `/api`.
// Sert a resoudre les chemins relatifs (ex: avatars, fichiers) renvoyes par le
// backend, qui sinon seraient resolus contre l'origine du frontend.
export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }
})();

function resolveLocalFrontendAssetUrl(value: string) {
  const normalizedValue = value.replace(/^file:\/\/+/i, "").replace(/\\/g, "/");
  const lowerValue = normalizedValue.toLowerCase();
  const isWindowsAbsolutePath = /^[a-z]:\//i.test(normalizedValue);

  if (lowerValue === "/src" || lowerValue.startsWith("/src/")) {
    return normalizedValue;
  }

  if (lowerValue === "src" || lowerValue.startsWith("src/")) {
    return `/${normalizedValue}`;
  }

  if (lowerValue === "/public" || lowerValue.startsWith("/public/")) {
    const publicPath = normalizedValue.slice("/public".length);
    return publicPath || "/";
  }

  if (lowerValue === "public" || lowerValue.startsWith("public/")) {
    const publicPath = normalizedValue.slice("public".length);
    return publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  }

  const publicIndex = isWindowsAbsolutePath ? lowerValue.lastIndexOf("/public/") : -1;
  if (publicIndex >= 0) {
    const publicPath = normalizedValue.slice(publicIndex + "/public".length);
    return publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  }

  const srcIndex = isWindowsAbsolutePath ? lowerValue.lastIndexOf("/src/") : -1;
  if (srcIndex >= 0) {
    return normalizedValue.slice(srcIndex);
  }

  return undefined;
}

// Transforme une URL d'asset renvoyee par l'API en URL chargeable par le
// navigateur. Les URL absolues, blob: et data: sont laissees telles quelles ;
// les chemins relatifs sont prefixes par l'origine de l'API. Les chemins qui
// pointent vers un asset frontend local (`src/...`, `public/...`) restent servis
// par Vite au lieu d'etre envoyes au backend.
export function resolveAssetUrl(
  url: string | null | undefined
): string | undefined {
  if (!url) {
    return undefined;
  }

  const value = url.trim();

  if (!value) {
    return undefined;
  }

  if (/^(https?:|blob:|data:)/i.test(value)) {
    return value;
  }

  const localFrontendAssetUrl = resolveLocalFrontendAssetUrl(value);

  if (localFrontendAssetUrl) {
    return localFrontendAssetUrl;
  }

  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

function appendSearchParams(
  url: string,
  params?: Record<string, QueryParamValue>
) {
  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  if (!query) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}

function resolveUrl(path: string, params?: Record<string, QueryParamValue>) {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  return appendSearchParams(url, params);
}

function getStoredToken() {
  return localStorage.getItem("accessToken");
}

function shouldForceLogout(status: number) {
  return status === 401 || status === 403;
}

function forceFrontendLogout() {
  clearAuthSession();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  );
}

function serializeBody(body: unknown) {
  if (body === undefined) {
    return undefined;
  }

  if (isRawBody(body)) {
    return body;
  }

  return JSON.stringify(body);
}

function getErrorMessage(status: number, payload: unknown) {
  if (payload && typeof payload === "object") {
    const apiPayload = payload as ApiErrorPayload;

    if (apiPayload.message) {
      return apiPayload.message;
    }

    if (apiPayload.error) {
      return apiPayload.error;
    }
  }

  if (status === 401) {
    return "Session expiree. Veuillez vous reconnecter.";
  }

  if (status === 403) {
    return "Vous n'avez pas les droits necessaires pour cette action.";
  }

  return "Une erreur est survenue pendant la requete.";
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(path: string, options: HttpRequestOptions = {}) {
  const {
    auth = true,
    body,
    headers,
    method = "GET",
    params,
    ...rest
  } = options;
  const requestHeaders = new Headers(headers);
  const serializedBody = serializeBody(body);

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (
    body !== undefined &&
    !isRawBody(body) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getStoredToken();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(resolveUrl(path, params), {
    ...rest,
    body: serializedBody,
    headers: requestHeaders,
    method,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    if (auth && shouldForceLogout(response.status)) {
      forceFrontendLogout();
    }

    throw new HttpError(
      response.status,
      getErrorMessage(response.status, payload),
      payload && typeof payload === "object" ? (payload as ApiErrorPayload) : null
    );
  }

  return payload as T;
}

export const http = {
  delete: <T>(path: string, options?: Omit<HttpRequestOptions, "method">) =>
    request<T>(path, { ...options, method: "DELETE" }),
  get: <T>(path: string, options?: Omit<HttpRequestOptions, "method">) =>
    request<T>(path, { ...options, method: "GET" }),
  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, "body" | "method">
  ) => request<T>(path, { ...options, body, method: "PATCH" }),
  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, "body" | "method">
  ) => request<T>(path, { ...options, body, method: "POST" }),
  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<HttpRequestOptions, "body" | "method">
  ) => request<T>(path, { ...options, body, method: "PUT" }),
  request,
};
