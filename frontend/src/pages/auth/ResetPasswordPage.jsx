import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth/authService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const toast = useToast();

  const [formData, setFormData] = useState({
    token: tokenFromUrl ? tokenFromUrl.trim() : '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setFormData((prev) => ({ ...prev, token: tokenFromUrl.trim() }));
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');

    const token = formData.token.trim();

    if (!token) {
      setErrors((prev) => ({ ...prev, token: 'Reset token is required' }));
      setErrorMessage('Reset token is missing. Please click the link from your email or enter your token below.');
      return;
    }
    if (!formData.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      return;
    }
    if (formData.newPassword.length < 8) {
      setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setIsSuccess(true);
      toast.success('Password has been successfully updated! You can now log in.');
    } catch (err) {
      if (err.validationErrors && Object.keys(err.validationErrors).length > 0) {
        setErrors(err.validationErrors);
      }
      const msg = err.message || 'Failed to reset password. The link may have expired.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-500">
            Create a secure new password for your AgriMarket account.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-brand-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-sm text-slate-700 font-medium">
              Your password has been changed successfully.
            </p>
            <Link to="/login" className="block">
              <Button size="lg" className="w-full" icon={ArrowRight}>
                Sign In with New Password
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed text-center space-y-1">
                <p className="font-semibold">{errorMessage}</p>
                <Link
                  to="/forgot-password"
                  className="text-brand-700 underline font-bold inline-block"
                >
                  Request a new password reset link
                </Link>
              </div>
            )}

            {!tokenFromUrl && (
              <Input
                label="Reset Token"
                placeholder="Paste token from reset email"
                value={formData.token}
                onChange={(e) => {
                  setFormData({ ...formData, token: e.target.value });
                  if (errors.token) setErrors({ ...errors, token: '' });
                }}
                error={errors.token}
                required
              />
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              icon={Lock}
              value={formData.newPassword}
              onChange={(e) => {
                setFormData({ ...formData, newPassword: e.target.value });
                if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
              }}
              error={errors.newPassword}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Update Password
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
