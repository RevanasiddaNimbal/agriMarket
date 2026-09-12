import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/loaders/Spinner';

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, verifyAdminPrivilege, isLoading } = useAuth();
  const [verifying, setVerifying] = React.useState(!isAdmin);

  React.useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && !isAdmin && verifyAdminPrivilege) {
      verifyAdminPrivilege().finally(() => {
        if (isMounted) setVerifying(false);
      });
    } else {
      setVerifying(false);
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdmin, verifyAdminPrivilege]);

  if (isLoading || verifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-950 text-white">
        <Spinner size="lg" text="Verifying administrator credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
