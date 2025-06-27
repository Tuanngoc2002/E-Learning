import React from "react";
import Image from "next/image";

const HeroContent = () => {
  return (
    <div>
      {/* Title */}
      <h1
        data-aos="fade-right"
        className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold md:leading-[3rem] lg:leading-[3.5rem] xl:leading-[4rem] text-white bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent hover:from-blue-200 hover:via-white hover:to-blue-200 transition-all duration-500"
      >
        Học lập trình miễn phí chất lượng cao
      </h1>
      {/* Description */}
      <p
        data-aos="fade-left"
        data-aos-delay="150"
        className="mt-4 text-sm md:text-lg text-nowrap text-white text-opacity-60 hover:text-opacity-80 transition-all duration-300 leading-relaxed"
      >
        Học lập trình miễn phí và đầy đủ với các khóa học chất lượng cao.
      </p>
      {/* Buttons */}
      <div className="mt-4 flex items-center space-x-4">
        <button
          data-aos="zoom-in"
          data-aos-delay="300"
          className="button__cls bg-green-700 hover:bg-green-900 relative overflow-hidden group transition-all duration-300 hover:scale-105 border border-green-600 hover:border-green-400"
        >
          <span className="relative z-10">Bắt đầu</span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <button
          data-aos="zoom-in"
          data-aos-delay="450"
          className="button__cls bg-yellow-700 hover:bg-yellow-900 relative overflow-hidden group transition-all duration-300 hover:scale-105 border border-yellow-600 hover:border-yellow-400"
        >
          <span className="relative z-10">Tìm hiểu thêm</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
      {/* Stats */}
      <div className="flex items-center flex-wrap gap-2 lg:gap-4 mt-8">
        <div 
          data-aos="fade-up" 
          data-aos-delay="600" 
          className="group cursor-pointer p-4 min-w-[126px] w-[126px] rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-out"
        >
          <div className="text-center">
            <p className="md:text-3xl lg:text-4xl text-2xl text-white font-bold group-hover:text-green-300 transition-colors duration-300 drop-shadow-lg">
              260+
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 mt-3 mb-3 rounded-full mx-auto group-hover:from-green-300 group-hover:to-green-500 group-hover:h-1.5 transition-all duration-300 shadow-lg shadow-green-400/50"></div>
            <p className="md:text-base text-sm text-white/80 group-hover:text-white transition-all duration-300 font-medium">
              Giáo viên
            </p>
          </div>
        </div>
        <div 
          data-aos="fade-up" 
          data-aos-delay="750" 
          className="group cursor-pointer min-w-[126px] w-[126px] p-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-out"
        >
          <div className="text-center">
            <p className="md:text-3xl lg:text-4xl text-2xl text-white font-bold group-hover:text-blue-300 transition-colors duration-300 drop-shadow-lg">
              2260+
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mt-3 mb-3 rounded-full mx-auto group-hover:from-blue-300 group-hover:to-blue-500 group-hover:h-1.5 transition-all duration-300 shadow-lg shadow-blue-400/50"></div>
            <p className="md:text-base text-sm text-white/80 group-hover:text-white transition-all duration-300 font-medium">
              Học viên
            </p>
          </div>
        </div>
        <div 
          data-aos="fade-up" 
          data-aos-delay="900" 
          className="group cursor-pointer min-w-[126px] w-[126px] p-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-out"
        >
          <div className="text-center">
            <p className="md:text-3xl lg:text-4xl text-2xl text-white font-bold group-hover:text-pink-300 transition-colors duration-300 drop-shadow-lg">
              60+
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-pink-600 mt-3 mb-3 rounded-full mx-auto group-hover:from-pink-300 group-hover:to-pink-500 group-hover:h-1.5 transition-all duration-300 shadow-lg shadow-pink-400/50"></div>
            <p className="md:text-base text-sm text-white/80 group-hover:text-white transition-all duration-300 font-medium">
              Khóa học
            </p>
          </div>
        </div>
      </div>
      
      {/* User Reviews Avatar Group */}
      <div className="mt-8 flex items-center space-x-4" data-aos="fade-up" data-aos-delay="700">
        <div className="flex -space-x-3">
          <div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300">
            <Image
              src="/images/u1.jpg"
              alt="User 1"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300">
            <Image
              src="/images/u2.jpg"
              alt="User 2"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300">
            <Image
              src="/images/u3.jpg"
              alt="User 3"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300">
            <Image
              src="/images/r1.jpg"
              alt="User 4"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg hover:scale-110 transition-transform duration-300">
            <Image
              src="/images/r2.jpg"
              alt="User 5"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-12 h-12 rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform duration-300">
            +20
          </div>
        </div>
        <div className="ml-4">
          <div className="flex items-center space-x-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-white text-sm font-medium">
            <span className="text-yellow-400 font-bold">4.9/5</span> từ 1,500+ đánh giá
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
