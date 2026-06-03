import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  // Fallback to local dev URL so Vitest runs without VITE_API_URL configured
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/v1',
  withCredentials: true, // Send HttpOnly cookies on every request
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers && 'Content-Type' in config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type'];
    }
    return config;
  }

  config.headers = config.headers ?? {};
  if (!('Content-Type' in config.headers)) {
    (config.headers as Record<string, unknown>)['Content-Type'] = 'application/json';
  }
  return config;
});

// ─── Auth observers ───────────────────────────────────────────────────────────
// Components subscribe to these to react to session changes without coupling
// the API layer to the React component tree.

type EventCallback = () => void;
const unauthorizedCallbacks: EventCallback[] = [];
const sessionExtendedCallbacks: EventCallback[] = [];

export const onUnauthorized = (cb: EventCallback) => {
  unauthorizedCallbacks.push(cb);
  return () => {
    const i = unauthorizedCallbacks.indexOf(cb);
    if (i > -1) unauthorizedCallbacks.splice(i, 1);
  };
};

export const onSessionExtended = (cb: EventCallback) => {
  sessionExtendedCallbacks.push(cb);
  return () => {
    const i = sessionExtendedCallbacks.indexOf(cb);
    if (i > -1) sessionExtendedCallbacks.splice(i, 1);
  };
};

// ─── Refresh mutex ────────────────────────────────────────────────────────────
// Coalesces concurrent 401s into a single refresh request. All waiting
// requests retry once the single refresh resolves.

let refreshPromise: Promise<void> | null = null;
let refreshFailed = false;

const attemptRefresh = (): Promise<void> => {
  if (refreshFailed) {
    return Promise.reject(new Error('Refresh already failed'));
  }
  if (refreshPromise) return refreshPromise;

  refreshPromise = api
    .post('/auth/refresh')
    .then(() => {
      refreshFailed = false;
      [...sessionExtendedCallbacks].forEach((cb) => {
        try {
          cb();
        } catch (e) {
          console.error('Session extended callback failed:', e);
        }
      });
    })
    .catch((err: AxiosError) => {
      // Only force logout on definitive auth failures (401/403).
      // Network errors let the original request fail naturally.
      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshFailed = true;
        [...unauthorizedCallbacks].forEach((cb) => {
          try {
            cb();
          } catch (e) {
            console.error('Unauthorized callback failed:', e);
          }
        });
      }
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// ─── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    // Only intercept 401s — and never retry the refresh call itself to avoid loops.
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !refreshFailed &&
      !original.url?.endsWith('/auth/refresh')
    ) {
      original._retried = true;
      try {
        await attemptRefresh();
        return api(original); // Retry the original request
      } catch {
        // Refresh failed — propagate the original 401
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
