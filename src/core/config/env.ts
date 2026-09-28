/**
 * Environment-driven configuration.
 *
 * SECURITY: No secrets (API keys, client secrets) belong here or anywhere in
 * the JS bundle — the bundle is fully readable on a device. Only non-sensitive,
 * public configuration (base URLs, feature flags, timeouts) lives here.
 *
 * Values are sourced from Expo's `extra` config (app.config / EAS env). For
 * real secrets at build time use EAS Secrets, and for runtime secrets keep
 * them server-side behind the API gateway.
 */
import Constants from 'expo-constants';

type Extra = {
  /** Base URL of the API gateway that fronts the backend microservices. */
  apiGatewayUrl?: string;
  /** Per-service base paths, relative to the gateway (microservice routing). */
  services?: Partial<Record<ServiceName, string>>;
  /** When true, the app uses in-memory mock services instead of real HTTP. */
  useMocks?: boolean;
  /** Request timeout in milliseconds. */
  requestTimeoutMs?: number;
};

export type ServiceName = 'auth' | 'accounts' | 'payments' | 'profile';

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const ENV = {
  apiGatewayUrl: extra.apiGatewayUrl ?? 'http://localhost:8080',
  services: {
    auth: extra.services?.auth ?? '/auth',
    accounts: extra.services?.accounts ?? '/accounts',
    payments: extra.services?.payments ?? '/payments',
    profile: extra.services?.profile ?? '/profile',
  } as Record<ServiceName, string>,
  // Connect to live microservices gateway
  useMocks: extra.useMocks ?? false,
  requestTimeoutMs: extra.requestTimeoutMs ?? 15_000,
} as const;
