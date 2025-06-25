import React from "react";

const HeroContent = () => {
  return (
    <div>
      {/* Title */}
      <h1
        data-aos="fade-right"
        className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold md:leading-[3rem] lg:leading-[3.5rem] xl:leading-[4rem] text-white"
      >
        Học lập trình miễn phí và đầy đủ với các khóa học chất lượng cao.
      </h1>
      {/* Description */}
      <p
        data-aos="fade-left"
        data-aos-delay="150"
        className="mt-4 text-sm md:text-base text-white text-opacity-60"
      >
        Học lập trình miễn phí và đầy đủ với các khóa học chất lượng cao.
      </p>
      {/* Buttons */}
      <div className="mt-4 flex items-center space-x-4">
        <button
          data-aos="zoom-in"
          data-aos-delay="300"
          className="button__cls bg-green-700 hover:bg-green-900"
        >
          Bắt đầu
        </button>
        <button
          data-aos="zoom-in"
          data-aos-delay="450"
          className="button__cls bg-yellow-700 hover:bg-yellow-900"
        >
          Tìm hiểu thêm
        </button>
      </div>
      {/* Stats */}
      <div className="flex items-center flex-wrap space-x-16 mt-4">
        <div data-aos="fade-up" data-aos-delay="600">
          <p className="md:text-xl lg:text-2xl text-base text-white font-bold">
            260+
          </p>
          <p className="w-[100px] h-[3px] bg-green-600 mt-2 mb-2 rounded-lg"></p>
          <p className="md:text-lg text-sm text-white text-opacity-70">
            Giáo viên
          </p>
        </div>
        <div data-aos="fade-up" data-aos-delay="750">
          <p className="md:text-xl lg:text-2xl text-base text-white font-bold">
            2260+
          </p>
          <p className="w-[100px] h-[3px] bg-blue-600 mt-2 mb-2 rounded-lg"></p>
          <p className="md:text-lg text-sm text-white text-opacity-70">
            Học viên
          </p>
        </div>
        <div data-aos="fade-up" data-aos-delay="900">
          <p className="md:text-xl lg:text-2xl text-base text-white font-bold">
            60+
          </p>
          <p className="w-[100px] h-[3px] bg-pink-600 mt-2 mb-2 rounded-lg"></p>
          <p className="md:text-lg text-sm text-white text-opacity-70">
            Khóa học
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
