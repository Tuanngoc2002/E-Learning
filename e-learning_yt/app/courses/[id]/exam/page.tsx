"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCourseDetail } from '@/hooks/useCourseDetail';

const ExamPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const { course, loading, error } = useCourseDetail(courseId);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course || !course.exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error || 'Exam not found'}</p>
          <button 
            onClick={() => router.push(`/courses/${courseId}`)}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const exam = course.exam;
  const currentQuestion = exam.questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    exam.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    const finalScore = (correctAnswers / exam.questions.length) * 10;
    setScore(finalScore);
    setShowResult(true);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Exam Results</h1>
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-indigo-600 mb-4">
                {score?.toFixed(1)}
              </div>
              <p className="text-gray-600">
                You answered {Math.round((score || 0) / 10 * exam.questions.length)} out of {exam.questions.length} questions correctly
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 transition duration-300"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <div className="text-gray-600">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h2>
            <div className="space-y-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-4 border rounded-lg cursor-pointer transition duration-200 ${
                    answers[currentQuestion.id] === key
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, key)}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      answers[currentQuestion.id] === key
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300'
                    }`}>
                      {key}
                    </div>
                    <span>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`py-2 px-4 rounded ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition duration-300`}
            >
              Previous
            </button>
            {currentQuestionIndex === exam.questions.length - 1 ? (
              <button
                onClick={calculateScore}
                className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition duration-300"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 transition duration-300"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage; 