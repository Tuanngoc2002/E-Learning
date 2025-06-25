import React, { useState } from 'react';
import { FiX, FiCreditCard, FiCheck, FiClock, FiUsers, FiStar } from 'react-icons/fi';

interface Course {
  id: number;
  name: string;
  descriptions: string;
  difficulty: string;
  price: number | null;
  attributes?: {
    studentCount?: number;
    rating?: number;
    duration?: string;
  };
}

interface CourseEnrollmentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (course: Course) => Promise<void>;
  isLoading?: boolean;
}

const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({
  course,
  isOpen,
  onClose,
  onEnroll,
  isLoading = false
}) => {
  const [enrollmentStep, setEnrollmentStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'card'>('vnpay');

  if (!isOpen) return null;

  const handleEnroll = async () => {
    try {
      await onEnroll(course);
      setEnrollmentStep('success');
    } catch (error) {
      console.error('Enrollment failed:', error);
      // Error handling is done in parent component
    }
  };

  const handleSuccessClose = () => {
    setEnrollmentStep('details');
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {enrollmentStep === 'details' && 'Course Enrollment'}
            {enrollmentStep === 'payment' && 'Payment Method'}
            {enrollmentStep === 'success' && 'Enrollment Successful!'}
          </h2>
          <button
            onClick={enrollmentStep === 'success' ? handleSuccessClose : onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {enrollmentStep === 'details' && (
            <div className="space-y-4">
              {/* Course Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.descriptions}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  {course.attributes?.studentCount && (
                    <div className="flex items-center">
                      <FiUsers className="w-4 h-4 mr-1" />
                      <span>{course.attributes.studentCount} students</span>
                    </div>
                  )}
                  {course.attributes?.rating && (
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 mr-1 text-yellow-400" />
                      <span>{course.attributes.rating}</span>
                    </div>
                  )}
                  {course.attributes?.duration && (
                    <div className="flex items-center">
                      <FiClock className="w-4 h-4 mr-1" />
                      <span>{course.attributes.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Course Price:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {course.price ? `$${course.price}` : 'Free'}
                  </span>
                </div>
              </div>

              {/* What's Included */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">What&apos;s included:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    Lifetime access to course content
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    Downloadable resources
                  </li>
                  <li className="flex items-center">
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    24/7 support access
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-3">
                {course.price ? (
                  <button
                    onClick={() => setEnrollmentStep('payment')}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Enrolling...' : 'Enroll for Free'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {enrollmentStep === 'payment' && (
            <div className="space-y-4">
              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{course.name}</span>
                  <span className="font-semibold">${course.price}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">${course.price}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'vnpay')}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded mr-3 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VP</span>
                      </div>
                      <span>VNPay</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <FiCreditCard className="w-6 h-6 text-gray-600 mr-3" />
                      <span>Credit/Debit Card</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleEnroll}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Processing...' : `Pay $${course.price}`}
                </button>
                <button
                  onClick={() => setEnrollmentStep('details')}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {enrollmentStep === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Successfully Enrolled!
                </h3>
                <p className="text-gray-600">
                  You are now enrolled in <strong>{course.name}</strong>. 
                  You can start learning immediately.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleSuccessClose();
                    // Redirect to course page
                    window.location.href = `/courses/${course.id}`;
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Learning
                </button>
                <button
                  onClick={handleSuccessClose}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentModal; 