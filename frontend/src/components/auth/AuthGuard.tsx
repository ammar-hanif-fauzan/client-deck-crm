'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isInitialized, initialize } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    // Don't redirect while loading or not initialized
    if (isLoading || !isInitialized) return;

    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.replace('/dashboard');
      return;
    }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
      return;
    }
  }, [isAuthenticated, isLoading, isInitialized, pathname, router]);

  // Show loading while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if redirecting
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  if (isAuthenticated && isPublicRoute) {
    return null; // Will redirect to dashboard
  }
  
  if (!isAuthenticated && !isPublicRoute) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
