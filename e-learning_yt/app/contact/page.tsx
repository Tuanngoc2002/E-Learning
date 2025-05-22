"use client";

import React from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import PageHero from '@/components/organisms/PageHero';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contact Hero Section */}
      <PageHero
        title="Get in Touch"
        description="Have questions about our courses or platform? We're here to help! Reach out to us through any of the channels below."
        currentPage="Contact"
      />

      

      {/* Contact Form & Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Contact Information */}
            <div className="md:w-1/3">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <FiMail className="text-blue-600 text-xl mt-1" />
                    <div className="ml-4">
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-gray-600">support@elearning.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiPhone className="text-blue-600 text-xl mt-1" />
                    <div className="ml-4">
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiMapPin className="text-blue-600 text-xl mt-1" />
                    <div className="ml-4">
                      <h3 className="font-semibold">Address</h3>
                      <p className="text-gray-600">
                        123 Learning Street<br />
                        Education City, ED 12345
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:w-2/3">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Enter subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Enter your message"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-96 bg-gray-200 rounded-lg">
            {/* Add your map component here */}
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Map Component Placeholder
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 