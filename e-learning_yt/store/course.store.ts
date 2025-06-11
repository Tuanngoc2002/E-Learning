import { create } from 'zustand'
import type { Course } from '../types/course'

interface CourseState {
  courses: Course[]
  selectedCourse: Course | null
  isLoading: boolean
  error: string | null
  fetchCourses: () => Promise<void>
  fetchCourseById: (id: number) => Promise<void>
  createCourse: (course: Omit<Course, 'id'>) => Promise<void>
  updateCourse: (id: number, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: number) => Promise<void>
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const courses = await response.json()
      set({ courses })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchCourseById: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch(`/api/courses/${id}`)
      if (!response.ok) throw new Error('Failed to fetch course')
      const course = await response.json()
      set({ selectedCourse: course })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  createCourse: async (course) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      })
      if (!response.ok) throw new Error('Failed to create course')
      const newCourse = await response.json()
      set((state) => ({ courses: [...state.courses, newCourse] }))
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  updateCourse: async (id: number, course) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      })
      if (!response.ok) throw new Error('Failed to update course')
      const updatedCourse = await response.json()
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? updatedCourse : c)),
        selectedCourse: state.selectedCourse?.id === id ? updatedCourse : state.selectedCourse,
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  deleteCourse: async (id: number) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete course')
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        selectedCourse: state.selectedCourse?.id === id ? null : state.selectedCourse,
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },
})) 