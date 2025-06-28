import React from "react";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const Hero = () => {
  return (
    <div className="w-full pt-[12px] md:pt-[70px] h-screen bg-indigo-950 overflow-hidden relative">
      {/* Custom CSS Particle Animation */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <div className="particles-container">
          {[...Array(120)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 25}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-5" style={{ zIndex: 2 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>

      {/* Content with higher z-index */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <div className="flex justify-center flex-col w-full max-w-6xl h-full mx-auto py-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 pt-10">
            <div className="relative" style={{ zIndex: 20 }}>
              <HeroContent />
            </div>
            <div className="relative" style={{ zIndex: 20 }}>
              <HeroImage />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles for particles */}
      <style jsx>{`
        .particles-container {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: linear-gradient(45deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          box-shadow: 0 0 6px #6366f1;
          animation: float linear infinite;
          opacity: 0.7;
        }

        .particle:nth-child(odd) {
          background: linear-gradient(45deg, #3b82f6, #06b6d4);
          box-shadow: 0 0 6px #3b82f6;
        }

        .particle:nth-child(3n) {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          box-shadow: 0 0 6px #a855f7;
          width: 2px;
          height: 2px;
        }

        .particle:nth-child(4n) {
          background: linear-gradient(45deg, #10b981, #34d399);
          box-shadow: 0 0 8px #10b981;
          width: 4px;
          height: 4px;
        }

        .particle:nth-child(5n) {
          background: linear-gradient(45deg, #f59e0b, #fbbf24);
          box-shadow: 0 0 8px #f59e0b;
          width: 1.5px;
          height: 1.5px;
        }

        .particle:nth-child(6n) {
          animation: float linear infinite, pulse 3s ease-in-out infinite;
        }

        .particle:nth-child(7n) {
          animation: float linear infinite, pulse 2s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;
