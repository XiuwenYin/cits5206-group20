// Mock — replace with real fetch() when backend is ready
// Real endpoint: POST /api/auth/login  { username, password }

const MOCK_CREDENTIALS = { username: "admin", password: "admin123" };

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