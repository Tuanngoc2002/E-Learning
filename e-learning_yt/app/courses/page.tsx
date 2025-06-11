"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaUsers, FaClock, FaFilter } from 'react-icons/fa';
import PageHero from '@/components/organisms/PageHero';
import { useCourses } from '@/hooks/useCourses';
import { useState } from 'react';
import CourseList from '@/components/organisms/CourseList';

const categories = [
  "All Categories",
  "Web Development",
  "Data Science",
  "Design",
  "AI & ML",
  "Marketing",
  "Mobile Development"
];

const difficulties = [
  "easy",
  "medium",
  "hard"
];

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Levels');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Explore Our Courses"
        description="Choose from our wide range of courses designed to help you achieve your goals. Learn from industry experts and get practical experience."
        currentPage="Courses"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <div className="absolute right-4 top-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-6 py-2 rounded-full ${
                    index === 0
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-indigo-50"
                  } transition duration-300`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Difficulty and Price Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Filter Courses</h3>
              
              {/* Difficulty Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => handleDifficultyChange(difficulty)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        selectedDifficulty === difficulty
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition duration-300`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      name="min"
                      value={priceRange.min}
                      onChange={handlePriceChange}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      name="max"
                      value={priceRange.max}
                      onChange={handlePriceChange}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course List */}
          <CourseList 
            searchQuery={searchQuery}
            difficulty={selectedDifficulty !== 'All Levels' ? selectedDifficulty : undefined}
            minPrice={priceRange.min}
            maxPrice={priceRange.max}
          />

          {/* Call to Action */}
          <div className="bg-indigo-900 text-white rounded-lg p-8 text-center mt-16">
            <h2 className="text-3xl font-bold mb-4">Không tìm thấy những gì bạn đang tìm kiếm?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Liên hệ chúng tôi để tìm hiểu thêm về khóa học của chúng tôi hoặc yêu cầu một chủ đề cụ thể.
              Chúng tôi luôn thêm khóa học mới để đáp ứng nhu cầu của học viên.
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-pink-600 text-white py-3 px-8 rounded-lg hover:bg-pink-700 transition duration-300"
            >
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage; 