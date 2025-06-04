"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userRole = Cookies.get('userRole');

    console.log('Dashboard Layout - User role:', userRole);
    console.log('Dashboard Layout - Current pathname:', pathname);
    
    if (!userRole) {
      router.push('/login');
      return;
    }

    // Only redirect if we're exactly at /dashboard (not at specific role dashboard)
    if (pathname === '/dashboard') {
      console.log('Redirecting from /dashboard to role-specific dashboard');
      switch (userRole) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'instructor':
          router.push('/dashboard/instructor');
          break;
        case 'user':
          router.push('/dashboard/user');
          break;
        default:
          router.push('/login');
          break;
      }
    }
  }, [router, pathname]);

  // If we're at exactly /dashboard, show loading while redirecting
  if (pathname === '/dashboard') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For all other dashboard paths, render children normally
  return <>{children}</>;
};

export default DashboardLayout; 