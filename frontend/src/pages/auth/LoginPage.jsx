import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sprout, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // If already authenticated, redirect directly to destination
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectPath]);

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email address is required' }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setIsLoading(true);
    try {
      await login(formData);
      toast.success('Signed in successfully! Welcome back.');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      }
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-soft-sm mb-2 hover:bg-brand-700 transition-colors"
          >
            <Sprout className="w-7 h-7" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to manage your harvest listings, orders, and advisory
          </p>
        </div>

        {/* OAuth2 Providers (Google & GitHub) */}
        <OAuthButtons redirectPath={redirectPath} disabled={isLoading} />

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            or sign in with email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            icon={LogIn}
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an AgriMarket account?{' '}
          <Link to="/register" className="font-bold text-brand-700 hover:text-brand-800">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
