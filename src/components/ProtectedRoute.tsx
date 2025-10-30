"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('super_admin' | 'gym_owner' | 'member')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard if user doesn't have access
      switch (user.role) {
        case 'super_admin':
          router.push('/dashboard/admin');
          break;
        case 'gym_owner':
          router.push('/dashboard/owner');
          break;
        case 'member':
          router.push('/dashboard/member');
          break;
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
