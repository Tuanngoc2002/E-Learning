"use client";

import React from 'react';
import Link from 'next/link';

interface PageHeroProps {
  title: string;
  description: string;
  currentPage: string;
}

const PageHero = ({ title, description, currentPage }: PageHeroProps) => {
  return (
    <div className="w-full py-10 pt-[112px] bg-indigo-950 -mt-[72px]">
      <div className="flex justify-center flex-col max-w-6xl h-full mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-white text-opacity-60">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">{currentPage}</span>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Title */}
          <h1
            data-aos="fade-right"
            className="text-3xl sm:text-4xl md:text-5xl font-bold md:leading-[3rem] text-white mb-6 w-full"
          >
            {title}
          </h1>
          {/* Description */}
          <p
            data-aos="fade-left"
            data-aos-delay="150"
            className="text-base md:text-lg text-white text-opacity-60"
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHero; 