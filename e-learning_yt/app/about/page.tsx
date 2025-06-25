"use client";

import React from 'react';
import PageHero from '@/components/organisms/PageHero';
import Link from 'next/link';
import { FiUsers, FiAward, FiBookOpen, FiGlobe } from 'react-icons/fi';
import Image from 'next/image';

const stats = [
  { icon: FiUsers, label: 'Học viên hoạt động', value: '10,000+' },
  { icon: FiAward, label: 'Tỷ lệ hoàn thành khóa học', value: '94%' },
  { icon: FiBookOpen, label: 'Tổng số khóa học', value: '200+' },
  { icon: FiGlobe, label: 'Quốc gia đạt được', value: '150+' }
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'Trưởng phòng giáo dục',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80',
    bio: 'Với hơn 15 năm kinh nghiệm trong công nghệ giáo dục, Sarah dẫn dắt chiến lược và phát triển chương trình học của chúng tôi.'
  },
  {
    name: 'Michael Chen',
    role: 'Trưởng phòng công nghệ',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    bio: 'Một người có kinh nghiệm trong công nghệ với hơn 15 năm kinh nghiệm trong công nghệ giáo dục, Michael đảm bảo rằng nền tảng của chúng tôi hoạt động mượt mà.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Trưởng phòng hỗ trợ học viên',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    bio: 'Emily là một người có đam mê với việc giúp học viên đạt được mục tiêu học tập và tối đa hóa tiềm năng của họ.'
  }
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <PageHero
        title="Biến đổi giáo dục kĩ thuật số"
        description="Chúng tôi đang trong quá trình phát triển nền tảng học tập kĩ thuật số đến với mọi người,mọi nơi trên thế giới."
        currentPage="Về chúng tôi"
      />

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Students learning"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Sứ mệnh: Nâng cao thông qua giáo dục
              </h2>
              <p className="text-lg text-gray-600">
                Ở trung tâm của chúng tôi, chúng tôi tin rằng giáo dục có sức mạnh để biến đổi cuộc sống. 
                Chúng tôi đặc biệt tập trung vào việc tạo ra một môi trường học tập đa dạng, nơi học viên 
                từ mọi nền tảng có thể truy cập giáo dục chất lượng cao và đạt được ước mơ của họ.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <p className="text-gray-600">Khóa học dẫn đầu được thiết kế để thành công trong thực tế</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <p className="text-gray-600">Trải nghiệm học tập tương tác kích thích và thúc đẩy</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <p className="text-gray-600">Nền tảng dẫn đầu bởi cộng đồng hỗ trợ học tập cộng đồng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Gặp đội ngũ chúng tôi</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Đội ngũ chuyên gia của chúng tôi đầy đủ năng lực và đam mê giúp học viên đạt được mục tiêu học tập của họ.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <div className="text-blue-600 mb-3">{member.role}</div>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;