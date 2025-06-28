/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiX, FiAlertCircle, FiUpload, FiImage, FiPlus } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tạo Khóa Học Mới
          </h1>
          <Button
            onClick={() => router.back()}
            className="bg-red-400 hover:bg-red-500 text-white"
          >
            <FiX className="w-5 h-5 mr-2" />
            Huỷ
          </Button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
            <div className="flex items-start">
              <FiAlertCircle className="mt-1 mr-3 flex-shrink-0 w-5 h-5" />
              <div>
                <p className="font-medium">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
              <FiImage className="w-6 h-6 mr-3 text-blue-600" />
              Ảnh Khóa Học
            </h2>

            {imagePreview ? (
              <div className="relative inline-block group">
                <img
                  src={imagePreview}
                  alt="Course preview"
                  className="w-80 h-48 object-cover rounded-xl border border-slate-200 shadow-sm transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-12 text-center hover:border-blue-300 transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FiImage className="w-8 h-8 text-blue-600" />
                </div>
                <label htmlFor="course-image" className="cursor-pointer">
                  <span className="block text-lg font-medium text-slate-700 mb-2">
                    Chọn ảnh khóa học
                  </span>
                  <span className="block text-sm text-slate-500 mb-4">
                    PNG, JPG, GIF tối đa 5MB
                  </span>
                  <Button type="button" variant="outline" onClick={() => document.getElementById('course-image')?.click()} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <FiUpload className="w-4 h-4 mr-2" />
                    Tải ảnh lên
                  </Button>
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
            )}
          </div>

          {/* Course Information */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Thông Tin Khóa Học</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Tên Khóa Học <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên khóa học"
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>

              <div className="col-span-full">
                <label htmlFor="descriptions" className="block text-sm font-medium text-slate-700 mb-2">
                  Mô Tả <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="descriptions"
                  name="descriptions"
                  value={formData.descriptions}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Nhập mô tả khóa học"
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-2">
                  Độ Khó
                </label>
                <Select value={formData.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung Bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="prestige" className="block text-sm font-medium text-slate-700 mb-2">
                  Khóa Học Tham Chiếu
                </label>
                <Select value={formData.prestige?.toString() || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, prestige: value === "none" ? "" : value }))}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
                    <SelectValue placeholder="Chọn khóa học tham chiếu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} - {course.instructor?.username || 'Chưa xác định'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                  Giá
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-sm">₫</span>
                  </div>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="pl-8 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Bài Học</h2>
              <Button
                type="button"
                onClick={addLesson}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white  transition-all"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Thêm Bài Học
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {formData.lessons.map((lesson, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-800 flex items-center">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {index + 1}
                      </span>
                      Bài Học {index + 1}
                    </h3>
                    <button
                      onClick={() => removeLesson(index)}
                    >
                      <FiX className="w-5 h-5 text-red-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tiêu Đề
                      </label>
                      <Input
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        placeholder="Nhập tiêu đề bài học"
                        className="bg-white border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nội Dung
                      </label>
                      <Textarea
                        value={lesson.content || ''}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        rows={3}
                        placeholder="Nhập nội dung bài học"
                        className="bg-white border-slate-200 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        URL Video
                      </label>
                      <Input
                        value={lesson.videoUrl || ''}
                        onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)}
                        placeholder="Nhập URL video bài học"
                        className="bg-white border-slate-200"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <input
                        type="checkbox"
                        id={`isFree-${index}`}
                        checked={lesson.isFree || false}
                        onChange={(e) => handleLessonChange(index, 'isFree', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor={`isFree-${index}`} className="text-sm text-slate-700 font-medium">
                        Bài Học Miễn Phí
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.lessons.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FiImage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có bài học nào. Nhấn &quot;Thêm Bài Học&quot; để bắt đầu.</p>
              </div>
            )}
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white  transition-all"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {uploadingImage ? 'Đang tải ảnh...' : isSubmitting ? 'Đang tạo...' : 'Tạo Khóa Học'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}