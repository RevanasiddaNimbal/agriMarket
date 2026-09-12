import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, Send } from 'lucide-react';
import { authService } from '@/services/auth/authService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setIsSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500">
            Enter your account email to receive a secure password reset link.
          </p>
        </div>

        {isSent ? (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="p-4 rounded-2xl bg-emerald-50 text-brand-800 text-xs leading-relaxed border border-emerald-200">
              A password reset link has been dispatched to <strong>{email}</strong>. Please check your inbox and click the reset link.
            </div>
            <Link to="/login" className="block">
              <Button variant="outline" size="md" className="w-full" icon={ArrowLeft}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              icon={Send}
            >
              Send Reset Link
            </Button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
