"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import PageHero from '@/components/organisms/PageHero';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Web Development Student",
    image: "/testimonials/student1.jpg",
    content: "The courses here have completely transformed my career path. The instructors are incredibly knowledgeable and supportive. I went from knowing nothing about web development to landing my dream job in just 6 months!",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Data Science Professional",
    image: "/testimonials/student2.jpg",
    content: "The data science curriculum is comprehensive and up-to-date with industry standards. The hands-on projects really helped me understand complex concepts. Highly recommended for anyone looking to break into data science.",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "UX Design Student",
    image: "/testimonials/student3.jpg",
    content: "The UX design course exceeded my expectations. The practical assignments and feedback from industry professionals were invaluable. I now have a strong portfolio and confidence in my design skills.",
    rating: 4
  },
  {
    id: 4,
    name: "David Kim",
    role: "Mobile App Developer",
    image: "/testimonials/student4.jpg",
    content: "Learning mobile app development here was a game-changer. The step-by-step approach and real-world projects helped me understand the entire development process. I'm now successfully freelancing!",
    rating: 5
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Digital Marketing Student",
    image: "/testimonials/student5.jpg",
    content: "The digital marketing courses are fantastic! They cover everything from SEO to social media marketing. The instructors share real case studies and current industry insights. Worth every penny!",
    rating: 5
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Cybersecurity Professional",
    image: "/testimonials/student6.jpg",
    content: "The cybersecurity program is intense but extremely rewarding. The labs and practical exercises prepared me well for real-world scenarios. I'm now working as a security analyst at a major tech company.",
    rating: 5
  }
];

const TestimonialPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Student Success Stories"
        description="Hear from our students about their learning experiences and how our courses have helped them achieve their goals."
        currentPage="Testimonials"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow-lg p-8 transition-transform hover:scale-105"
              >
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
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
                <p className="text-gray-700 mb-4">{testimonial.content}</p>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, index) => (
                    <FaStar key={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-indigo-900 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Join thousands of successful students who have transformed their careers
              through our courses.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/courses"
                className="bg-white text-indigo-900 py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Browse Courses
              </Link>
              <Link 
                href="/contact"
                className="bg-pink-600 text-white py-3 px-8 rounded-lg hover:bg-pink-700 transition duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialPage; 