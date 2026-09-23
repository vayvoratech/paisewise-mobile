/**
 * Per-service HTTP client factory.
 *
 * Each backend microservice gets its own axios instance whose baseURL is the
 * API gateway + that service's route. This keeps service boundaries explicit
 * on the client and lets us swap a service's host independently later.
 *
 * SECURITY:
 *  - Bearer access token attached per request from encrypted secure storage.
 *  - Transparent token refresh on 401 (single-flight, queued retries).
 *  - Sensitive fields are never logged.
 *  - HTTPS only; this layer is the natural place to add certificate pinning.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV, ServiceName } from '../config/env';
import { tokenStore } from '../security/secureStore';

export type ApiError = {
  status: number;
  code: string;
  message: string;
};

/** Hook the auth feature registers so this layer can refresh without importing it (avoids cycles). */
type RefreshFn = () => Promise<string | null>;
type LogoutFn = () => Promise<void>;

let refreshHandler: RefreshFn | null = null;
let logoutHandler: LogoutFn | null = null;

export function registerAuthHandlers(handlers: { refresh: RefreshFn; logout: LogoutFn }) {
  refreshHandler = handlers.refresh;
  logoutHandler = handlers.logout;
}

// Single-flight refresh: concurrent 401s wait on one refresh call.
let inflightRefresh: Promise<string | null> | null = null;
function refreshOnce(): Promise<string | null> {
  if (!refreshHandler) return Promise.resolve(null);
  if (!inflightRefresh) {
    inflightRefresh = refreshHandler().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as { code?: string; message?: string } | undefined;
  return {
    status,
    code: data?.code ?? (status === 0 ? 'NETWORK_ERROR' : 'API_ERROR'),
    message: data?.message ?? error.message ?? 'Something went wrong.',
  };
}

const clients = new Map<ServiceName, AxiosInstance>();

export function getServiceClient(service: ServiceName): AxiosInstance {
  const existing = clients.get(service);
  if (existing) return existing;

  const instance = axios.create({
    baseURL: `${ENV.apiGatewayUrl}${ENV.services[service]}`,
    timeout: ENV.requestTimeoutMs,
    headers: { 'Content-Type': 'application/json' },
  });

  // Attach access token.
  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStore.getAccessToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });

  // Refresh-on-401, then normalize errors.
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

      if (error.response?.status === 401 && original && !original._retried) {
        original._retried = true;
        const newToken = await refreshOnce();
        if (newToken) {
          original.headers.set('Authorization', `Bearer ${newToken}`);
          return instance(original);
        }
        await logoutHandler?.();
      }
      return Promise.reject(normalizeError(error));
    },
  );

  clients.set(service, instance);
  return instance;
}
