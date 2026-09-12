import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { authService } from '@/services/auth/authService';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/loaders/Spinner';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();

  const [status, setStatus] = useState(token ? 'verifying' : 'idle'); // 'verifying', 'success', 'error', 'idle'
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      async function verify() {
        try {
          await authService.verifyEmail(token);
          setStatus('success');
          toast.success('Email verified successfully! You can now log in.');
        } catch (err) {
          setStatus('error');
          setErrorMessage(err.message || 'The email verification link is invalid or has expired.');
        }
      }
      verify();
    }
  }, [token, toast]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.warning('Please provide your registered email address.');
      return;
    }
    setIsResending(true);
    try {
      await authService.resendVerificationEmail(resendEmail.trim());
      toast.success('A new verification email has been dispatched. Please check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft-xl text-center space-y-6 animate-slide-up">
        {status === 'verifying' && (
          <div className="py-8">
            <Spinner size="lg" text="Verifying your email token with server..." />
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-brand-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Email Verified!</h2>
              <p className="text-sm text-slate-600">
                Your email address has been verified. You now have full access to place orders and sell produce.
              </p>
            </div>
            <Link to="/login" className="block">
              <Button size="lg" className="w-full" icon={ArrowRight}>
                Sign In Now
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Verification Failed</h2>
              <p className="text-sm text-rose-600 leading-relaxed">{errorMessage}</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-4">Request a fresh verification link below:</p>
              <form onSubmit={handleResend} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter registered email"
                  icon={Mail}
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="secondary" className="w-full" size="md" isLoading={isResending}>
                  Resend Verification Email
                </Button>
              </form>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Verify Your Email</h2>
              <p className="text-xs text-slate-500">
                Enter your email address to receive a new verification activation link.
              </p>
            </div>
            <form onSubmit={handleResend} className="space-y-4 text-left">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" isLoading={isResending} icon={RefreshCw}>
                Send Verification Email
              </Button>
            </form>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Back to{' '}
              <Link to="/login" className="font-bold text-brand-700 hover:text-brand-800">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
