"use client"

import { useState, useEffect } from "react"
import {
  FiUsers,
  FiBook,
  FiDollarSign,
  FiTrendingUp,
  FiBookOpen,
  FiAlertCircle,
  FiSettings,
  FiBarChart2,
  FiShield,
  FiDatabase,
  FiActivity,
  FiChevronRight,
} from "react-icons/fi"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

interface User {
  id: number
  name: string
  role: string
  joined: string
  status: "Active" | "Pending" | "Suspended"
}

interface Course {
  id: number
  name: string
  descriptions: string
  difficulty: string
  price: number | null
  isPublished: boolean
  attributes: {
    studentCount: number
  }
  createdAt: string
  updatedAt: string
  publishedAt: string
}

interface EnrollmentStats {
  userId: number
  username: string
  email: string
  enrolledCourses: number
  totalSpent: number
  lastEnrollment: string
}

const AdminDashboard = () => {
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats[]>([])
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { jwt } = useAuth()

  const stats = [
    {
      label: "Total Users",
      value: globalStats.totalUsers.toString(),
      icon: <FiUsers className="w-6 h-6" />,
      color: "blue",
      change: "+12%",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "Total Courses",
      value: globalStats.totalCourses.toString(),
      icon: <FiBook className="w-6 h-6" />,
      color: "green",
      change: "+8%",
      bgGradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      label: "Total Enrollments",
      value: globalStats.totalEnrollments.toString(),
      icon: <FiBookOpen className="w-6 h-6" />,
      color: "purple",
      change: "+15%",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      label: "Total Revenue",
      value: `$${globalStats.totalRevenue}`,
      icon: <FiDollarSign className="w-6 h-6" />,
      color: "orange",
      change: "+23%",
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-500",
      textColor: "text-orange-600",
    },
  ]

  const quickActions = [
    {
      label: "Quản lý người dùng",
      href: "/dashboard/admin/users",
      icon: <FiUsers className="w-8 h-8" />,
      color: "blue",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      hoverBg: "hover:from-blue-100 hover:to-blue-200",
    },
    {
      label: "Quản lý khóa học",
      href: "/dashboard/admin/courses",
      icon: <FiBook className="w-8 h-8" />,
      color: "green",
      bgGradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
      hoverBg: "hover:from-emerald-100 hover:to-emerald-200",
    },
    {
      label: "Phân tích đăng ký",
      href: "/dashboard/admin/enrollments",
      icon: <FiBarChart2 className="w-8 h-8" />,
      color: "purple",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      hoverBg: "hover:from-purple-100 hover:to-purple-200",
    },
    {
      label: "Cài đặt hệ thống",
      href: "/dashboard/admin/settings",
      icon: <FiShield className="w-8 h-8" />,
      color: "orange",
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-500",
      hoverBg: "hover:from-orange-100 hover:to-orange-200",
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        })

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }

        const usersData = await usersResponse.json()
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id,
          name: user.username || user.email,
          role: user.provider === "local" ? "User" : user.provider,
          joined: new Date(user.createdAt).toISOString().split("T")[0],
          status: user.blocked ? "Suspended" : user.confirmed ? "Active" : "Pending",
        }))

        setRecentUsers(formattedUsers)

        // Fetch courses
        const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        })

        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses")
        }

        const { data: coursesData } = await coursesResponse.json()
        setCourses(coursesData)

        // Fetch enrollments for each user
        const enrollmentsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user-courses/findAll?populate[0]=user&populate[1]=course`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          },
        )

        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json()
          const enrollments = enrollmentsData.data || []

          // Group enrollments by user
          const enrollmentMap = new Map<number, EnrollmentStats>()
          let totalRevenue = 0

          enrollments.forEach((enrollment: any) => {
            if (!enrollment.user) return

            const userId = enrollment.user.id
            const coursePrice = enrollment.course?.price || 0
            totalRevenue += coursePrice

            if (!enrollmentMap.has(userId)) {
              enrollmentMap.set(userId, {
                userId,
                username: enrollment.user.username || enrollment.user.email,
                email: enrollment.user.email,
                enrolledCourses: 0,
                totalSpent: 0,
                lastEnrollment: enrollment.enrollmentDate || enrollment.createdAt,
              })
            }

            const userStats = enrollmentMap.get(userId)!
            userStats.enrolledCourses += 1
            userStats.totalSpent += coursePrice

            // Update last enrollment date if this is more recent
            const currentDate = new Date(enrollment.enrollmentDate || enrollment.createdAt)
            const lastDate = new Date(userStats.lastEnrollment)
            if (currentDate > lastDate) {
              userStats.lastEnrollment = enrollment.enrollmentDate || enrollment.createdAt
            }
          })

          const enrollmentStatsArray = Array.from(enrollmentMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent) // Sort by total spent
            .slice(0, 10) // Top 10 users

          setEnrollmentStats(enrollmentStatsArray)

          setGlobalStats({
            totalUsers: usersData.length,
            totalCourses: coursesData.length,
            totalEnrollments: enrollments.length,
            totalRevenue: Math.round(totalRevenue),
          })
        }

        setError(null)
      } catch (err) {
        setError("Failed to load data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (jwt) {
      fetchData()
    }
  }, [jwt])

  const handleStatusChange = async (userId: number, newStatus: User["status"]) => {
    try {
      const blocked = newStatus === "Suspended"
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ blocked }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user status")
      }

      setRecentUsers((users) => users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    } catch (err) {
      console.error("Error updating user status:", err)
    }
  }

  const handleCourseVisibility = async (courseId: number, isPublished: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: { isPublished },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update course visibility")
      }

      setCourses((courses) => courses.map((course) => (course.id === courseId ? { ...course, isPublished } : course)))
    } catch (err) {
      console.error("Error updating course visibility:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 !rounded-lg overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 ring-2 ring-gray-200">
                <Image src="/admin-avatar.jpg" alt="Admin Avatar" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển quản trị viên</h1>
                <h2 className="text-gray-600 font-bold">Chào mừng trở lại, Admin</h2>
                <p className="text-gray-600 mt-2">
                  Đây là những gì đang xảy ra với nền tảng học tập kĩ thuật số của bạn hôm nay.
                </p>
              </div>
            </div>
            <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <FiSettings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all duration-300 hover:scale-[1.02] group cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center">
                    <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <p
                      className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                    >
                      {stat.change} từ tháng trước
                    </p>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.iconBg} text-white group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiActivity className="w-5 h-5 mr-2 text-gray-600" />
            Hành động nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`bg-gradient-to-br ${action.bgGradient} ${action.hoverBg} rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-sm hover:scale-[1.02] group`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-4 rounded-xl ${action.iconBg} text-white group-hover:scale-110 transition-transform duration-300 mb-4`}
                  >
                    {action.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                    {action.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FiUsers className="w-5 h-5 mr-2 text-blue-500" />
                Người dùng gần đây
              </h2>
              <Link
                href="/dashboard/admin/users"
                className="text-blue-600 font-medium text-sm bg-blue-50 h-10 w-10 rounded-full flex items-center justify-center  rounded-fulltransition-all duration-200 hover:bg-blue-400 hover:text-white"
              >
                <FiChevronRight className="w-5 h-5" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg border border-red-200">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-semibold text-gray-700">Tên</th>
                      <th className="text-left py-3 text-sm font-semibold text-gray-700">Vai trò</th>
                      <th className="text-left py-3 text-sm font-semibold text-gray-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.slice(0, 5).map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-3 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 text-sm text-gray-600">{user.role}</td>
                        <td className="py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : user.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Student Enrollments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FiBarChart2 className="w-5 h-5 mr-2 text-purple-500" />
                Đăng ký học viên
              </h2>
              <Link
                href="/dashboard/admin/enrollments"
                className="text-blue-600 font-medium text-sm bg-blue-50 h-10 w-10 rounded-full flex items-center justify-center  rounded-fulltransition-all duration-200 hover:bg-blue-400 hover:text-white"
              >
                <FiChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-3">
              {enrollmentStats.slice(0, 5).map((student) => (
                <div
                  key={student.userId}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg transition-all duration-200 border border-gray-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">{student.username}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiBookOpen className="w-3 h-3 mr-1" />
                      {student.enrolledCourses} khóa học
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 flex items-center">
                      <FiDollarSign className="w-4 h-4 mr-1" />${student.totalSpent}
                    </div>
                    <div className="text-xs text-gray-500">Tổng thanh toán</div>
                  </div>
                </div>
              ))}
              {enrollmentStats.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  Không có dữ liệu đăng ký
                </div>
              )}
            </div>
          </div>

          {/* Recent Courses */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FiBook className="w-5 h-5 mr-2 text-emerald-500" />
                Khóa học gần đây
              </h2>
             
              <Link
                href="/dashboard/admin/courses"
                className="text-blue-600 font-medium text-sm bg-blue-50 h-10 w-10 rounded-full flex items-center justify-center  rounded-fulltransition-all duration-200 hover:bg-blue-400 hover:text-white"
              >
                <FiChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">{course.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        course.isPublished
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {course.isPublished ? "Xuất bản" : "Nháp"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span className="flex items-center font-medium">
                      <FiDollarSign className="w-3 h-3 mr-1" />${course.price || 0}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-gray-700 font-medium">
                      {course.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiActivity className="w-5 h-5 mr-2 text-blue-500" />
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Người dùng mới đã đăng ký</p>
                  <p className="text-xs text-gray-500">john.doe@example.com - 5 phút trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Khóa học &quot;React Basics&quot; đã được xuất bản
                  </p>
                  <p className="text-xs text-gray-500">bởi Sarah Wilson - 1 giờ trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Thanh toán đã nhận</p>
                  <p className="text-xs text-gray-500">
                    ${Math.floor(Math.random() * 200) + 50} phí đăng ký - 2 giờ trước
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Đơn đăng ký giáo viên</p>
                  <p className="text-xs text-gray-500">Mike Johnson đã đăng ký - 3 giờ trước</p>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/admin/audit"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
            >
              Xem tất cả hoạt động
              <FiTrendingUp className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiShield className="w-5 h-5 mr-2 text-green-500" />
              Tình trạng hệ thống
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center">
                  <FiDatabase className="w-4 h-4 mr-2" />
                  Trạng thái máy chủ
                </span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600 flex items-center">
                  <FiDatabase className="w-4 h-4 mr-2" />
                  Cơ sở dữ liệu
                </span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600">Tổng đăng ký</span>
                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                  {globalStats.totalEnrollments}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600">Doanh thu tạo ra</span>
                <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  ${globalStats.totalRevenue}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm text-gray-600">Người dùng hoạt động</span>
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {globalStats.totalUsers} total
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/admin/performance"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 inline-flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
            >
              Xem chi tiết hiệu suất
              <FiBarChart2 className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
