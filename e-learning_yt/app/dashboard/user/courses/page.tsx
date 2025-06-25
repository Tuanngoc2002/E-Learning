/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiBook, FiClock, FiPlay, FiPlus, FiSearch, FiCheck, FiArrowRight, FiLock, FiStar } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface Course {
  id: number;
  name: string;
  descriptions: string | null;
  difficulty: string;
  price: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  prestige?: {
    data?: Array<{
      id: number;
      name: string;
    }>;
  };
  attributes?: {
    studentCount: number;
  };
  image?: Array<{
    url: string;
    formats?: {
      medium?: {
        url: string;
      };
    };
  }>;
}

interface EnrolledCourse extends Course {
  progress?: number;
  lastAccessed?: string;
  user_courses?: any[];
}

interface RoadmapNode {
  course: Course;
  level: number;
  isCompleted: boolean;
  isEnrolled: boolean;
  children: RoadmapNode[];
  isRecommended: boolean;
}

const UserCoursesPage = () => {
  const { jwt, user } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available' | 'roadmap'>('enrolled');
  const [searchTerm, setSearchTerm] = useState('');

  const buildRoadmap = (enrolled: EnrolledCourse[], available: Course[]): RoadmapNode[] => {
    // Tạo map để tra cứu nhanh
    const courseMap = new Map<number, Course>();
    [...enrolled, ...available].forEach(course => {
      courseMap.set(course.id, course);
    });

    // Tìm tất cả các khóa học liên quan (enrolled + các dependent)
    const relevantCourses = new Set<number>();
    enrolled.forEach(course => relevantCourses.add(course.id));
    available.forEach(course => relevantCourses.add(course.id));

    // Hàm tìm dependent (khóa học phụ thuộc vào courseId)
    const findDependentCourses = (courseId: number): Course[] => {
      return [...enrolled, ...available].filter(course =>
        course.prestige?.data?.some(p => p.id === courseId)
      );
    };

    // Tìm root: không có prerequisite hoặc prerequisite không nằm trong hệ thống
    const filteredCourses = [...enrolled, ...available].filter(course => relevantCourses.has(course.id));
    const rootCourses = filteredCourses.filter(course => {
      if (!course.prestige?.data || course.prestige.data.length === 0) return true;
      // Nếu tất cả prerequisite không nằm trong hệ thống thì cũng là root
      return course.prestige.data.every(p => !courseMap.has(p.id));
    });

    // Đệ quy vẽ cây roadmap từ root, chỉ duyệt dependent để tránh lặp
    const buildTree = (course: Course, level: number, visited: Set<number>): RoadmapNode => {
      if (visited.has(course.id)) {
        return {
          course,
          level,
          isCompleted: enrolled.some(ec => ec.id === course.id && (ec.progress || 0) >= 100),
          isEnrolled: enrolled.some(ec => ec.id === course.id),
          children: [],
          isRecommended: false
        };
      }
      visited.add(course.id);

      const isCompleted = enrolled.some(ec => ec.id === course.id && (ec.progress || 0) >= 100);
      const isEnrolled = enrolled.some(ec => ec.id === course.id);

      // Chỉ duyệt dependent (khóa học phụ thuộc vào khóa này)
      const dependentCourses = findDependentCourses(course.id);
      const children = dependentCourses
        .filter(c => relevantCourses.has(c.id) && !visited.has(c.id))
        .map(c => buildTree(c, level + 1, new Set(visited)));

      // Đề xuất nếu: chưa học, đã publish, đủ điều kiện prerequisite
      const isRecommended = !isEnrolled &&
        course.isPublished &&
        (!course.prestige?.data ||
          course.prestige.data.every(p =>
            enrolled.some(ec => ec.id === p.id && (ec.progress || 0) >= 100)
          )
        );

      return {
        course,
        level,
        isCompleted,
        isEnrolled,
        children,
        isRecommended
      };
    };

    // Vẽ cây từ tất cả root
    const roadmap = rootCourses.map(course => buildTree(course, 0, new Set()));
    return roadmap;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let enrolledData: any = { data: [] };
        let enrolledCoursesList: EnrolledCourse[] = [];
        let allAvailableCourses: Course[] = [];

        // Fetch enrolled courses with prestige data
        const enrolledResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/enrolled?populate[course][populate]=prestige`,
          {
            headers: {
              'Authorization': `Bearer ${jwt}`,
            },
          }
        );

        if (enrolledResponse.ok) {
          enrolledData = await enrolledResponse.json();
          console.log('Enrolled data:', enrolledData);
          enrolledCoursesList = enrolledData.data.map((enrollment: any) => {
            const course = {
              ...enrollment.course,
              progress: enrollment.progress || 0,
              lastAccessed: enrollment.lastAccessed,
              user_courses: [enrollment]
            };
            console.log('Enrolled course prestige:', {
              id: course.id,
              name: course.name,
              prestige: course.prestige
            });
            return course;
          });
          setEnrolledCourses(enrolledCoursesList);
        }

        // Fetch all available published courses with prestige data
        const availableResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses?filters[isPublished][$eq]=true&populate=prestige`,
          {
            headers: {
              'Authorization': `Bearer ${jwt}`,
            },
          }
        );

        if (availableResponse.ok) {
          const availableData = await availableResponse.json();
          const enrolledCourseIds = new Set(enrolledData.data?.map((e: any) => e.course.id) || []);
          const notEnrolledCourses = availableData.data.filter((course: Course) =>
            !enrolledCourseIds.has(course.id)
          );
          setAvailableCourses(notEnrolledCourses);
          allAvailableCourses = availableData.data;
        }

        // Fetch recommended courses for the "Roadmap" tab
        if (enrolledCoursesList.length > 0) {
          // Get recommendations for all enrolled courses
          const allRecommendedCourses = new Set<Course>();
          
          // Fetch recommendations for each enrolled course
          for (const enrolledCourse of enrolledCoursesList) {
            const recommendationResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${enrolledCourse.id}/recommendations`,
              {
                headers: {
                  'Authorization': `Bearer ${jwt}`,
                },
              }
            );

            if (recommendationResponse.ok) {
              const recommendedData = await recommendationResponse.json();
              const recommendedCourses = recommendedData.data || [];
              
              // Add recommended courses to the set
              recommendedCourses.forEach((course: Course) => {
                allRecommendedCourses.add(course);
              });
            }
          }

          // Combine recommended courses with related courses from available courses
          const relatedCourses = new Set<Course>();
          
          // Add all recommended courses
          allRecommendedCourses.forEach((course: Course) => {
            relatedCourses.add(course);
          });

          // Add courses that have prestige relationships with enrolled or recommended courses
          const allRelevantCourses = [...enrolledCoursesList, ...Array.from(allRecommendedCourses)];
          allRelevantCourses.forEach(course => {
            // Find courses that have this course as a prerequisite
            const dependentCourses = allAvailableCourses.filter(availableCourse => 
              availableCourse.prestige?.data?.some(p => p.id === course.id)
            );
            dependentCourses.forEach(dependent => relatedCourses.add(dependent));

            // Find courses that are prerequisites for this course
            if (course.prestige?.data) {
              course.prestige.data.forEach((prerequisite: { id: number }) => {
                const prerequisiteCourse = allAvailableCourses.find(
                  availableCourse => availableCourse.id === prerequisite.id
                );
                if (prerequisiteCourse) {
                  relatedCourses.add(prerequisiteCourse);
                }
              });
            }
          });

          // Convert Set to Array and filter out enrolled courses
          const finalRecommendedCourses = Array.from(relatedCourses).filter(
            course => !enrolledCoursesList.some(enrolled => enrolled.id === course.id)
          );

          // Build roadmap using enrolled courses and combined recommendations
          const roadmapData = buildRoadmap(enrolledCoursesList, finalRecommendedCourses);
          console.log('Setting roadmap:', roadmapData);
          setRoadmap(roadmapData);
        } else {
          // If no enrolled courses, set empty roadmap
          setRoadmap([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jwt && user?.id) {
      fetchCourses();
    }
  }, [jwt, user?.id]);

  const handleCourseClick = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const handleContinueLearning = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const filteredAvailableCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.descriptions?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrolledCourses = enrolledCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.descriptions?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper: Lấy tất cả các nhánh từ root đến lá trong roadmap tree
  const getAllPathsFromRootToLeaf = (node: RoadmapNode, path: RoadmapNode[] = []): RoadmapNode[][] => {
    const newPath = [...path, node];
    if (!node.children || node.children.length === 0) {
      return [newPath];
    }
    return node.children.flatMap(child => getAllPathsFromRootToLeaf(child, newPath));
  };

  // Render một nhánh theo chiều ngang dạng card
  const renderHorizontalPath = (path: RoadmapNode[]) => (
    <div className="flex items-center space-x-4 overflow-x-auto py-4 px-6 bg-gray-50 rounded-xl border border-blue-200 shadow mb-4" key={path.map(n => n.course.id).join('-')}>
      {path.map((node, idx) => (
        <React.Fragment key={node.course.id}>
          <div className={`min-w-[220px] max-w-[240px] h-[210px] flex flex-col justify-between p-4 rounded-xl shadow border-2
            ${node.isCompleted ? 'border-green-500 bg-green-50'
              : node.isEnrolled ? 'border-blue-500 bg-blue-50'
                : node.isRecommended ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300 bg-gray-50'}`}>
            <div>
              <div className="flex items-center mb-2">
                {/* Icon trạng thái */}
                {node.isCompleted ? <FiCheck className="text-green-500" />
                  : node.isEnrolled ? <FiPlay className="text-blue-500" />
                    : node.isRecommended ? <FiStar className="text-yellow-500" />
                      : <FiLock className="text-gray-400" />}
                <span className="ml-2 font-bold line-clamp-1">{node.course.name}</span>
              </div>
              <div className="text-xs text-gray-500 line-clamp-2 mb-2">{node.course.descriptions}</div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {node.course.difficulty && (
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyColor(node.course.difficulty)}`}>
                    {node.course.difficulty}
                  </span>
                )}
                {node.course.price !== null && (
                  <span className="text-xs font-medium text-blue-600">
                    {node.course.price === 0 ? 'Miễn phí' : `$${node.course.price}`}
                  </span>
                )}
              </div>
              {node.course.prestige?.data && (
                <div className="flex items-center text-xs text-gray-600">
                  <FiBook className="w-3 h-3 mr-1" />
                  <span>ĐK: {node.course.prestige.data.map(p => p.name).join(', ')}</span>
                </div>
              )}
              {!node.isEnrolled && node.course.isPublished && (
                <button
                  onClick={() => handleCourseClick(node.course.id)}
                  className={`mt-2 px-3 py-1 rounded text-white text-xs font-medium transition-colors duration-200 w-full ${node.isRecommended
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {node.isRecommended ? 'Học ngay' : 'Đăng ký'}
                </button>
              )}
            </div>
          </div>
          {/* Đường nối giữa các card */}
          {idx < path.length - 1 && (
            <div className="flex-shrink-0">
              <FiArrowRight className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Xem tất cả khóa học
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiBook className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</div>
                <div className="text-sm text-gray-500">Khóa học đã đăng ký</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiClock className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {enrolledCourses.reduce((total, course) => total + (course.progress || 0), 0)}%
                </div>
                <div className="text-sm text-gray-500">Trung bình tiến trình</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FiPlay className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {enrolledCourses.filter(c => (c.progress || 0) === 100).length}
                </div>
                <div className="text-sm text-gray-500">Đã hoàn thành</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'enrolled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Khóa học của tôi ({enrolledCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'roadmap'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Lộ trình học tập
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Khóa học có sẵn ({availableCourses.length})
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Course Content */}
        {activeTab === 'enrolled' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnrolledCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 mb-4">
                  {searchTerm ? 'No courses found matching your search.' : "You haven't enrolled in any courses yet."}
                </div>
                <button
                  onClick={() => setActiveTab('available')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Xem khóa học có sẵn
                </button>
              </div>
            ) : (
              filteredEnrolledCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={course.image && course.image[0]
                        ? `${process.env.NEXT_PUBLIC_API_URL}${course.image[0].formats?.medium?.url || course.image[0].url}`
                        : '/images/course-placeholder.jpg'}
                      alt={course.name}
                      width={500}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{course.descriptions}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Last accessed: {course.lastAccessed ? formatDate(course.lastAccessed) : 'Never'}
                      </span>
                      <button
                        onClick={() => handleContinueLearning(course.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FiPlay className="w-4 h-4 mr-1" />
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold text-gray-900">📚 Lộ trình học tập của bạn</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Đã hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Đang học</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">Đề xuất</span>
                </div>
              </div>
            </div>

            {roadmap.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-xl">
                <FiBook className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  Chưa có lộ trình học tập nào
                </p>
                <p className="text-gray-500">Hãy bắt đầu bằng việc đăng ký một khóa học phù hợp!</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300"
                >
                  📖 Xem khóa học có sẵn
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmap.flatMap(root => getAllPathsFromRootToLeaf(root)).map(renderHorizontalPath)}
              </div>
            )}
          </div>

        )}

        {activeTab === 'available' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailableCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  {searchTerm ? 'No courses found matching your search.' : 'No available courses at the moment.'}
                </div>
              </div>
            ) : (
              filteredAvailableCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={course.image && course.image[0]
                        ? `${process.env.NEXT_PUBLIC_API_URL}${course.image[0].formats?.medium?.url || course.image[0].url}`
                        : '/images/course-placeholder.jpg'}
                      alt={course.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{course.descriptions}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        {course.price ? `$${course.price}` : 'Free'}
                      </span>
                      <button
                        onClick={() => handleCourseClick(course.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCoursesPage; 