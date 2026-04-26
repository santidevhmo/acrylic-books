export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type AuthResponse = {
  user: {
    id: number;
    email: string;
  } | null;
};

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  return JSON.parse(text) as { error?: string; user?: AuthResponse["user"] };
}

async function sendAuthRequest(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: { email: string; password: string };
  } = {}
) {
  const method = options.method ?? (options.body ? "POST" : "GET");
  const response = await fetch(path, {
    method,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    credentials: "same-origin",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw new ApiError(data.error ?? "Request failed.", response.status);
  }

  return data as AuthResponse;
}

export function signup(credentials: { email: string; password: string }) {
  return sendAuthRequest("/api/auth/signup", {
    method: "POST",
    body: credentials,
  });
}

export function login(credentials: { email: string; password: string }) {
  return sendAuthRequest("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function logout() {
  return sendAuthRequest("/api/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return sendAuthRequest("/api/auth/me");
}
