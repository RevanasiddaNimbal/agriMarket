import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sprout, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export function RegisterPage() {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: 'Full name is required' }));
      return;
    }
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email address is required' }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }
    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setIsSuccess(true);
      toast.success('Registration successful! Please check your email to verify.');
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      }
      toast.error(err.message || 'Registration failed. Please check the entered information.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft-xl text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-brand-600 flex items-center justify-center mx-auto shadow-soft-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Your Email</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We have sent a secure verification link to <strong className="text-slate-900">{formData.email}</strong>. Please check your inbox and click the link to activate your account.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <Link to="/login" state={{ email: formData.email }} className="block">
              <Button size="lg" className="w-full">
                Proceed to Sign In
              </Button>
            </Link>
            <Link to="/verify-email" className="block text-xs font-semibold text-slate-500 hover:text-brand-600">
              Need to resend verification email?
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join AgriMarket as a grower, buyer, or agricultural enterprise
          </p>
        </div>

        {/* OAuth2 Fast Register (Google & GitHub) */}
        <OAuthButtons redirectPath="/dashboard" disabled={isLoading} />

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            or sign up with email
          </span>
        </div>

        {/* Form — strictly no phone field during initial registration */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Patil"
            icon={User}
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
            disabled={isLoading}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="ramesh@example.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            helperText="Must be minimum 8 characters with letters and numbers"
            disabled={isLoading}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            icon={UserPlus}
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-700 hover:text-brand-800">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
