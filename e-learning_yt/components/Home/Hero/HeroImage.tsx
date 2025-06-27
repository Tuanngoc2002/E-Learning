"use client";
import Image from "next/image";
import React from "react";
import Tilt from "react-parallax-tilt";
import { FaGraduationCap, FaBook, FaLightbulb, FaAtom } from "react-icons/fa";

const HeroImage = () => {
  return (
    <div
      data-aos="fade-left"
      data-aos-delay="450"
      className="hidden overflow-hidden flex-shrink-0 lg:flex justify-end items-end w-full h-full translate-x-10 relative"
    >
      {/* Top-right glassmorphism icons */}
      <div className="absolute top-24 right-0 flex gap-4 z-10">
      <div 
          data-aos="fade-down" 
          data-aos-delay="600"
          className="group p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-110 transition-all duration-500 ease-out cursor-pointer"
        >
          <FaAtom className="w-6 h-6 text-white group-hover:text-green-300 transition-colors duration-300 drop-shadow-lg" />
        </div>
      <div 
          data-aos="fade-down" 
          data-aos-delay="700"
          className="group p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-110 transition-all duration-500 ease-out cursor-pointer"
        >
          <FaLightbulb className="w-6 h-6 text-white group-hover:text-purple-300 transition-colors duration-300 drop-shadow-lg" />
        </div>
        <div 
          data-aos="fade-down" 
          data-aos-delay="800"
          className="group p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-110 transition-all duration-500 ease-out cursor-pointer"
        >
          <FaGraduationCap className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors duration-300 drop-shadow-lg" />
        </div>
      </div>


      {/* Hero Image */}
      <Image 
        draggable={false}
        src="/images/hero.png" 
        width={800} 
        height={600} 
        alt="Hero" 
        className="object-contain h-[600px] w-auto -mr-20 select-none" 
      />
    </div>
  );
};

export default HeroImage;
