import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth/authService';
import { userService } from '@/services/user/userService';
import { adminService } from '@/services/admin/adminService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('agri_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('agri_is_admin') === 'true';
    } catch {
      return false;
    }
  });
  const [hasPassword, setHasPasswordState] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_has_password');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const setHasPassword = useCallback((val) => {
    setHasPasswordState(val);
    try {
      localStorage.setItem('agri_has_password', JSON.stringify(val));
    } catch {}
  }, []);

  // Verify admin role (stores result to keep admin navigation instantly accessible)
  const verifyAdminPrivilege = async () => {
    try {
      await adminService.getDashboard();
      setIsAdmin(true);
      localStorage.setItem('agri_is_admin', 'true');
      return true;
    } catch {
      setIsAdmin(false);
      localStorage.removeItem('agri_is_admin');
      return false;
    }
  };

  // Fetch authenticated user profile (supports both cookie-based auth and Bearer token)
  const fetchUserProfile = useCallback(async (force = false) => {
    const token = localStorage.getItem('agri_access_token');
    const hasSession = localStorage.getItem('agri_auth_session') === 'true';

    // If no token, no recorded session, and not forced, skip network call to prevent unwanted 401s for guests
    if (!token && !hasSession && !force) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return null;
    }

    try {
      const profile = await userService.getCurrentUserProfile();
      setUser(profile);
      localStorage.setItem('agri_user', JSON.stringify(profile));
      localStorage.setItem('agri_auth_session', 'true');

      // Check authentic authentication detail for hasPassword if not yet set
      if (localStorage.getItem('agri_has_password') === null) {
        try {
          const authData = await authService.refreshToken();
          const hasPass = authData?.hasPassword ?? authData?.has_password;
          if (typeof hasPass === 'boolean') {
            setHasPassword(hasPass);
          }
        } catch {
          // Silent fallback
        }
      }

      // Check admin status for navigation
      try {
        await adminService.getDashboard();
        setIsAdmin(true);
        localStorage.setItem('agri_is_admin', 'true');
      } catch {
        setIsAdmin(false);
        localStorage.removeItem('agri_is_admin');
      }

      return profile;
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('agri_access_token');
      localStorage.removeItem('agri_auth_session');
      localStorage.removeItem('agri_user');
      localStorage.removeItem('agri_has_password');
      localStorage.removeItem('agri_is_admin');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    fetchUserProfile();

    const handleAuthExpired = () => {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('agri_access_token');
      localStorage.removeItem('agri_auth_session');
      localStorage.removeItem('agri_user');
      localStorage.removeItem('agri_has_password');
      localStorage.removeItem('agri_is_admin');
    };

    window.addEventListener('agri_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('agri_auth_expired', handleAuthExpired);
  }, [fetchUserProfile]);

  // Login handler
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const hasPass = res?.hasPassword ?? res?.has_password ?? true;
    setHasPassword(hasPass);
    if (res?.accessToken) {
      localStorage.setItem('agri_access_token', res.accessToken);
    }
    localStorage.setItem('agri_auth_session', 'true');
    const profile = await fetchUserProfile(true);
    return { authResult: res, profile };
  };

  // Register handler (strictly no phone number)
  const register = async (userData) => {
    const res = await authService.register(userData);
    setHasPassword(true);
    return res;
  };

  // OAuth success handler
  const handleOAuthSuccess = async (authResult) => {
    if (authResult?.accessToken) {
      localStorage.setItem('agri_access_token', authResult.accessToken);
    }
    localStorage.setItem('agri_auth_session', 'true');
    const hasPass = authResult?.hasPassword ?? authResult?.has_password ?? false;
    setHasPassword(hasPass);
    const profile = await fetchUserProfile(true);
    return { authResult, profile };
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('agri_access_token');
      localStorage.removeItem('agri_auth_session');
      localStorage.removeItem('agri_user');
      localStorage.removeItem('agri_has_password');
      localStorage.removeItem('agri_is_admin');
      setUser(null);
      setIsAdmin(false);
    }
  };

  // Logout all sessions
  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } catch (err) {
      console.error('Logout all error:', err);
    } finally {
      localStorage.removeItem('agri_access_token');
      localStorage.removeItem('agri_auth_session');
      localStorage.removeItem('agri_user');
      localStorage.removeItem('agri_has_password');
      localStorage.removeItem('agri_is_admin');
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        hasPassword,
        setHasPassword,
        isLoading,
        login,
        register,
        handleOAuthSuccess,
        logout,
        logoutAll,
        refreshProfile: fetchUserProfile,
        verifyAdminPrivilege,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
