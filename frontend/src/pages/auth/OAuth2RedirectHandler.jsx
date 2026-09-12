import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, RotateCcw, Sprout, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/auth/authService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';

export function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const navigate = useNavigate();
  const { handleOAuthSuccess } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const exchangeAttemptedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (exchangeAttemptedRef.current) return;
    exchangeAttemptedRef.current = true;

    async function processOAuthCallback() {
      // 1. Check for OAuth Provider Error
      if (error) {
        let friendlyMsg = 'Sign in was cancelled or denied by the provider.';
        if (error === 'access_denied') {
          friendlyMsg = 'You cancelled the authorization request.';
        } else if (errorDescription) {
          friendlyMsg = decodeURIComponent(errorDescription);
        }
        setStatus('error');
        setErrorMessage(friendlyMsg);
        toast.error(friendlyMsg);
        return;
      }

      // 2. Check for missing Code
      if (!code) {
        const msg = 'No authentication code was received from the provider.';
        setStatus('error');
        setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      // 3. Perform Backend Exchange
      try {
        setStatus('processing');
        const authResult = await authService.exchangeOAuthCode(code);
        
        // Update user auth state in Context
        await handleOAuthSuccess(authResult);

        setStatus('success');
        toast.success('Successfully authenticated! Welcome to AgriMarket.');

        // Retrieve saved target or default to /dashboard
        const targetPath = sessionStorage.getItem('agri_oauth_redirect') || '/dashboard';
        sessionStorage.removeItem('agri_oauth_redirect');

        // Navigate to target destination
        navigate(targetPath, { replace: true });
      } catch (err) {
        console.error('OAuth token exchange error:', err);
        setStatus('error');

        let userMsg = 'Failed to complete OAuth authentication. Please try again.';
        if (err?.code === 'INVALID_OAUTH_LOGIN_CODE' || err?.message?.includes('INVALID_OAUTH_LOGIN_CODE')) {
          userMsg = 'Invalid authorization code or session expired.';
        } else if (err?.code === 'OAUTH_LOGIN_CODE_EXPIRED' || err?.message?.includes('OAUTH_LOGIN_CODE_EXPIRED')) {
          userMsg = 'Your sign-in authorization code has expired. Please sign in again.';
        } else if (err?.code === 'OAUTH_LOGIN_CODE_ALREADY_USED' || err?.message?.includes('OAUTH_LOGIN_CODE_ALREADY_USED')) {
          userMsg = 'This sign-in code has already been consumed. Please try again.';
        } else if (err?.code === 'ERR_USER_DISABLED' || err?.message?.includes('ERR_USER_DISABLED')) {
          userMsg = 'Your account has been deactivated. Please contact support.';
        } else if (err?.code === 'PERMANENT_ACCOUNT_LOCKED' || err?.message?.includes('PERMANENT_ACCOUNT_LOCKED')) {
          userMsg = 'Your account has been locked for security reasons.';
        } else if (err?.message) {
          userMsg = err.message;
        }

        setErrorMessage(userMsg);
        toast.error(userMsg);
      }
    }

    processOAuthCallback();
  }, [code, error, errorDescription, handleOAuthSuccess, navigate, toast]);

  if (status === 'error') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-soft-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
            <AlertCircle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Authentication Failed
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              {errorMessage || 'Unable to verify your account credentials with the provider.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <Link to="/login" className="block">
              <Button size="lg" className="w-full" icon={RotateCcw}>
                Back to Sign In
              </Button>
            </Link>
            <Link to="/register" className="block">
              <Button size="lg" variant="outline" className="w-full">
                Create New Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 shadow-soft-sm">
        <Sprout className="w-8 h-8" />
      </div>
      <Spinner
        size="lg"
        text={
          status === 'success'
            ? 'Authentication verified! Redirecting to your destination...'
            : 'Completing secure authentication with backend...'
        }
      />
    </div>
  );
}
