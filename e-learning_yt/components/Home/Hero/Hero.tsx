import React from "react";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const Hero = () => {
  return (
    <div className="w-full pt-[4vh] md:pt-[66px] h-screen bg-indigo-950 overflow-hidden">
      <div className="flex justify-center flex-col w-full max-w-6xl h-full mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          <HeroContent />
          <HeroImage />
        </div>
      </div>
    </div>
  );
};

export default Hero;
