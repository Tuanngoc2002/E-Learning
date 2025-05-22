"use client";

import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/components/organisms/PageHero';

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Online Learning",
    excerpt: "Discover the essential tips and tricks to make the most of your online learning journey.",
    image: "/images/blog/blog-1.jpg",
    date: "March 15, 2024",
    author: "John Doe",
    category: "Education"
  },
  {
    id: 2,
    title: "The Future of E-Learning",
    excerpt: "Explore the latest trends and technologies shaping the future of online education.",
    image: "/images/blog/blog-2.jpg",
    date: "March 12, 2024",
    author: "Jane Smith",
    category: "Technology"
  },
  {
    id: 3,
    title: "Best Practices for Online Teaching",
    excerpt: "Learn effective strategies for engaging students in virtual classrooms.",
    image: "/images/blog/blog-3.jpg",
    date: "March 10, 2024",
    author: "Mike Johnson",
    category: "Teaching"
  }
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Our Latest Blog Posts"
        description="Stay updated with the latest insights, tips, and trends in online education and e-learning technology."
        currentPage="Blog"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-indigo-600">{post.category}</span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {post.author}</span>
                    <Link 
                      href={`/blog/${post.id}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-indigo-900 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Get in touch with us for any questions about our blog posts or if you&apos;d like
              to contribute to our blog.
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-pink-600 text-white py-3 px-8 rounded-lg hover:bg-pink-700 transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage; 