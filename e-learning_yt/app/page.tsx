"use client";

import React, { useEffect } from 'react';
import Hero from "@/components/Home/Hero/Hero";
import CourseGrid from "@/components/templates/CourseGrid";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  useEffect(() => {
    const initAOS = async () => {
      await import('aos');
      AOS.init({
        duration: 400,
        easing: 'ease-out',
        once: true,
        anchorPlacement: 'top-bottom',
      });
    };

    initAOS();
  }, []);

  return (
    <main className="min-h-screen">
      <Hero />
      <CourseGrid />
    </main>
  );
}
