'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ADMIN_SESSION_KEY = 'admin_authenticated';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            const isValid =
              data.authenticated &&
              Date.now() - data.timestamp < SESSION_DURATION;
            setIsAuthenticated(isValid);
            if (!isValid) {
              sessionStorage.removeItem(ADMIN_SESSION_KEY);
            }
          } catch {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Call server-side verification
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Store authentication in sessionStorage
        sessionStorage.setItem(
          ADMIN_SESSION_KEY,
          JSON.stringify({
            authenticated: true,
            timestamp: Date.now(),
          })
        );
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Access
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Enter your credentials to continue
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="username"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="h-12"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-xs text-center text-slate-500 mt-6">
              Session expires after 4 hours of inactivity
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Logout button in top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
}
