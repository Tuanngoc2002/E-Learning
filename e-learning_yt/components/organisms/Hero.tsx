"use client";

import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="relative h-[600px] flex items-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-6">
            Learn New Skills Online with Top Educators
          </h1>
          <p className="text-xl mb-8">
            Access high-quality courses from expert instructors and transform your career today.
          </p>
          <div className="flex gap-4">
            <Link
              href="/courses"
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Browse Courses
            </Link>
            <Link
              href="/about"
              className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 