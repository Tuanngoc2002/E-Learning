"use client";
import Image from "next/image";
import React from "react";
import Tilt from "react-parallax-tilt";

const HeroImage = () => {
  return (
    <Tilt>
      <div
        data-aos="fade-left"
        data-aos-delay="1050"
        className="hidden overflow-hidden flex-shrink-0 lg:flex justify-end items-end w-full h-full translate-x-10"
      >
        <Image src="/images/hero.png" width={800} height={600} alt="Hero" className="object-contain h-[600px] w-auto" />
      </div>
    </Tilt>
  );
};

export default HeroImage;
