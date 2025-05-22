"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaGraduationCap, FaUsers, FaBookReader, FaCertificate } from 'react-icons/fa';
import PageHero from '@/components/organisms/PageHero';

const stats = [
  { id: 1, label: 'Active Students', value: '10,000+', icon: FaUsers },
  { id: 2, label: 'Total Courses', value: '150+', icon: FaGraduationCap },
  { id: 3, label: 'Expert Instructors', value: '50+', icon: FaBookReader },
  { id: 4, label: 'Certificates Issued', value: '25,000+', icon: FaCertificate },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="About Our Platform"
        description="We are dedicated to providing high-quality online education to learners worldwide. Our mission is to make learning accessible, engaging, and effective."
        currentPage="About"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Stats Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/about/mission.jpg"
                alt="Our Mission"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission & Vision</h2>
              <p className="text-gray-600 mb-4">
                Our mission is to revolutionize education through technology, making quality learning 
                accessible to everyone, everywhere. We believe in the power of education to transform 
                lives and create positive change in the world.
              </p>
              <p className="text-gray-600 mb-6">
                We envision a world where geographical and economic barriers to education no longer 
                exist, and where everyone has the opportunity to reach their full potential through 
                learning.
              </p>
              <Link 
                href="/courses" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-fit"
              >
                Explore Our Courses
              </Link>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((member) => (
                <div key={member} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="relative h-64">
                    <Image
                      src={`/images/about/team-${member}.jpg`}
                      alt={`Team Member ${member}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Team Member {member}</h3>
                    <p className="text-gray-600 mb-2">Position</p>
                    <p className="text-gray-500 text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-indigo-900 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Learning Community</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Start your learning journey today and become part of our growing community 
              of learners and educators.
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-pink-600 text-white py-3 px-8 rounded-lg hover:bg-pink-700 transition duration-300"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 