import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '@/services/admin/adminService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/loaders/Spinner';
import { formatDate } from '@/utils/formatters';
import { getUserAvatar, getInitialsAvatar } from '@/utils/avatarUtils';

export function AdminUsersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSecurity, setSelectedSecurity] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [userPhotoMap, setUserPhotoMap] = useState({});

  const loadUsers = async (
    searchQuery = appliedSearch,
    status = selectedStatus,
    security = selectedSecurity
  ) => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (status === 'ACTIVE') {
        params.enabled = true;
      } else if (status === 'DISABLED') {
        params.enabled = false;
      }
      if (security === 'LOCKED') {
        params.accountLocked = true;
      } else if (security === 'UNLOCKED') {
        params.accountLocked = false;
      }

      const data = await adminService.searchUsers(params);
      const userList = data?.content || (Array.isArray(data) ? data : []);
      setUsers(userList);
      setTotalCount(data?.totalElements ?? userList.length);

      // Asynchronously fetch full profiles to retrieve actual uploaded pictures
      if (Array.isArray(userList) && userList.length > 0) {
        Promise.allSettled(
          userList.map((u) => adminService.getUserById(u.id))
        ).then((results) => {
          const photoMap = {};
          results.forEach((res) => {
            if (res.status === 'fulfilled' && res.value?.id && res.value?.profilePictureUrl) {
              photoMap[res.value.id] = res.value.profilePictureUrl;
            }
          });
          if (Object.keys(photoMap).length > 0) {
            setUserPhotoMap((prev) => ({ ...prev, ...photoMap }));
          }
        });
      }
    } catch (err) {
      console.error('Failed to load user accounts:', err);
      toast.error('Failed to load user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger load when applied search or filters change
  useEffect(() => {
    loadUsers(appliedSearch, selectedStatus, selectedSecurity);
  }, [appliedSearch, selectedStatus, selectedSecurity]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setAppliedSearch(trimmed);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setSelectedStatus('ALL');
    setSelectedSecurity('ALL');
  };

  const handleToggleActive = async (user) => {
    if (currentAuthUser?.id && user.id === currentAuthUser.id) {
      toast.warning('Governance Rule: You cannot deactivate your own administrator account.');
      return;
    }
    setActionLoadingId(user.id);
    const newEnabled = !user.enabled;
    try {
      if (user.enabled) {
        await adminService.deactivateUser(user.id);
        toast.success(`User "${user.fullName || user.email}" deactivated.`);
      } else {
        await adminService.activateUser(user.id);
        toast.success(`User "${user.fullName || user.email}" activated.`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, enabled: newEnabled } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user active status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleLock = async (user) => {
    if (currentAuthUser?.id && user.id === currentAuthUser.id) {
      toast.warning('Governance Rule: You cannot lock your own administrator account.');
      return;
    }
    setActionLoadingId(user.id);
    const newLocked = !user.accountLocked;
    try {
      if (user.accountLocked) {
        await adminService.unlockUser(user.id);
        toast.success(`User "${user.fullName || user.email}" account unlocked.`);
      } else {
        await adminService.lockUser(user.id);
        toast.success(`User "${user.fullName || user.email}" account locked.`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, accountLocked: newLocked } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user lock status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Client-side reactive filtering for instant UX
  const displayedUsers = users.filter((u) => {
    if (selectedStatus === 'ACTIVE' && !u.enabled) return false;
    if (selectedStatus === 'DISABLED' && u.enabled) return false;
    if (selectedSecurity === 'LOCKED' && !u.accountLocked) return false;
    if (selectedSecurity === 'UNLOCKED' && u.accountLocked) return false;
    return true;
  });

  // Telemetry counts
  const activeCount = users.filter((u) => u.enabled).length;
  const disabledCount = users.filter((u) => !u.enabled).length;
  const lockedCount = users.filter((u) => u.accountLocked).length;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* 1. Header Bar - Consistent Material Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-soft-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              User Account Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit user registrations, toggle account activation, and manage security locks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isLoading}
            onClick={() => loadUsers(appliedSearch, selectedStatus, selectedSecurity)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Situational Metric Cards (Clickable Filter Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Accounts */}
        <div
          onClick={() => {
            setSelectedStatus('ALL');
            setSelectedSecurity('ALL');
          }}
          title="Click to view all accounts"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'ALL' && selectedSecurity === 'ALL'
              ? 'border-purple-300 bg-purple-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Accounts
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {totalCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Platform users</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active Accounts */}
        <div
          onClick={() => {
            setSelectedStatus('ACTIVE');
            setSelectedSecurity('ALL');
          }}
          title="Click to filter active accounts"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'ACTIVE'
              ? 'border-emerald-300 bg-emerald-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Accounts
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tracking-tight">
              {activeCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Enabled & operational</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Disabled Accounts */}
        <div
          onClick={() => {
            setSelectedStatus('DISABLED');
            setSelectedSecurity('ALL');
          }}
          title="Click to filter disabled accounts"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedStatus === 'DISABLED'
              ? 'border-rose-300 bg-rose-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Disabled Accounts
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tracking-tight">
              {disabledCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Inactive / deactivated</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Locked Accounts */}
        <div
          onClick={() => {
            setSelectedSecurity('LOCKED');
            setSelectedStatus('ALL');
          }}
          title="Click to filter locked accounts"
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-soft-md active:scale-[0.98] flex items-center justify-between ${
            selectedSecurity === 'LOCKED'
              ? 'border-amber-300 bg-amber-50/25 shadow-soft-xs'
              : 'border-slate-200/80 bg-white shadow-soft-xs hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Security Locks
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-1 tracking-tight">
              {lockedCount}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Suspended access</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar (Matching Admin Products layout) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit(e);
              }}
              placeholder="Search by name or email (press Enter)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-soft-xs transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="md"
            className="rounded-2xl px-5 bg-purple-700 hover:bg-purple-800 text-white font-bold shrink-0 shadow-soft-xs"
          >
            Search
          </Button>
        </form>

        {/* Filter Controls: Status & Security */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Status Filter: Active (Undisabled) vs Inactive (Disabled) */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-soft-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (Enabled)</option>
              <option value="DISABLED">Inactive (Disabled)</option>
            </select>
          </div>

          {/* Security Filter: Normal vs Locked */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Security:
            </label>
            <select
              value={selectedSecurity}
              onChange={(e) => setSelectedSecurity(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-soft-xs cursor-pointer"
            >
              <option value="ALL">All Security</option>
              <option value="UNLOCKED">Normal (Unlocked)</option>
              <option value="LOCKED">Locked Accounts</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(appliedSearch || selectedStatus !== 'ALL' || selectedSecurity !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 underline underline-offset-2 shrink-0 px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Results Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-900">{displayedUsers.length}</strong> of{' '}
          <strong className="text-slate-900">{totalCount}</strong> accounts
        </span>
      </div>

      {/* 5. Main Content Table / Empty State */}
      {isLoading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-slate-200/90 shadow-soft-xs">
          <Spinner text="Loading user accounts..." />
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/90 p-8 shadow-soft-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto shadow-soft-xs">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No accounts found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {appliedSearch || selectedStatus !== 'ALL' || selectedSecurity !== 'ALL'
              ? 'No registered accounts match your current filters. Try changing your keywords or clearing filters.'
              : 'There are currently no registered user accounts.'}
          </p>
          {(appliedSearch || selectedStatus !== 'ALL' || selectedSecurity !== 'ALL') && (
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-soft-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User Account</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Roles</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Security</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {displayedUsers.map((u) => {
                  const isActionLoading = actionLoadingId === u.id;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="hover:bg-purple-50/20 transition-colors cursor-pointer group"
                    >
                      {/* User Column */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={getUserAvatar(u, userPhotoMap, currentAuthUser)}
                            alt={u.fullName || 'User'}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200/90 shadow-soft-xs bg-slate-100 flex-shrink-0"
                            onError={(e) => {
                              const fallback = getInitialsAvatar(u.fullName || 'User');
                              if (e.currentTarget.src !== fallback) {
                                e.currentTarget.src = fallback;
                              }
                            }}
                          />
                          <div>
                            <span
                              className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors block"
                            >
                              {u.fullName || 'Unnamed User'}
                            </span>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info Column */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phoneNumber || 'Not provided'}</span>
                        </div>
                        <div className="mt-1">
                          {u.phoneVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                              <CheckCircle2 className="w-3 h-3" /> Phone Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Roles Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.map((r, idx) => {
                            const roleName = typeof r === 'string' ? r : r.name;
                            const isAdminRole = roleName === 'ADMIN' || roleName === 'ROLE_ADMIN';
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                                  isAdminRole
                                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {roleName}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            u.enabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.enabled ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Security Column */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                            u.accountLocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {u.accountLocked ? (
                            <>
                              <Lock className="w-3 h-3 text-rose-600" /> Locked
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-slate-500" /> Normal
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Active Status */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(u);
                            }}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              u.enabled
                                ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                                : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                            title={u.enabled ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {u.enabled ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          {/* Toggle Account Lock */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLock(u);
                            }}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              u.accountLocked
                                ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                            title={u.accountLocked ? 'Unlock Account' : 'Lock Account'}
                          >
                            {u.accountLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

