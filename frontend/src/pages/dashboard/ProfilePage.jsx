import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  Camera,
  MapPin,
  Lock,
  ArrowRight,
  Smartphone,
  Edit3,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { userService } from '@/services/user/userService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/loaders/Spinner';

export function ProfilePage() {
  const { user, refreshProfile, hasPassword, setHasPassword } = useAuth();
  const toast = useToast();

  // Full Name State
  const [fullNameInput, setFullNameInput] = useState(user?.fullName || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Profile Picture State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Phone Number & OTP State
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync inputs on user profile update
  useEffect(() => {
    if (user?.fullName) setFullNameInput(user.fullName);
    if (user?.phoneNumber) setPhoneInput(user.phoneNumber);
  }, [user]);

  // Resend OTP countdown
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const cleanPhone = (phone) => (phone || '').replace(/[\s\-()]/g, '').trim();

  // -------------------------------------------------------------
  // Full Name Update Handler
  // -------------------------------------------------------------
  const handleUpdateName = async (e) => {
    e.preventDefault();
    const trimmed = fullNameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      toast.warning('Full name must be at least 2 characters.');
      return;
    }

    if (trimmed === (user?.fullName || '').trim()) {
      return;
    }

    setIsUpdatingName(true);
    try {
      await userService.updateFullName(trimmed);
      toast.success('Full name updated successfully.');
      await refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update full name.';
      toast.error(msg);
    } finally {
      setIsUpdatingName(false);
    }
  };

  // -------------------------------------------------------------
  // Profile Photo Upload Handler
  // -------------------------------------------------------------
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Image size must be less than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await userService.updateProfilePicture(file);
      toast.success('Profile picture updated successfully!');
      await refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload photo.';
      toast.error(msg);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // -------------------------------------------------------------
  // Phone OTP: Send Code
  // -------------------------------------------------------------
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    const cleaned = cleanPhone(phoneInput);

    if (!cleaned || cleaned.length < 10) {
      toast.warning('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (user?.phoneVerified && cleaned === cleanPhone(user?.phoneNumber)) {
      toast.info('This phone number is already verified on your account.');
      setIsChangingPhone(false);
      return;
    }

    setIsSendingOtp(true);
    try {
      await userService.sendPhoneOtp(cleaned);
      setOtpSent(true);
      setOtpCountdown(30);
      toast.success(`Verification code sent to ${cleaned}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // -------------------------------------------------------------
  // Phone OTP: Resend Code
  // -------------------------------------------------------------
  const handleResendPhoneOtp = async () => {
    if (otpCountdown > 0) return;
    const cleaned = cleanPhone(phoneInput);

    setIsSendingOtp(true);
    try {
      await userService.resendPhoneOtp(cleaned);
      setOtpCountdown(30);
      toast.success('A fresh verification code has been sent.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend code.';
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // -------------------------------------------------------------
  // Phone OTP: Verify Code
  // -------------------------------------------------------------
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length < 4) {
      toast.warning('Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const cleaned = cleanPhone(phoneInput);
      await userService.verifyPhoneOtp({
        phoneNumber: cleaned,
        otp: code,
      });

      toast.success('Phone number verified successfully!');
      setOtpSent(false);
      setOtpCode('');
      setIsChangingPhone(false);
      await refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code.';
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // -------------------------------------------------------------
  // Password Handler: Set Password or Change Password
  // -------------------------------------------------------------
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    const isSetMode = hasPassword === false;

    if (!isSetMode && !currentPassword.trim()) {
      toast.warning('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.warning('New password must be at least 8 characters long.');
      return;
    }

    // Backend password complexity check
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      toast.warning('Password must include uppercase, lowercase, number, and special character.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (isSetMode) {
        await userService.setPassword({
          newPassword,
          confirmNewPassword: confirmPassword,
        });
        toast.success('Password configured successfully! You can now sign in with your email & password.');
        if (setHasPassword) setHasPassword(true);
      } else {
        await userService.changePassword({
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        });
        toast.success('Password updated successfully.');
      }

      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errCode = err.response?.data?.code || '';
      const msg = err.response?.data?.message || err.message || 'Failed to update password.';

      if (
        errCode === 'PASSWORD_LOGIN_NOT_AVAILABLE' ||
        msg.toLowerCase().includes('not set') ||
        msg.toLowerCase().includes('not configured')
      ) {
        toast.info('No password was configured for this account.');
        if (setHasPassword) setHasPassword(false);
        return;
      }

      if (
        errCode === 'PASSWORD_ALREADY_SET' ||
        msg.toLowerCase().includes('already set') ||
        msg.toLowerCase().includes('already configured')
      ) {
        toast.info('A password is already set on your account.');
        if (setHasPassword) setHasPassword(true);
        return;
      }

      if (errCode === 'INVALID_CURRENT_PASSWORD' || msg.toLowerCase().includes('current password')) {
        toast.error('The current password you entered is incorrect. Please try again.');
        return;
      }

      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const hasNameChanged = fullNameInput.trim() !== (user?.fullName || '').trim();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-8">
      {/* ============================================================ */}
      {/* 1. PERSONAL INFORMATION CARD                                */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm hover:shadow-soft-md transition-all space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Personal Information</h3>
            <p className="text-xs sm:text-sm text-slate-500">Manage your profile picture, display name, and email.</p>
          </div>
        </div>

        {/* Profile Avatar & Details Layout */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-7">
          {/* Avatar only - clean styling with camera icon overlay, strictly NO text below image */}
          <div className="relative flex-shrink-0">
            <img
              src={
                user?.profilePictureUrl ||
                'https://img.magnific.com/premium-psd/avatar-job-profession-3d-illustration-icon_824633-9644.jpg?semt=ais_hybrid&w=740&q=80'
              }
              alt={user?.fullName || 'User'}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-soft-sm bg-slate-50 ring-4 ring-slate-50/60"
              onError={(e) => {
                e.target.src =
                  'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(user?.fullName || 'User') +
                  '&background=16a34a&color=fff';
              }}
            />
            {/* Camera badge button at bottom-right corner */}
            <label
              htmlFor="avatar-upload-input"
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-slate-900 text-white hover:bg-emerald-600 shadow-soft-md cursor-pointer transition-all hover:scale-105"
              title="Change profile photo"
            >
              {isUploadingPhoto ? (
                <Spinner size="xs" className="text-white" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </label>
            <input
              id="avatar-upload-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={isUploadingPhoto}
            />
          </div>

          {/* Form Fields: Full Name & Email */}
          <div className="flex-1 w-full space-y-4">
            {/* Full Name with Proper Aligned Update Buttons */}
            <form onSubmit={handleUpdateName} className="space-y-2">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                icon={User}
                required
              />

              {/* Action buttons shown cleanly below input when name is edited */}
              {hasNameChanged && (
                <div className="flex items-center justify-end gap-2.5 pt-1 animate-fade-in">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFullNameInput(user?.fullName || '')}
                    disabled={isUpdatingName}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="earth"
                    isLoading={isUpdatingName}
                    disabled={!fullNameInput.trim()}
                  >
                    Update Name
                  </Button>
                </div>
              )}
            </form>

            {/* Email Field (Read-only) */}
            <div className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900 truncate">{user?.email}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PHONE NUMBER & VERIFICATION CARD                         */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm hover:shadow-soft-md transition-all space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Mobile Phone Number</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Used for SMS order alerts, farmer contact, and customer delivery OTP handovers.
            </p>
          </div>
        </div>

        {/* View 1: Number is Already Verified (Idle View) */}
        {user?.phoneVerified && !isChangingPhone && !otpSent && (
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <Smartphone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-mono text-sm font-semibold text-slate-900 tracking-wide">
                  +91 {user?.phoneNumber}
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPhoneInput(user?.phoneNumber || '');
                    setIsChangingPhone(true);
                  }}
                  className="gap-1 font-medium text-xs py-1 h-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Change
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Unverified OR Changing Number (Before OTP) */}
        {(!user?.phoneVerified || isChangingPhone) && !otpSent && (
          <form onSubmit={handleSendPhoneOtp} className="space-y-2 animate-fade-in">
            <Input
              label="Mobile Phone Number"
              type="tel"
              placeholder="e.g. 9876543210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              icon={Smartphone}
              required
              autoFocus={isChangingPhone}
              helperText="Enter 10-digit mobile number to receive an SMS verification code."
            />
            <div className="flex items-center justify-end gap-2.5 pt-1">
              {isChangingPhone && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPhoneInput(user?.phoneNumber || '');
                    setIsChangingPhone(false);
                  }}
                  disabled={isSendingOtp}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" size="sm" variant="earth" isLoading={isSendingOtp}>
                Send OTP
              </Button>
            </div>
          </form>
        )}

        {/* View 3: OTP Sent - Enter Code */}
        {otpSent && (
          <form onSubmit={handleVerifyPhoneOtp} className="space-y-3 pt-1 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 pb-1">
              <div>
                Verification code sent to <strong className="font-mono text-slate-900">+91 {phoneInput}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className="text-brand-600 hover:text-brand-700 underline font-medium self-start sm:self-auto"
              >
                Change Number
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••••"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-36 h-10 px-3 text-center font-mono text-base font-bold tracking-[0.25em] rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 placeholder:tracking-widest focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                autoFocus
                required
              />
              <Button
                type="submit"
                size="sm"
                variant="earth"
                isLoading={isVerifyingOtp}
                disabled={otpCode.length < 4}
              >
                Verify OTP
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleResendPhoneOtp}
                disabled={otpCountdown > 0 || isSendingOtp}
              >
                {otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Resend'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode('');
                  setIsChangingPhone(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. PASSWORD & SECURITY CARD (SET OR CHANGE PASSWORD)        */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm hover:shadow-soft-md transition-all space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            {hasPassword === false ? <KeyRound className="w-5 h-5 text-amber-600" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              {hasPassword === false ? 'Set Password' : 'Password & Security'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {hasPassword === false
                ? 'Create a password to enable direct login with email & password.'
                : 'Manage your password to keep your account safe.'}
            </p>
          </div>
        </div>

        {/* Collapsed Status View */}
        {!isChangingPassword && (
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Account Password
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 min-h-[42px]">
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {hasPassword === false ? (
                  <span className="text-sm text-slate-500 italic">No password set (Google / OTP account)</span>
                ) : (
                  <span className="text-sm font-semibold tracking-widest text-slate-700">••••••••••••</span>
                )}
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {hasPassword === false ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Not Set
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                )}
                <Button
                  type="button"
                  variant={hasPassword === false ? 'earth' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setIsChangingPassword(true);
                  }}
                  className="gap-1 font-medium text-xs py-1 h-auto"
                >
                  {hasPassword === false ? (
                    <>
                      <KeyRound className="w-3.5 h-3.5" /> Set Password
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" /> Change
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Change / Set Password Form */}
        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1 animate-fade-in">
            {/* Current Password - Only required and shown if user has a password */}
            {hasPassword !== false && (
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                icon={Lock}
                required
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                icon={hasPassword === false ? KeyRound : Lock}
                required
                helperText="Min 8 characters with uppercase, lowercase, number & symbol."
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-type new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                icon={hasPassword === false ? KeyRound : Lock}
                required
              />
            </div>

            {/* Action Buttons: Cancel and Submit (strictly NO switch questions) */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsChangingPassword(false)}
                disabled={isUpdatingPassword}
              >
                Cancel
              </Button>
              <Button type="submit" variant="earth" size="sm" isLoading={isUpdatingPassword}>
                {hasPassword === false ? 'Set Password' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. FARM & DELIVERY LOCATIONS BANNER (KEPT AT BOTTOM)        */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Farm & Delivery Locations</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your farm fields, storage warehouses, and customer delivery destinations.
            </p>
          </div>
        </div>
        <Link to="/dashboard/locations" className="flex-shrink-0 w-full sm:w-auto">
          <Button variant="outline" size="md" className="gap-2 font-semibold w-full sm:w-auto">
            Manage Locations <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
