'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiX, FiAlertCircle, FiUpload, FiImage } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'

interface CourseFormData {
  name: string
  descriptions: string
  difficulty: 'easy' | 'medium' | 'hard'
  price: number
  isPublished: boolean
  organizationID: string
  prestige?: number | string
  lessons: {
    title: string
    content: string | null
    order: number
    isFree: boolean | null
    videoUrl: string | null
  }[]
}

interface Course {
  id: number
  name: string
  instructor: {
    id: number
    username: string
    email: string
  }
  prestige: {
    data: Array<{
      id: number
      name: string
    }>
  }
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    descriptions: '',
    difficulty: 'medium',
    price: 0,
    isPublished: false,
    organizationID: '',
    prestige: '',
    lessons: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { user, jwt, organizationID } = useAuth()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses?populate=instructor`,
          {
            headers: {
              'Authorization': `Bearer ${jwt}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (jwt) {
      fetchCourses();
    }
  }, [jwt]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Vui lòng chọn file ảnh hợp lệ')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setErrorMessage('')
    }
  }

  // Upload image to Strapi
  const uploadImage = async (file: File): Promise<number | null> => {
    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const uploadResult = await response.json()
      return uploadResult[0]?.id || null
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      
      if (!apiUrl) {
        throw new Error('API URL is not configured')
      }

      // Upload image if selected
      let imageId: number | null = null
      if (selectedImage) {
        imageId = await uploadImage(selectedImage)
      }

      // Validate lessons - only include lessons with title
      const validLessons = formData.lessons.filter(lesson => lesson.title.trim() !== '')

      // Prepare course data
      const courseData = {
        ...formData,
        instructor: user?.id,
        organizationID: organizationID,
        prestige: formData.prestige || null,
        image: imageId, // Add image ID to course data
        lessons: validLessons.map((lesson, index) => ({
          title: lesson.title.trim(),
          content: lesson.content?.trim() || '',
          videoUrl: lesson.videoUrl?.trim() || '',
          order: index + 1,
          isFree: lesson.isFree || false,
        }))
      }

      console.log('📤 Creating course with data:', courseData)

      const response = await fetch(`${apiUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: courseData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error?.message || data.message || 'Failed to create course'
        throw new Error(errorMsg)
      }

      console.log('✅ Course created successfully:', data)
      router.push('/dashboard/instructor')
      
      // Reset form
      setFormData({
        name: '',
        descriptions: '',
        difficulty: 'medium',
        price: 0,
        isPublished: false,
        organizationID: '',
        prestige: '',
        lessons: [],
      })
      setSelectedImage(null)
      setImagePreview(null)
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

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tạo Khóa Học Mới</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5" /> Hủy
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
            {/* Image Upload Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Ảnh Khóa Học</h2>
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Course preview"
                    className="w-64 h-40 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="course-image" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Chọn ảnh khóa học
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PNG, JPG, GIF tối đa 5MB
                      </span>
                    </label>
                    <input
                      id="course-image"
                      name="course-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="sr-only"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Khóa Học
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  placeholder="Nhập tên khóa học"
                />
              </div>

              <div className="col-span-full">
                <label htmlFor="descriptions" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô Tả
                </label>
                <textarea
                  id="descriptions"
                  name="descriptions"
                  value={formData.descriptions}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  placeholder="Nhập mô tả khóa học"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Độ Khó
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung Bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div>
                <label htmlFor="prestige" className="block text-sm font-medium text-gray-700 mb-1">
                  Khóa Học Tham Chiếu
                </label>
                <select
                  id="prestige"
                  name="prestige"
                  value={formData.prestige}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Chọn khóa học tham chiếu</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} - Giảng viên: {course.instructor?.username || 'Chưa xác định'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Giá
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₫</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1000"
                    className="block w-full pl-7 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Bài Học</h2>
                <button
                  type="button"
                  onClick={addLesson}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                >
                  Thêm Bài Học
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {formData.lessons.map((lesson, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-xl space-y-4 border border-gray-200 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium text-gray-900">Bài Học {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu Đề
                      </label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        placeholder="Nhập tiêu đề bài học"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nội Dung
                      </label>
                      <textarea
                        value={lesson.content || ''}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        rows={4}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        placeholder="Nhập nội dung bài học"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL Video
                      </label>
                      <input
                        type="text"
                        value={lesson.videoUrl || ''}
                        onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        placeholder="Nhập URL video bài học"
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
                        Bài Học Miễn Phí
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <FiSave className="w-4 h-4" />
                {uploadingImage ? 'Đang tải ảnh...' : isSubmitting ? 'Đang tạo...' : 'Tạo Khóa Học'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}