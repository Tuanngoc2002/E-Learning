import React, { useEffect } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { tsParticles } from "@tsparticles/engine";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const Hero = () => {
  useEffect(() => {
    const initParticles = async () => {
      await loadSlim(tsParticles);
    };
    
    initParticles();
  }, []);

  return (
    <div className="w-full pt-[12px] md:pt-[70px] h-screen bg-indigo-950 overflow-hidden relative">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>

      {/* Particles.js Background - Behind everything */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <Particles
          id="tsparticles"
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 120,
            fullScreen: {
              enable: false,
            },
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
              },
              modes: {
                push: {
                  quantity: 2,
                },
                repulse: {
                  distance: 100,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: ["#6366f1", "#8b5cf6", "#a855f7", "#3b82f6", "#06b6d4"],
              },
              links: {
                color: "#6366f1",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                  top: "bounce",
                  bottom: "bounce",
                  left: "bounce",
                  right: "bounce",
                },
                random: false,
                speed: 1.5,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                },
                value: 50,
              },
              opacity: {
                value: 0.7,
                animation: {
                  enable: true,
                  speed: 1,
                  sync: false,
                },
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 2, max: 6 },
                animation: {
                  enable: true,
                  speed: 2,
                  sync: false,
                },
              },
            },
            detectRetina: true,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Content with explicit background and higher z-index */}
      <div className="absolute inset-0 z-20">
        <div className="flex justify-center flex-col w-full max-w-6xl h-full mx-auto py-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 pt-10">
            <div className="relative z-30 bg-transparent">
              <HeroContent />
            </div>
            <div className="relative z-30 bg-transparent">
              <HeroImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
