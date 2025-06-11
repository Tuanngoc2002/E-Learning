'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

interface Review {
  id: number;
  documentId: string;
  stars: number;
  comments: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  course: {
    name: string;
    id: number;
    documentId: string;
  };
}

interface ApiResponse {
  data: Review[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export default function InstructorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { jwt } = useAuth();

  // Group reviews by course
  const groupedReviews = reviews.reduce((acc, review) => {
    const courseId = review.course.id;
    if (!acc[courseId]) {
      acc[courseId] = {
        courseName: review.course.name,
        reviews: [],
        averageRating: 0
      };
    }
    acc[courseId].reviews.push(review);
    return acc;
  }, {} as Record<number, { courseName: string; reviews: Review[]; averageRating: number }>);

  // Calculate average rating for each course
  Object.keys(groupedReviews).forEach(courseId => {
    const course = groupedReviews[Number(courseId)];
    const totalStars = course.reviews.reduce((sum, review) => sum + review.stars, 0);
    course.averageRating = totalStars / course.reviews.length;
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ratings?populate[course][fields][0]=name`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const responseData: ApiResponse = await response.json();
        
        if (responseData.data && Array.isArray(responseData.data)) {
          setReviews(responseData.data);
        } else {
          setReviews([]);
          console.error('Invalid data format received:', responseData);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews. Please try again later.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (jwt) {
      fetchReviews();
    }
  }, [jwt]);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-xl'
    };

    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={`${sizeClasses[size]} transition-colors duration-200 ${
          index < rating 
            ? 'text-amber-400 drop-shadow-sm' 
            : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const getGradientByRating = (rating: number) => {
    if (rating >= 4.5) return 'from-emerald-500 to-teal-600';
    if (rating >= 4) return 'from-blue-500 to-indigo-600';
    if (rating >= 3.5) return 'from-amber-500 to-orange-600';
    if (rating >= 3) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">⚠</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Có lỗi xảy ra</h3>
                  <p className="text-red-100 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">⭐</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Đánh Giá Khóa Học
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Xem chi tiết đánh giá và phản hồi từ học viên cho các khóa học của bạn
          </p>
        </div>

        {/* Stats Overview */}
        {Object.keys(groupedReviews).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📚</span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Tổng khóa học</p>
                  <p className="text-2xl font-bold text-slate-800">{Object.keys(groupedReviews).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">💬</span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Tổng đánh giá</p>
                  <p className="text-2xl font-bold text-slate-800">{reviews.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⭐</span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {(Object.values(groupedReviews).reduce((sum, course) => sum + course.averageRating, 0) / Object.keys(groupedReviews).length).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Reviews */}
        <div className="space-y-8">
          {Object.keys(groupedReviews).length > 0 ? (
            Object.entries(groupedReviews).map(([courseId, courseData]) => (
              <div key={courseId} className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Course Header */}
                <div className={`bg-gradient-to-r ${getGradientByRating(courseData.averageRating)} p-8`}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {courseData.courseName}
                      </h2>
                      <div className="flex items-center gap-2 text-white/90">
                        <span className="text-sm font-medium">Đánh giá trung bình:</span>
                        <span className="text-lg font-bold">{courseData.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(courseData.averageRating), 'lg')}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-white font-semibold text-sm">
                          {courseData.reviews.length} đánh giá
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reviews List */}
                <div className="divide-y divide-slate-100">
                  {courseData.reviews.map((review, index) => (
                    <div 
                      key={review.id} 
                      className="p-6 hover:bg-slate-50/80 transition-all duration-200 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        
                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              {renderStars(review.stars, 'sm')}
                              <span className="text-sm font-semibold text-slate-700">
                                {review.stars}/5 sao
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 rounded-2xl p-4 group-hover:bg-slate-100/80 transition-colors duration-200">
                            <p className="text-slate-700 leading-relaxed">
                              {review.comments}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-slate-500 text-4xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Chưa có đánh giá nào
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Hiện tại chưa có đánh giá nào cho các khóa học của bạn. 
                  Đánh giá sẽ hiển thị ở đây khi học viên bắt đầu để lại phản hồi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}