"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiArrowLeft, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  instructor: string;
  progress: number;
  nextLesson: string;
  thumbnail: string;
  lastAccessed: string;
  duration: string;
}

// This would come from your API/database in production
const enrolledCourses: Course[] = [
  {
    id: 1,
    title: "React Masterclass",
    instructor: "Sarah Wilson",
    progress: 75,
    nextLesson: "Advanced React Hooks",
    thumbnail: "/courses/react.jpg",
    lastAccessed: "2024-03-20T15:30:00Z",
    duration: "2h 30m remaining"
  },
  {
    id: 2,
    title: "Python for Beginners",
    instructor: "John Smith",
    progress: 45,
    nextLesson: "Working with Lists",
    thumbnail: "/courses/python.jpg",
    lastAccessed: "2024-03-19T10:15:00Z",
    duration: "4h 15m remaining"
  },
  {
    id: 3,
    title: "UI/UX Design Fundamentals",
    instructor: "Emily Brown",
    progress: 90,
    nextLesson: "Final Project",
    thumbnail: "/courses/uiux.jpg",
    lastAccessed: "2024-03-18T09:45:00Z",
    duration: "1h remaining"
  },
  {
    id: 4,
    title: "Data Science Basics",
    instructor: "Michael Chen",
    progress: 30,
    nextLesson: "Statistical Analysis",
    thumbnail: "/courses/data-science.jpg",
    lastAccessed: "2024-03-17T14:20:00Z",
    duration: "6h remaining"
  },
  {
    id: 5,
    title: "Web Development Bootcamp",
    instructor: "David Lee",
    progress: 60,
    nextLesson: "Backend Development",
    thumbnail: "/courses/web-dev.jpg",
    lastAccessed: "2024-03-16T11:30:00Z",
    duration: "3h 45m remaining"
  }
];

export default function ContinueLearning() {
  const router = useRouter();
  const [inProgressCourses, setInProgressCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Filter and sort courses that aren't completed
    const courses = enrolledCourses
      .filter(course => course.progress < 100)
      .sort((a, b) => {
        if (b.progress === a.progress) {
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        }
        return b.progress - a.progress;
      });
    
    if (courses.length === 0) {
      router.push('/courses');
      return;
    }

    setInProgressCourses(courses);
  }, [router]);

  if (inProgressCourses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/dashboard/user"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Continue Learning</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {inProgressCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-32">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {course.title}
                  </h2>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {course.instructor}
                  </p>

                  <div className="flex items-center text-gray-600 mb-2">
                    <FiClock className="w-3 h-3 mr-1" />
                    <span className="text-xs">{course.duration}</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-2 rounded-lg mb-3">
                    <h3 className="font-semibold text-blue-900 text-xs mb-0.5">Next Lesson</h3>
                    <p className="text-blue-800 text-xs line-clamp-2">{course.nextLesson}</p>
                  </div>

                  <Link
                    href={`/courses/${course.id}/learn`}
                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-1.5 px-3 rounded-lg hover:bg-blue-700 transition text-xs"
                  >
                    <FiPlay className="w-3 h-3 mr-1" />
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 