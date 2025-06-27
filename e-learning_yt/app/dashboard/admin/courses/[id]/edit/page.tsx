 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiX, FiAlertCircle, FiPlus, FiTrash2, FiMove } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { courseService } from '@/services/courseService'
import { lessonService } from '@/services/lessonService'
import { Course, Lesson } from '@/types/course'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface CourseFormData {
  name: string
  descriptions: string
  difficulty: 'easy' | 'medium' | 'hard'
  price: number
  isPublished: boolean
  organizationID: string
  prestige: {
    id: number;
    name: string;
  }[];
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { jwt } = useAuth()
  
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    descriptions: '',
    difficulty: 'medium',
    price: 0,
    isPublished: false,
    organizationID: '',
    prestige: [],
  })
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'course' | 'lessons'>('course')

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        setIsLoading(true)
        const course = await courseService.getCourseById(parseInt(params.id))
        setFormData({
          name: course.name,
          descriptions: course.descriptions,
          difficulty: course.difficulty,
          price: course.price,
          isPublished: course.isPublished,
          organizationID: course.organizationID,
          prestige: Array.isArray(course.prestige) ? course.prestige : [],
        })

        if (course.lessons && course.lessons.length > 0) {
          setLessons(course.lessons)
        } else {
          if (jwt) {
            try {
              const courseLessons = await lessonService.getLessonsByCourseId(parseInt(params.id), jwt)
              setLessons(courseLessons)
            } catch (lessonError) {
              console.warn('Could not fetch lessons:', lessonError)
              setLessons([])
            }
          } else {
            console.warn('⚠️ No JWT token found for fetching lessons')
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error)
        setErrorMessage('Failed to fetch course details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseAndLessons()
  }, [params.id, jwt])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết khóa học</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Quay lại
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('course')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'course'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin khóa học
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lessons'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lessons ({lessons.length})
              </button>
            </nav>
          </div>

          {activeTab === 'course' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khóa học
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    readOnly
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="descriptions" className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <Textarea
                    id="descriptions"
                    name="descriptions"
                    value={formData.descriptions}
                    readOnly
                    rows={5}
                  />
                </div>
                <div>
                  <label htmlFor="prestige" className="block text-sm font-medium text-gray-700 mb-1">
                    Prestige
                  </label>
                  <Input
                    type="text"
                    id="prestige"
                    name="prestige"
                    value={formData.prestige[0]?.name || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Độ khó
                  </label>
                  <Select value={formData.difficulty} disabled>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Giá ($)
                  </label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Bài học</h2>
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Không có bài học.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <FiMove className="w-4 h-4 text-gray-400 mr-2" />
                          <h3 className="text-md font-medium text-gray-900">Lesson {index + 1}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề bài học
                          </label>
                          <Input
                            type="text"
                            value={lesson.title}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nội dung
                          </label>
                          <Textarea
                            value={lesson.content || ''}
                            readOnly
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Video URL
                          </label>
                          <Input
                            type="text"
                            value={lesson.videoUrl || ''}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`isFree-${index}`}
                            checked={lesson.isFree}
                            disabled
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`isFree-${index}`} className="ml-2 text-sm text-gray-700">
                            Free lesson (students can watch without enrolling)
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 