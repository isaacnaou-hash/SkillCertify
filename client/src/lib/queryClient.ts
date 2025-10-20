import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};

  // Add user auth token for protected routes
  const authToken = localStorage.getItem('auth_token');
  if (authToken && (url.includes('/users/') || url.includes('/test-sessions') || url.includes('/resume-session'))) {
    headers['x-auth-token'] = authToken;
  }

  // Add session token if URL contains session ID
  const sessionIdMatch = url.match(/\/test-sessions\/([^\/\?]+)/);
  if (sessionIdMatch) {
    const sessionId = sessionIdMatch[1];
    const sessionToken = localStorage.getItem(`session_token_${sessionId}`);
    if (sessionToken) {
      headers['x-session-token'] = sessionToken;
    }
  }

  // Add session token for test answers (extract from data)
  if (url.includes('/test-answers') && data && typeof data === 'object' && 'sessionId' in data) {
    const sessionId = (data as any).sessionId;
    const sessionToken = localStorage.getItem(`session_token_${sessionId}`);
    if (sessionToken) {
      headers['x-session-token'] = sessionToken;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const headers: Record<string, string> = {};

    // Add user auth token for protected routes
    const authToken = localStorage.getItem('auth_token');
    if (authToken && (url.includes('/users/') || url.includes('/test-sessions') || url.includes('/incomplete-sessions'))) {
      headers['x-auth-token'] = authToken;
    }

    // Add session token if URL contains session ID
    const sessionIdMatch = url.match(/\/test-sessions\/([^\/\?]+)/);
    if (sessionIdMatch) {
      const sessionId = sessionIdMatch[1];
      const sessionToken = localStorage.getItem(`session_token_${sessionId}`);
      if (sessionToken) {
        headers['x-session-token'] = sessionToken;
      }
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
