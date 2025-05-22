"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiBook, FiClock, FiAward, FiBarChart2, FiBookmark, FiSettings } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const enrolledCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    progress: 75,
    instructor: "John Smith",
    thumbnail: "/courses/web-dev.jpg",
    nextLesson: "Advanced JavaScript Concepts",
    duration: "2h 30m remaining"
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    progress: 45,
    instructor: "Sarah Wilson",
    thumbnail: "/courses/data-science.jpg",
    nextLesson: "Statistical Analysis",
    duration: "4h 15m remaining"
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    progress: 90,
    instructor: "Michael Brown",
    thumbnail: "/courses/uiux.jpg",
    nextLesson: "Final Project",
    duration: "1h remaining"
  }
];

const achievements = [
  { id: 1, title: "Fast Learner", description: "Completed 5 courses in 30 days", icon: "🚀" },
  { id: 2, title: "Perfect Score", description: "100% on final assessment", icon: "🎯" },
  { id: 3, title: "Consistent", description: "30-day study streak", icon: "🔥" }
];

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const userRole = Cookies.get('userRole');
    if (userRole) {
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
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return null; // This page will redirect, so no need to render anything
} 