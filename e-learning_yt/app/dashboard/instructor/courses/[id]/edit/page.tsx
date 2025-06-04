'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiX, FiAlertCircle, FiPlus, FiTrash2, FiMove } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { courseService } from '@/services/courseService'
import { lessonService } from '@/services/lessonService'
import { Course, Lesson } from '@/types/course'

interface CourseFormData {
  name: string
  descriptions: string
  difficulty: 'easy' | 'medium' | 'hard'
  price: number
  isPublished: boolean
  organizationID: string
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, organizationID, jwt } = useAuth()
  
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    descriptions: '',
    difficulty: 'medium',
    price: 0,
    isPublished: false,
    organizationID: '',
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
        })

        // Fetch lessons separately
        if (jwt) {
          try {
            const courseLessons = await lessonService.getLessonsByCourseId(parseInt(params.id), jwt)
            console.log('📚 Fetched lessons with IDs:', courseLessons.map(l => `${l.id} (${l.title})`))
            setLessons(courseLessons)
          } catch (lessonError) {
            console.warn('Could not fetch lessons:', lessonError)
            setLessons([])
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      await courseService.updateCourse(parseInt(params.id), {
        ...formData,
        instructor: {
          id: parseInt(user.id),
          username: user.username || '',
          email: user.email || '',
        },
        organizationID: organizationID || '',
        isPublished: true,
      })
      
      router.push('/dashboard/instructor')
    } catch (error) {
      console.error('Error updating course:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLessonChange = (index: number, field: keyof Lesson, value: string | number | boolean) => {
    setLessons(prev => {
      const newLessons = [...prev]
      newLessons[index] = {
        ...newLessons[index],
        [field]: value
      }
      return newLessons
    })
  }

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now(), // Temporary ID for new lessons
      title: '',
      content: '',
      videoUrl: '',
      order: lessons.length + 1,
      isFree: false
    }
    setLessons(prev => [...prev, newLesson])
  }

  const removeLesson = async (index: number) => {
    const lesson = lessons[index]
    if (lesson.id && lesson.id < 1000000000000 && jwt) {
      try {
        if (lesson.documentId) {
          await lessonService.deleteLessonByDocumentId(lesson.documentId, jwt)
        } else {
          await lessonService.deleteLesson(lesson.id, jwt)
        }
      } catch (error) {
        console.error('Error deleting lesson:', error)
        setErrorMessage('Failed to delete lesson')
        return
      }
    }
    setLessons(prev => prev.filter((_, i) => i !== index))
  }

  const saveLessons = async () => {
    if (!jwt) return

    try {
      setIsSubmitting(true)
      const promises = lessons.map(async (lesson, index) => {
        if (!lesson.title?.trim()) {
          throw new Error(`Lesson ${index + 1} must have a title`)
        }

        if (lesson.id > 1000000000000) { // New lesson (temporary ID)
          const createData = {
            title: lesson.title.trim(),
            content: lesson.content?.trim() || '',
            videoUrl: lesson.videoUrl?.trim() || '',
            order: index + 1,
            isFree: lesson.isFree,
            course: parseInt(params.id)
          }
          return lessonService.createLesson(createData, jwt)
        } else {
          const updateData = {
            title: lesson.title.trim(),
            content: lesson.content?.trim() || '',
            videoUrl: lesson.videoUrl?.trim() || '',
            order: index + 1,
            isFree: lesson.isFree
          }
          
          if (lesson.documentId) {
            return lessonService.updateLessonByDocumentId(lesson.documentId, updateData, jwt)
          } else {
            return lessonService.updateLesson(lesson.id, updateData, jwt)
          }
        }
      })

      await Promise.all(promises)
      
      // Refresh lessons
      const updatedLessons = await lessonService.getLessonsByCourseId(parseInt(params.id), jwt)
      setLessons(updatedLessons)
      
      setErrorMessage('')
    } catch (error) {
      console.error('Error saving lessons:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save lessons')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiX className="w-5 h-5 mr-1" />
              Cancel
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
                Course Information
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
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Enter course name"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="descriptions" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="descriptions"
                    name="descriptions"
                    value={formData.descriptions}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Enter course description"
                  />
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Enter course price"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Course Lessons</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={addLesson}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="w-4 h-4 mr-1" />
                    Add Lesson
                  </button>
                  <button
                    onClick={saveLessons}
                    disabled={isSubmitting}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4 mr-1" />
                    {isSubmitting ? 'Saving...' : 'Save All Lessons'}
                  </button>
                </div>
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">No lessons yet. Add your first lesson to get started.</p>
                  <button
                    onClick={addLesson}
                    className="flex items-center mx-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus className="w-4 h-4 mr-1" />
                    Add First Lesson
                  </button>
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
                        <button
                          onClick={() => removeLesson(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            placeholder="Enter lesson title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                          </label>
                          <textarea
                            value={lesson.content || ''}
                            onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                            rows={3}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            placeholder="Enter lesson content"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Video URL
                          </label>
                          <input
                            type="text"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            placeholder="Enter YouTube video URL"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`isFree-${index}`}
                            checked={lesson.isFree}
                            onChange={(e) => handleLessonChange(index, 'isFree', e.target.checked)}
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