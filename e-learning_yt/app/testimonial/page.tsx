"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { FiBookOpen, FiUsers, FiAward } from 'react-icons/fi';
import PageHero from '@/components/organisms/PageHero';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Web Development Student",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80",
    content: "The courses here have completely transformed my career path. The instructors are incredibly knowledgeable and supportive. I went from knowing nothing about web development to landing my dream job in just 6 months!",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Data Science Professional",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    content: "The data science curriculum is comprehensive and up-to-date with industry standards. The hands-on projects really helped me understand complex concepts. Highly recommended for anyone looking to break into data science.",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "UX Design Student",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    content: "The UX design course exceeded my expectations. The practical assignments and feedback from industry professionals were invaluable. I now have a strong portfolio and confidence in my design skills.",
    rating: 4
  },
  {
    id: 4,
    name: "David Kim",
    role: "Mobile App Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    content: "Learning mobile app development here was a game-changer. The step-by-step approach and real-world projects helped me understand the entire development process. I'm now successfully freelancing!",
    rating: 5
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Digital Marketing Student",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80",
    content: "The digital marketing courses are fantastic! They cover everything from SEO to social media marketing. The instructors share real case studies and current industry insights. Worth every penny!",
    rating: 5
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Cybersecurity Professional",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    content: "The cybersecurity program is intense but extremely rewarding. The labs and practical exercises prepared me well for real-world scenarios. I'm now working as a security analyst at a major tech company.",
    rating: 5
  }
];

const TestimonialPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <PageHero
        title="Student Success Stories"
        description="Discover how our platform has transformed careers and lives."
        currentPage="Testimonials"
      />

      {/* Featured Testimonial */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, index) => (
                  <FaStar key={index} className="w-6 h-6" />
                ))}
              </div>
              <blockquote className="text-2xl font-light italic">
                "This platform changed my life. The quality of education and support is unmatched. 
                I went from a complete beginner to a confident professional in just months."
              </blockquote>
              <div className="flex items-center space-x-4 pt-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                    alt="Featured Student"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Alex Morgan</h3>
                  <p className="text-blue-200">Senior Software Engineer at Google</p>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl hidden md:block">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Success Story"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="flex text-yellow-400 mb-6">
                  {[...Array(testimonial.rating)].map((_, index) => (
                    <FaStar key={index} className="w-5 h-5" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center border-t pt-6">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-blue-100">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl text-center">
              <div className="text-blue-600 mb-4">
                <FiUsers className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl text-center">
              <div className="text-purple-600 mb-4">
                <FiBookOpen className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600">Completion Rate</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-xl text-center">
              <div className="text-green-600 mb-4">
                <FiAward className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">85%</h3>
              <p className="text-gray-600">Career Advancement</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
              <p className="mb-8 text-lg text-blue-100 max-w-2xl mx-auto">
                Join our community of successful learners and take the first step towards your dream career.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link 
                  href="/courses"
                  className="bg-white text-indigo-600 py-4 px-8 rounded-xl font-semibold hover:bg-blue-50 transition duration-300"
                >
                  Explore Courses
                </Link>
                <Link 
                  href="/contact"
                  className="bg-transparent text-white py-4 px-8 rounded-xl font-semibold border-2 border-white hover:bg-white/10 transition duration-300"
                >
                  Talk to an Advisor
                </Link>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialPage;