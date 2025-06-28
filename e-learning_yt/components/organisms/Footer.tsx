"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from "react-icons/fi";

const Footer = () => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative pt-20 pb-12">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-gray-800">

            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="text-2xl font-bold text-white">
                <Image
                  draggable={false}
                  src="/images/logo.svg" alt="logo" width={100} height={100} className='h-12 w-auto object-contain' />
              </Link>

              <p className="text-gray-400 leading-relaxed">
                Empowering minds through innovative education. Join thousands of learners
                transforming their careers with our cutting-edge courses.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <FiMail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">hello@eduplatform.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <FiPhone className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <FiMapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {[
                  { icon: FaFacebookF, color: "hover:bg-blue-600", link: "#" },
                  { icon: FaTwitter, color: "hover:bg-sky-500", link: "#" },
                  { icon: FaInstagram, color: "hover:bg-pink-600", link: "#" },
                  { icon: FaYoutube, color: "hover:bg-red-600", link: "#" },
                  { icon: FaLinkedinIn, color: "hover:bg-blue-700", link: "#" }
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.link}
                    className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all duration-300 transform hover:scale-110`}
                  >
                    <social.icon className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Courses */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-6 relative">
                Popular Courses
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Full Stack Web Development", students: "2.5K+" },
                  { name: "Data Science & Analytics", students: "1.8K+" },
                  { name: "UI/UX Design Mastery", students: "1.2K+" },
                  { name: "Mobile App Development", students: "950+" },
                  { name: "Digital Marketing Pro", students: "800+" },
                  { name: "Cybersecurity Fundamentals", students: "600+" }
                ].map((course, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="group flex items-center justify-between py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {course.name}
                    </span>
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                      {course.students}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-6 relative">
                Quick Links
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Home", link: "/" },
                  { name: "About Us", link: "/about" },
                  { name: "All Courses", link: "/courses" },
                  { name: "Instructors", link: "/instructors" },
                  { name: "Student Success", link: "/testimonials" },
                  { name: "Career Services", link: "/careers" },
                  { name: "Support Center", link: "/support" },
                  { name: "Privacy Policy", link: "/privacy" }
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-6 relative">
                Stay Updated
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                Get the latest course updates, learning tips, and exclusive offers
                delivered straight to your inbox.
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                  Subscribe Now
                </button>

                <p className="text-xs text-gray-500">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
              </div>

              {/* Achievement Stats */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-xs text-gray-400">Happy Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">200+</div>
                  <div className="text-xs text-gray-400">Expert Courses</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-gray-400 text-sm">
              <p>© 2025 EduLearn. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <span>•</span>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>for learners worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;