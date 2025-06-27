"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiBars3BottomRight } from 'react-icons/hi2';
import { CgClose } from 'react-icons/cg';
import { FiUser, FiChevronDown, FiLogOut, FiSettings } from 'react-icons/fi';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const navLinks = [
  { id: 1, label: 'Trang chủ', url: '/' },
  { id: 2, label: 'Khóa học', url: '/courses' },
  { id: 3, label: 'Về chúng tôi', url: '/about' },
  { id: 4, label: 'Liên hệ', url: '/contact' },
  { id: 5, label: 'Đánh giá', url: '/testimonial' },
];

const ResponsiveNav = () => {
  const [showNav, setShowNav] = useState(false);
  const [navBg, setNavBg] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current path is dashboard or includes lessons
  const isDashboard = pathname?.startsWith('/dashboard');
  const isLessons = pathname?.includes('lessons');

  // Check authentication status on mount and when pathname changes
  useEffect(() => {
    const authStatus = Cookies.get('isAuthenticated');
    const role = Cookies.get('userRole');
    const name = Cookies.get('userName');
    
    setIsAuthenticated(authStatus === 'true');
    setUserRole(role || '');
    setUserName(name || '');
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      if (window.scrollY >= 90) {
        setNavBg(true);
      }
      if (window.scrollY < 90) {
        setNavBg(false);
      }
    };

    if (!isDashboard) {
      setNavBg(false);
      window.addEventListener('scroll', handler);
      return () => window.removeEventListener('scroll', handler);
    }
  }, [isDashboard]);

  const handleLogout = () => {
    Cookies.remove('userRole');
    Cookies.remove('isAuthenticated');
    Cookies.remove('userName');
    setIsAuthenticated(false);
    setUserRole('');
    setUserName('');
    router.push('/');
  };

  const navOpen = showNav ? 'translate-x-0' : 'translate-x-[-100%]';

  const UserMenu = () => (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="relative w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <FiUser className="w-5 h-5 text-gray-600" />
        </div>
        <span className="text-white">{userName}</span>
        <FiChevronDown className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
          <Link
            href={`/dashboard/${userRole}`}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <FiUser className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <FiSettings className="w-4 h-4 mr-2" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            <FiLogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Navbar */}
      <div
        className={`fixed ${
          isDashboard || isLessons ? 'bg-indigo-800' : navBg ? 'bg-indigo-800' : 'bg-transparent'
        } w-full transition-all duration-200 h-[72px] z-[1000]`}
      >
        <div className="flex items-center h-full justify-between w-full max-w-6xl mx-auto">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white">
            EduLearn
          </Link>

          {/* NavLinks */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => {
              return (
                <Link key={link.id} href={link.url}>
                  <p className="text-white hover:text-blue-300 transition-colors duration-300">
                    {link.label}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Buttons or User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="md:px-6 md:py-2 px-4 py-1.5 text-white font-semibold text-base hover:bg-indigo-700 transition-all duration-200 rounded-lg">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="md:px-6 md:py-2 px-4 py-1.5 text-white font-semibold text-base bg-pink-700 hover:bg-pink-900 transition-all duration-200 rounded-lg">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
            {/* Burger menu */}
            <HiBars3BottomRight
              onClick={() => setShowNav(true)}
              className="w-8 h-8 cursor-pointer text-white lg:hidden"
            />
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div>
        {/* Overlay */}
        <div
          className={`fixed ${navOpen} top-0 transform transition-all duration-500 z-[10000] left-0 right-0 bottom-0 bg-black opacity-70 w-full h-[100vh]`}
        />
        <div
          className={`text-white ${navOpen} fixed justify-center flex flex-col h-full transform transition-all duration-500 delay-300 w-[80%] sm:w-[60%] bg-indigo-900 space-y-4 z-[100006]`}
        >
          {/* NavLinks */}
          {navLinks.map((link) => {
            return (
              <Link key={link.id} href={link.url}>
                <p className="text-[20px] ml-12 border-b-[1.5px] pb-2 border-white sm:text-[30px] hover:text-blue-300 transition-colors duration-300">
                  {link.label}
                </p>
              </Link>
            );
          })}
          {/* Auth Links or User Info */}
          {isAuthenticated ? (
            <div className="flex flex-col space-y-4 ml-12">
              <div className="flex items-center space-x-2 border-b-[1.5px] pb-2 border-white">
                <div className="relative w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-[20px] sm:text-[30px]">{userName}</span>
              </div>
              <Link href={`/dashboard/${userRole}`}>
                <p className="text-[20px] border-b-[1.5px] pb-2 border-white sm:text-[30px] hover:text-blue-300 transition-colors duration-300">
                  Dashboard
                </p>
              </Link>
              <Link href="/profile">
                <p className="text-[20px] border-b-[1.5px] pb-2 border-white sm:text-[30px] hover:text-blue-300 transition-colors duration-300">
                  Settings
                </p>
              </Link>
              <button
                onClick={handleLogout}
                className="text-[20px] text-left border-b-[1.5px] pb-2 border-white sm:text-[30px] text-red-400 hover:text-red-300 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 ml-12">
              <Link href="/login">
                <p className="text-[20px] border-b-[1.5px] pb-2 border-white sm:text-[30px] hover:text-blue-300 transition-colors duration-300">
                  Sign In
                </p>
              </Link>
              <Link href="/register">
                <p className="text-[20px] border-b-[1.5px] pb-2 border-white sm:text-[30px] hover:text-blue-300 transition-colors duration-300">
                  Sign Up
                </p>
              </Link>
            </div>
          )}
          {/* Close button */}
          <CgClose
            onClick={() => setShowNav(false)}
            className="absolute top-[0.7rem] right-[1.4rem] sm:w-8 sm:h-8 w-6 h-6 text-white cursor-pointer"
          />
        </div>
      </div>
    </>
  );
};

export default ResponsiveNav; 