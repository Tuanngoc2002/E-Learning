"use client";

import { useParams, useRouter } from 'next/navigation';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const LessonPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const lessonId = params.lessonId?.toString(); // Ensure lessonId is string and handle undefined case
  const { course, lessons, loading, error } = useCourseDetail(courseId);
  const { isAuthenticated, user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Improved YouTube ID extraction function
  function extractYouTubeId(url: string): string | null {
    try {
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/(?:.*v=|.*\/v\/|embed\/|watch\?v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /^([^"&?\/\s]{11})$/ // Direct video ID
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    } catch (error) {
      console.error("Error extracting YouTube ID:", error);
      return null;
    }
  }

  // Check enrollment status
  useEffect(() => {
    if (!loading && course) {
      // Check if user is enrolled
      const hasEnrollment = !!(course.user_courses && course.user_courses.length > 0);
      setIsEnrolled(hasEnrollment);
      
      // If not enrolled and loading is complete, redirect
      if (!hasEnrollment) {
        router.push(`/courses/${courseId}`);
      }
    }
  }, [course, loading, courseId, router]);

  // Find current lesson
  useEffect(() => {
    if (lessons && lessons.length > 0 && lessonId) {
      const lesson = lessons.find(l => l.id.toString() === lessonId);
      setCurrentLesson(lesson || null);
      
      // Reset video error when lesson changes
      setVideoError(null);
    }
  }, [lessons, lessonId]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handle not enrolled state - no need to render anything as we'll redirect
  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">You need to enroll in this course to access lessons.</p>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
          >
            Go to Course Page
          </button>
        </div>
      </div>
    );
  }

  // Handle lesson not found
  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
          <p>The lesson you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const renderVideo = () => {
    if (!currentLesson.videoUrl) {
      return <div className="w-full bg-gray-100 rounded-lg p-8 text-center text-gray-600">No video available for this lesson</div>;
    }

    try {
      const videoId = extractYouTubeId(currentLesson.videoUrl);
      
      if (!videoId) {
        return <div className="w-full bg-gray-100 rounded-lg p-8 text-center text-red-600">Invalid YouTube URL format</div>;
      }
      
      return (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={currentLesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            onError={() => setVideoError("Failed to load video")}
          />
        </div>
      );
    } catch (error) {
      console.error("Error rendering video:", error);
      return <div className="w-full bg-gray-100 rounded-lg p-8 text-center text-red-600">Error loading video</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 sticky top-20 z-10 bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <FaArrowLeft className="mr-2" />
            Back to Course
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="p-8">
              <h1 className="text-4xl font-bold mb-6 text-gray-800">{currentLesson.title}</h1>
              
              <div className="mb-8">
                {videoError ? (
                  <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
                    {videoError}. Please try refreshing the page or check the video URL.
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    {renderVideo()}
                  </div>
                )}
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lesson Description</h2>
                  <p className="text-gray-600 leading-relaxed">{currentLesson.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;