/**
 * src/tests/ProtectedRoute.test.jsx
 * Tests for the ProtectedRoute component.
 * Verifies that unauthenticated users are redirected and
 * authenticated users can see the protected content.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock AuthContext so we can control isAuthenticated
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(isAuthenticated) {
  mockUseAuth.mockReturnValue({ isAuthenticated });
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Routes>
        <Route path="/admin/login" element={<div>Login Page</div>} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    renderWithRouter(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children when user is not authenticated', () => {
    renderWithRouter(false);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /admin/login when not authenticated', () => {
    renderWithRouter(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
