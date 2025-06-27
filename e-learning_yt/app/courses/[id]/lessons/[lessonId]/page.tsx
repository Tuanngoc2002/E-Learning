"use client";

import { useParams, useRouter } from 'next/navigation';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlay, FaUser, FaTag, FaClock, FaStar } from 'react-icons/fa';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft } from 'lucide-react';

const LessonPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const lessonId = params.lessonId?.toString();
  const { course, lessons, loading, error } = useCourseDetail(courseId);
  const { isAuthenticated, user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Improved YouTube ID extraction function
  function extractYouTubeId(url: string): string | null {
    try {
      const patterns = [
        /(?:youtube\.com\/(?:.*v=|.*\/v\/|embed\/|watch\?v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        /^([^"&?\/\s]{11})$/
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
      const hasEnrollment = !!(course.user_courses && course.user_courses.length > 0);
      setIsEnrolled(hasEnrollment);
      
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

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Bạn cần đăng ký khóa học để truy cập các bài học.</p>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
          >
            Đến trang khóa học
          </button>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy bài học</h2>
          <p>Bài học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 transition duration-300"
          >
            Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  const renderVideo = () => {
    if (!currentLesson.videoUrl) {
      return (
        <div className="w-full bg-gray-100 rounded-lg p-8 text-center text-gray-600">
          Không có video cho bài học này
        </div>
      );
    }

    try {
      const videoId = extractYouTubeId(currentLesson.videoUrl);
      
      if (!videoId) {
        return (
          <div className="w-full bg-gray-100 rounded-lg p-8 text-center text-red-600">
            Định dạng URL YouTube không hợp lệ
          </div>
        );
      }
      
      return (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={currentLesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            onError={() => setVideoError("Không thể tải video")}
          />
        </div>
      );
    } catch (error) {
      return (
        <div className="w-full bg-gray-100 rounded-lg p-8 text-center text-red-600">
          Lỗi khi tải video
        </div>
      );
    }
  };

  const sortedLessons = lessons ? [...lessons].sort((a, b) => a.id - b.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center text-indigo-600 mb-6 sticky top-20 z-10 bg-white px-3 h-11 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-indigo-800 hover:text-white"
          >
            <ChevronLeft className="mr-2" />
            Quay lại khóa học
          </button>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-6">
              {/* Video Section */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    {currentLesson.title}
                  </h1>
                  
                  <div className="mb-6">
                    {videoError ? (
                      <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
                        {videoError}. Vui lòng thử làm mới trang hoặc kiểm tra URL video.
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden shadow-lg">
                        {renderVideo()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-3">
                    <FaUser className="text-indigo-600 mr-3 text-xl" />
                    <h3 className="font-semibold text-gray-800 text-lg">Giảng viên</h3>
                  </div>
                  <p className="text-gray-600 font-medium">{course?.instructor?.username || 'Không xác định'}</p>
                  <p className="text-sm text-gray-500 mt-1">{course?.instructor?.email}</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-3">
                    <FaTag className="text-green-600 mr-3 text-xl" />
                    <h3 className="font-semibold text-gray-800 text-lg">Danh mục</h3>
                  </div>
                  <p className="text-gray-600 font-medium">{(course as any)?.category?.type || 'Tổng quát'}</p>
                  <p className="text-sm text-gray-500 mt-1">Chuyên ngành</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-3">
                    <FaClock className="text-purple-600 mr-3 text-xl" />
                    <h3 className="font-semibold text-gray-800 text-lg">Độ khó</h3>
                  </div>
                  <p className="text-gray-600 font-medium capitalize">
                    {course?.difficulty === 'easy' ? 'Dễ' : 
                     course?.difficulty === 'medium' ? 'Trung bình' : 
                     course?.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Mức độ</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-3">
                    <FaStar className="text-orange-600 mr-3 text-xl" />
                    <h3 className="font-semibold text-gray-800 text-lg">Đánh giá</h3>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {course?.ratings && course.ratings.length > 0 
                      ? `${course.ratings[0].stars}/5 sao` 
                      : 'Chưa có đánh giá'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {course?.ratings && course.ratings.length > 0 ? `${course.ratings.length} đánh giá` : 'Hãy là người đầu tiên đánh giá'}
                  </p>
                </div>
              </div>

              {/* Lesson Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-indigo-600 mr-3 rounded-full"></span>
                  Mô tả bài học
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {currentLesson.content || currentLesson.title}
                  </p>
                  
                  {/* Course Description */}
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Về khóa học này</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {course?.descriptions}
                    </p>
                  </div>

                  {/* Additional Course Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
                    <div className="text-center bg-indigo-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">
                        {(course as any)?.studentCount || 0}
                      </div>
                      <div className="text-sm text-gray-600">Học viên</div>
                    </div>
                    <div className="text-center bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${course?.price || 0}
                      </div>
                      <div className="text-sm text-gray-600">Giá khóa học</div>
                    </div>
                    <div className="text-center bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {sortedLessons.length}
                      </div>
                      <div className="text-sm text-gray-600">Bài học</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Lesson List (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-32">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="w-1 h-5 bg-indigo-600 mr-3 rounded-full"></span>
                    Danh sách bài học
                  </h2>
                  
                  <Accordion type="single" collapsible defaultValue="lessons" className="w-full">
                    <AccordionItem value="lessons" className="border-none">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <span className="text-base font-semibold text-indigo-700">
                          {course?.name} ({sortedLessons.length} bài học)
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                          {sortedLessons.map((lesson, index) => (
                            <div
                              key={lesson.id}
                              onClick={() => router.push(`/courses/${courseId}/lessons/${lesson.id}`)}
                              className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md group ${
                                lesson.id.toString() === lessonId
                                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 shadow-md'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                  lesson.id.toString() === lessonId
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                                }`}>
                                  {lesson.id.toString() === lessonId ? (
                                    <FaPlay className="text-sm" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-sm font-semibold leading-tight mb-1 ${
                                    lesson.id.toString() === lessonId
                                      ? 'text-indigo-900'
                                      : 'text-gray-800 group-hover:text-gray-900'
                                  }`}>
                                    {lesson.title}
                                  </h3>
                                  <p className={`text-xs ${
                                    lesson.id.toString() === lessonId
                                      ? 'text-indigo-600'
                                      : 'text-gray-500 group-hover:text-gray-600'
                                  }`}>
                                    Bài học {lesson.id}
                                  </p>
                                  {lesson.id.toString() === lessonId && (
                                    <div className="mt-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        Đang xem
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default LessonPage;