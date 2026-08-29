"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiClientError } from "@/lib/api-client";

export const AUTH_SESSION_QUERY_KEY = ["auth", "session"] as const;

const UNAUTHORIZED_REDIRECT_WINDOW_MS = 2000;

let lastUnauthorizedRedirectAt = 0;

function handleUnauthorized(error: unknown) {
  if (typeof window === "undefined") return;
  if (!(error instanceof ApiClientError) || error.status !== 401) return;
  if (window.location.pathname === "/login") return;

  const now = Date.now();
  if (now - lastUnauthorizedRedirectAt < UNAUTHORIZED_REDIRECT_WINDOW_MS) {
    return;
  }
  lastUnauthorizedRedirectAt = now;

  getQueryClient().removeQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
  // Global QueryCache callback: useRouter is not available here, so a hard
  // navigation is the only way to leave the protected page.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/login");
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export { getQueryClient };
