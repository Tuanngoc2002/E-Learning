"use client";

import Link from 'next/link';
import { FaCode, FaPalette, FaChartLine, FaMobile, FaDatabase, FaShieldAlt } from 'react-icons/fa';

const categories = [
  { name: 'Programming', icon: FaCode, href: '/courses?category=programming' },
  { name: 'Design', icon: FaPalette, href: '/courses?category=design' },
  { name: 'Business', icon: FaChartLine, href: '/courses?category=business' },
  { name: 'Mobile Development', icon: FaMobile, href: '/courses?category=mobile' },
  { name: 'Database', icon: FaDatabase, href: '/courses?category=database' },
  { name: 'Cybersecurity', icon: FaShieldAlt, href: '/courses?category=cybersecurity' },
];

const Categories = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Course Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <category.icon className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-semibold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories; 