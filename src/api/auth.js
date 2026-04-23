// Mock — replace with real fetch() when backend is ready
// Real endpoint: POST /api/auth/login  { username, password }

// OLD MOCK CODE
/*const MOCK_CREDENTIALS = { username: "admin", password: "admin123" };

export async function apiLogin(username, password) {
  await new Promise((r) => setTimeout(r, 800)); // simulate network
  if (username === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password) {
    return {
      token: "mock.jwt.token_" + Date.now(),
      user: { username, role: "admin" },
    };
  }
  throw new Error("Invalid username or password");
}

export async function apiLogout(_token) {
  await new Promise((r) => setTimeout(r, 300));
  // Real: fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${_token}` } })
}
*/
// Can change API_BASE to env variable later if needed
const API_BASE = "http://127.0.0.1:8000";

export async function apiLogin(username, password) {
  const response = await fetch(`${API_BASE}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail || "Login failed");
  }

  const data = await response.json();

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  return {
    token: data.access,
    refresh: data.refresh,
    user: { username, role: "admin" },
  };
}

export async function apiLogout(_token) {
  // frontend-only logout: clear token from localStorage/context
  // optionally implement a backend logout endpoint if you add one later
}