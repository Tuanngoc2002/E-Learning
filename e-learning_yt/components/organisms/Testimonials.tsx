"use client";

import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: 'John Doe',
    role: 'Web Developer',
    image: '/images/testimonials/user1.jpg',
    content: 'The courses are well-structured and the instructors are knowledgeable. I learned a lot!',
  },
  {
    name: 'Jane Smith',
    role: 'UI Designer',
    image: '/images/testimonials/user2.jpg',
    content: 'Great platform for learning new skills. The community is supportive and helpful.',
  },
  {
    name: 'Mike Johnson',
    role: 'Business Analyst',
    image: '/images/testimonials/user3.jpg',
    content: 'The quality of content is excellent. I highly recommend these courses to everyone.',
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p className="text-gray-700">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 