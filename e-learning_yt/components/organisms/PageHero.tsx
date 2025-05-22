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
    <div className="w-full pt-[4vh] md:pt-[12vh] h-[50vh] bg-indigo-950">
      <div className="flex justify-center flex-col w-4/5 h-full mx-auto">
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
        <div className="max-w-3xl">
          {/* Title */}
          <h1
            data-aos="fade-right"
            className="text-3xl sm:text-4xl md:text-5xl font-bold md:leading-[3rem] text-white mb-6"
          >
            {title}
          </h1>
          {/* Description */}
          <p
            data-aos="fade-left"
            data-aos-delay="150"
            className="text-sm md:text-base text-white text-opacity-60"
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHero; 