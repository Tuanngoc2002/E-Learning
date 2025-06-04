"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const CoursesPage = () => {
  const router = useRouter();

  useEffect(() => {
    const userRole = Cookies.get('userRole');
    if (userRole) {
      switch (userRole) {
        case 'admin':
          router.push('/dashboard/admin/courses');
          break;
        case 'instructor':
          router.push('/dashboard/instructor/courses');
          break;
        case 'user':
          router.push('/dashboard/user/courses');
          break;
        default:
          router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default CoursesPage; 