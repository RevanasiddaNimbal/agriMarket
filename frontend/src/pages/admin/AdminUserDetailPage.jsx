import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Lock,
  Unlock,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { formatDate } from '@/utils/formatters';
import { getUserAvatar, getInitialsAvatar } from '@/utils/avatarUtils';

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const toast = useToast();
  const { user: currentAuthUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUserById(userId);
      setUser(data);
    } catch (err) {
      toast.error('Failed to load user profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  const handleToggleLock = async () => {
    if (currentAuthUser?.id && userId === currentAuthUser.id) {
      toast.warning('Governance Rule: You cannot lock your own administrator account.');
      return;
    }
    try {
      if (user.accountLocked) {
        await adminService.unlockUser(userId);
        toast.success('Account unlocked.');
      } else {
        await adminService.lockUser(userId);
        toast.success('Account locked.');
      }
      await loadUser();
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center text-white">
        <Spinner text="Loading user records..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400">
        User record not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/admin/users">
            <Button variant="outline" size="sm" icon={ArrowLeft} className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Back to Users
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              User Profile: {user.fullName || 'User Details'}
            </h1>
          </div>
        </div>

        <Button
          size="sm"
          variant={user.accountLocked ? 'earth' : 'danger'}
          onClick={handleToggleLock}
          icon={user.accountLocked ? Unlock : Lock}
          className="self-start sm:self-center"
        >
          {user.accountLocked ? 'Unlock Account' : 'Lock Account'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity & Contact */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-xs space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={getUserAvatar(user)}
              alt={user.fullName || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-soft-xs bg-slate-100"
              onError={(e) => {
                const fallback = getInitialsAvatar(user?.fullName || 'User');
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
            <div>
              <h3 className="font-bold text-lg text-slate-900">{user.fullName || 'Unnamed User'}</h3>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    user.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {user.enabled ? 'Active' : 'Disabled'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    user.accountLocked
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {user.accountLocked ? 'Locked' : 'Unlocked'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Phone Number:</span>
              <span className="text-slate-900 font-semibold">{user.phoneNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Email Verified:</span>
              <span className={user.emailVerified ? 'text-emerald-700 font-bold' : 'text-amber-600'}>
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Phone Verified:</span>
              <span className={user.phoneVerified ? 'text-emerald-700 font-bold' : 'text-amber-600'}>
                {user.phoneVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Account Details & Audit Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-purple-700">Account Details & Audit</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Registered Date</span>
              <p className="text-slate-900 font-bold mt-1 text-sm">{formatDate(user.createdAt, true) || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Last Updated</span>
              <p className="text-slate-900 font-bold mt-1 text-sm">{formatDate(user.updatedAt, true) || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Saved Addresses</span>
              <p className="text-slate-900 font-bold mt-1 text-sm">{user.addressCount ?? 0} address records</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Password Setup</span>
              <p className="text-slate-900 font-bold mt-1 text-sm">{user.hasPassword ? 'Configured' : 'No Password (OTP/Google)'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
