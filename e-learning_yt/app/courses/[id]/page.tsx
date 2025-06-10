"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaUsers, FaClock, FaPlay, FaLock, FaCheck, FaCommentDots } from 'react-icons/fa';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import { useAuth } from '@/hooks/useAuth';
import PageHero from '@/components/organisms/PageHero';
import { useEffect, useState } from 'react';
import vnpayService from '@/services/vnpayService';
import { useSearchParams } from 'next/navigation';
import { useComments } from '@/hooks/useComments';
import ChatBox from '@/components/molecules/Chatbox';
import RecommendedCourses from '@/components/organisms/RecommendedCourses';
import { Course } from '@/types/course';

interface UserCourse {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = Number(params.id);
  const { course, lessons, loading, error } = useCourseDetail(courseId);
  const { isAuthenticated, user, jwt } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const { comments, loading: commentsLoading, error: commentsError, newComment, setNewComment, addComment, deleteComment, updateComment } = useComments(courseId);
  console.log(comments);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');
  const [showChatBox, setShowChatBox] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const {user: userAuth}= useAuth();
  console.log(userAuth?.id);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newRatingComment, setNewRatingComment] = useState('');
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Check enrollment status from course data
  useEffect(() => {
    console.log('Course:', course);
    console.log('User:', userAuth);
    if (userAuth?.id && course?.user_courses?.some(uc => Number(uc.userId) === Number(userAuth.id))) {
      setIsEnrolled(true);
    } else {
      setIsEnrolled(false);
    }
  }, [course, userAuth?.id]);

  // Nếu có lỗi 404, chuyển hướng đến trang danh sách khóa học
  useEffect(() => {
    if (error && error.includes('404')) {
      // Hiển thị thông báo lỗi trong 2 giây trước khi chuyển hướng
      const timer = setTimeout(() => {
        router.push('/courses');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, router]);

  // Handle VNPAY return
  useEffect(() => {
    const enrollment = searchParams.get('enrollment');
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');

    if (enrollment === 'pending' && vnp_ResponseCode && vnp_TransactionStatus) {
      const handlePaymentReturn = async () => {
        // Verify payment success
        if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
          try {
            // Get courseId from localStorage
            const pendingCourseId = localStorage.getItem('pendingEnrollmentCourseId');
            if (!pendingCourseId) {
              throw new Error('Course ID not found');
            }

            // Complete enrollment
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/enroll`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                  data: {
                    course: parseInt(pendingCourseId)
                  }
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Failed to enroll in course');
              }

              setIsEnrolled(true);
              setEnrollmentSuccess(true);
              // Remove query parameters after successful enrollment
              router.replace(`/courses/${courseId}`);
            } catch (err) {
              setEnrollmentError(err instanceof Error ? err.message : 'Failed to complete enrollment');
            }

        } else {
          setEnrollmentError('Payment was not successful');
        }
      };

      handlePaymentReturn();
    }
  }, [searchParams, jwt, courseId, router]);

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      // Redirect to login page if user is not authenticated
      router.push('/login?redirect=/courses/' + courseId);
      return;
    }

    if (!course) return;

    try {
      setEnrollmentLoading(true);
      setEnrollmentError(null);

      // Save courseId to localStorage before payment
      localStorage.setItem('pendingEnrollmentCourseId', course.id.toString());

      // Create VNPAY payment URL
      const { paymentUrl } = await vnpayService.createPayment({
        price: course.price,
        return_url: `${window.location.origin}/courses/${courseId}?enrollment=pending`,
      });

      // Redirect to VNPAY payment page
      window.location.href = paymentUrl;
    } catch (err) {
      setEnrollmentError(err instanceof Error ? err.message : 'Failed to create payment');
      setEnrollmentLoading(false);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!course) return;
    
    setEnrollmentLoading(true);
    setEnrollmentError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            course: course.id
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll in course');
      }

      setEnrollmentSuccess(true);
      setIsEnrolled(true);
      // Hide modal after 2 seconds
      setTimeout(() => {
        setShowEnrollmentModal(false);
        setEnrollmentSuccess(false);
      }, 2000);
    } catch (err) {
      setEnrollmentError(err instanceof Error ? err.message : 'Failed to enroll in course');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleAddRating = async () => {
    if (!course || !newRating) return;
    
    setRatingError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            stars: newRating,
            comments: newRatingComment,
            course: course.id
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to add rating');
      }

      // Reset form
      setNewRating(null);
      setNewRatingComment('');
      // Refresh course data to get updated ratings
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add rating';
      setRatingError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          {error.includes('404') && (
            <p className="mt-4">Redirecting to courses page...</p>
          )}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p>The course you are looking for does not exist.</p>
          <button 
            onClick={() => router.push('/courses')}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title={course.name}
        description={course.descriptions}
        currentPage="Course Detail"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="relative h-64">
                  <Image
                    src="/images/course-placeholder.jpg"
                    alt={course.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-indigo-600">{course.difficulty}</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
                  <p className="text-gray-600 mb-6">{course.descriptions}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FaUsers className="mr-2" />
                      {lessons.length} lessons
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      {lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)} mins
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-semibold">
                        {course?.instructor?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{course?.instructor?.username}</p>
                      <p className="text-sm text-gray-500">Instructor</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold mb-2">What you&apos;ll learn</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Comprehensive understanding of the subject</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Practical skills you can apply immediately</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Access to course materials for life</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-1">
                        ${course.price}
                      </div>
                      <div className="text-gray-600 text-sm">
                        ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price * 24000)})
                      </div>
                    </div>
                    {isEnrolled ? (
                      <div className="bg-green-100 text-green-800 py-3 px-4 rounded-lg mb-4">
                        <div className="flex items-center justify-center">
                          <FaCheck className="mr-2" />
                          <span>Enrolled</span>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleEnrollClick}
                        disabled={enrollmentLoading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
                      >
                        {enrollmentLoading ? 'Processing...' : 'Enroll Now'}
                      </button>
                    )}
                   
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold mb-2">This course includes:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <FaPlay className="text-indigo-600 mr-2" />
                        <span>{lessons.length} lessons</span>
                      </li>
                      <li className="flex items-center">
                        <FaClock className="text-indigo-600 mr-2" />
                        <span>{lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)} minutes</span>
                      </li>
                      <li className="flex items-center">
                        <FaUsers className="text-indigo-600 mr-2" />
                        <span>Full lifetime access</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Course Curriculum */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`${
                    activeTab === 'lessons'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Lessons
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`${
                    activeTab === 'comments'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Comments
                </button>
                <button
                  onClick={() => setActiveTab('ratings')}
                  className={`${
                    activeTab === 'ratings'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Ratings
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {activeTab === 'lessons' ? (
                // Lessons Tab Content
                <div>
                  {lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id} 
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition duration-150">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                            <span className="text-indigo-600 font-semibold">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{lesson.title}</h3>
                            <p className="text-sm text-gray-500">{lesson.duration || 0} minutes</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {isEnrolled ? (
                            <button
                              onClick={() => router.push(`/courses/${courseId}/lessons/${lesson.id}`)}
                              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition duration-300"
                            >
                              <FaPlay className="w-4 h-4" />
                            </button>
                          ) : lesson.isFree ? (
                            <span className="text-green-500 text-sm font-medium">Free</span>
                          ) : (
                            <FaLock className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Exam Section */}
                  {course.exam && (
                    <div className="border-t border-gray-200 mt-4">
                      <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition duration-150">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                            <span className="text-indigo-600 font-semibold">E</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{course.exam.title}</h3>
                            <p className="text-sm text-gray-500">{course.exam.questions.length} questions</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => router.push(`/courses/${courseId}/exam`)}
                            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
                          >
                            Take Exam
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'ratings' ? (
                // Ratings Tab Content
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Average Rating */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="text-4xl font-bold text-indigo-600 mr-4">
                            {course.ratings && course.ratings.length > 0 
                              ? (course.ratings.reduce((acc: number, rating) => acc + rating.stars, 0) / course.ratings.length).toFixed(1)
                              : '0.0'}
                          </div>
                          <div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, index) => (
                                <FaStar
                                  key={index}
                                  className={`w-5 h-5 ${
                                    index < (course.ratings && course.ratings.length > 0
                                      ? Math.round(course.ratings.reduce((acc: number, rating) => acc + rating.stars, 0) / course.ratings.length)
                                      : 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {course.ratings?.length || 0} ratings
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating Form */}
                    {isEnrolled && (
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Rate this course</h3>
                        {ratingError && (
                          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {ratingError}
                          </div>
                        )}
                        <div className="flex items-center mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewRating(star)}
                              className="focus:outline-none"
                            >
                              <FaStar
                                className={`w-6 h-6 ${
                                  star <= (newRating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={newRatingComment}
                          onChange={(e) => setNewRatingComment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                          placeholder="Write your review..."
                        ></textarea>
                        <button
                          onClick={handleAddRating}
                          disabled={!newRating}
                          className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
                        >
                          Submit Rating
                        </button>
                      </div>
                    )}

                    {/* Ratings List */}
                    <div className="space-y-4">
                      {course.ratings?.length === 0 ? (
                        <div className="text-gray-500 text-center">No ratings yet</div>
                      ) : (
                        course.ratings?.map((rating) => (
                          <div key={rating.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                  {rating.user?.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{rating.user?.username}</span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(rating.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => (
                                      <FaStar
                                        key={index}
                                        className={`w-4 h-4 ${
                                          index < rating.stars ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="mt-2 text-gray-600">{rating.comments}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Comments Tab Content
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Comment Form */}
                    {isAuthenticated && (
                      <div className="mb-6">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                          placeholder="Write your comment..."
                        ></textarea>
                        <button
                          onClick={() => addComment()}
                          className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
                        >
                          Post Comment
                        </button>
                      </div>
                    )}
                    
                    {/* Comments List */}
                    <div className="space-y-4">
                      {commentsLoading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : commentsError ? (
                        <div className="text-red-500 text-center">{commentsError}</div>
                      ) : comments.length === 0 ? (
                        <div className="text-gray-500 text-center">No comments yet</div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="border-b border-gray-200 pb-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                  {comment?.user?.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{comment?.user?.username}</span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {user?.id?.toString() === comment.user.id.toString() && (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          setEditingComment(comment.id);
                                          setEditContent(comment.content);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => deleteComment(comment.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {editingComment === comment.id ? (
                                  <div className="mt-2">
                                    <textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      rows={3}
                                    />
                                    <div className="flex space-x-2 mt-2">
                                      <button
                                        onClick={() => {
                                          updateComment(comment.id, editContent);
                                          setEditingComment(null);
                                        }}
                                        className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingComment(null)}
                                        className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mt-1 text-gray-600">{comment.content}</p>
                                )}
                                <button
                                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  Reply
                                </button>
                                {replyingTo === comment.id && (
                                  <div className="mt-2 ml-4">
                                    <textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      rows={3}
                                      placeholder="Write your reply..."
                                    />
                                    <div className="flex space-x-2 mt-2">
                                      <button
                                        onClick={() => {
                                          addComment(comment.id);
                                          setReplyingTo(null);
                                        }}
                                        className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
                                      >
                                        Post Reply
                                      </button>
                                      <button
                                        onClick={() => setReplyingTo(null)}
                                        className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-4 ml-8 space-y-4">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="border-l-2 border-gray-200 pl-4">
                                        <div className="flex items-start space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-indigo-600 font-semibold text-sm">
                                              {reply?.user?.username?.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <span className="font-medium text-sm">{reply.user.username}</span>
                                                <span className="text-xs text-gray-500">
                                                  {new Date(reply.createdAt).toLocaleDateString()}
                                                </span>
                                              </div>
                                              {user?.id?.toString() === reply.user.id.toString() && (
                                                <div className="flex space-x-2">
                                                  <button
                                                    onClick={() => {
                                                      setEditingComment(reply.id);
                                                      setEditContent(reply.content);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                                  >
                                                    Edit
                                                  </button>
                                                  <button
                                                    onClick={() => deleteComment(reply.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                  >
                                                    Delete
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                            {editingComment === reply.id ? (
                                              <div className="mt-2">
                                                <textarea
                                                  value={editContent}
                                                  onChange={(e) => setEditContent(e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                  rows={2}
                                                />
                                                <div className="flex space-x-2 mt-2">
                                                  <button
                                                    onClick={() => {
                                                      updateComment(reply.id, editContent);
                                                      setEditingComment(null);
                                                    }}
                                                    className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={() => setEditingComment(null)}
                                                    className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="mt-1 text-gray-600 text-sm">{reply.content}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


          
          {course && (
            <div className="mx-auto py-4">
              <h2 className="text-2xl font-bold mb-6">Recommended Courses</h2>
              <RecommendedCourses courseId={course.id} />
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {enrollmentSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-green-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Successfully Enrolled!</h3>
                <p className="text-gray-600 mb-4">You are now enrolled in this course.</p>
                <button
                  onClick={() => setShowEnrollmentModal(false)}
                  className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
                >
                  Continue to Course
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Confirm Enrollment</h3>
                <p className="text-gray-600 mb-4">
                  You are about to enroll in <span className="font-semibold">{course.name}</span> for ${course.price}.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEnrollmentModal(false)}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmEnrollment}
                    disabled={enrollmentLoading}
                    className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
                  >
                    {enrollmentLoading ? 'Processing...' : 'Confirm Enrollment'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Icon - Fixed to bottom right */}
      <div className="fixed bottom-24 right-6 z-50">
        {!showChatBox ? (
          <button
            onClick={() => setShowChatBox(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            <FaCommentDots className="w-6 h-6" />
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl w-80 sm:w-96 border border-gray-200">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center">
                <FaCommentDots className="w-5 h-5 mr-2" />
                <div>
                  <h3 className="font-semibold text-sm">Course Chat</h3>
                  <p className="text-xs opacity-90">Ask instructor</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatBox(false)}
                className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </div>
            <ChatBox 
              courseId={courseId.toString()} 
              instructorId={course.instructor.id.toString()}
              currentUserId={user?.id?.toString() || ''}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default CourseDetailPage; 