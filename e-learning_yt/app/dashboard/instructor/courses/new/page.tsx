'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi'
import { cookies } from 'next/dist/client/components/headers'
import { useAuth } from '@/hooks/useAuth'


interface CourseFormData {
  name: string
  descriptions: string
  difficulty: 'easy' | 'medium' | 'hard'
  price: number
  isPublished: boolean
  organizationID: string
  lessons: {
    title: string
    content: string | null
    order: number
    isFree: boolean | null
    videoUrl: string | null
  }[]
}

export default function CreateCoursePage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    descriptions: '',
    difficulty: 'medium',
    price: 0,
    isPublished: false,
    organizationID: '',
    lessons: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { user, jwt, organizationID } = useAuth()
  console.log(organizationID)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      
      if (!apiUrl) {
        throw new Error('API URL is not configured')
      }

      const response = await fetch(`${apiUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: {
            ...formData,
            instructor: user?.id,
            organizationID: organizationID,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error?.message || data.message || 'Failed to create course'
        throw new Error(errorMsg)
      }

      router.push('/dashboard/instructor/courses/new')
      setFormData({
        name: '',
        descriptions: '',
        difficulty: 'medium',
        price: 0,
        isPublished: false,
        organizationID: '',
        lessons: [],
      })
    } catch (error) {
      console.error('Error creating course:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    // Special handling for price to ensure it's a number
    if (name === 'price') {
      const numValue = parseFloat(value)
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }))
      return
    }
    
    // Handle other fields
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleLessonChange = (index: number, field: string, value: string | number | boolean | null) => {
    setFormData(prev => {
      const newLessons = [...prev.lessons]
      newLessons[index] = {
        ...newLessons[index],
        [field]: value
      }
      return {
        ...prev,
        lessons: newLessons
      }
    })
  }

  const addLesson = () => {
    setFormData(prev => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          title: '',
          content: null,
          order: prev.lessons.length + 1,
          isFree: false,
          videoUrl: null
        }
      ]
    }))
  }

  const removeLesson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5" /> Cancel
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-start">
                <FiAlertCircle className="mt-1 mr-2 flex-shrink-0 w-5 h-5" />
                <div>
                  <p className="font-medium">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

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
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full pl-7 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Lessons Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Lessons</h2>
                <button
                  type="button"
                  onClick={addLesson}
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Lesson
                </button>
              </div>

              {formData.lessons.map((lesson, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-900">Lesson {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
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
                      rows={4}
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
                      placeholder="Enter video URL"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`isFree-${index}`}
                      checked={lesson.isFree || false}
                      onChange={(e) => handleLessonChange(index, 'isFree', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`isFree-${index}`} className="text-sm text-gray-700">
                      Free Lesson
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSave className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 