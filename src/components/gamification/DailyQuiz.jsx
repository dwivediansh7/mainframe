import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

const DailyQuiz = ({ onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchDailyQuiz();
  }, []);

  const fetchDailyQuiz = async () => {
    try {
      const response = await api.get('/gamification/daily-quiz');
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate score based on trait matches
      const calculatedScore = calculateScore(newAnswers);
      setScore(calculatedScore);

      // Submit quiz results
      try {
        await api.post(`/gamification/quiz/${quiz._id}/submit`, {
          answers: newAnswers,
          score: calculatedScore
        });
        setCompleted(true);
        if (onComplete) onComplete(calculatedScore);
      } catch (error) {
        console.error('Error submitting quiz:', error);
      }
    }
  };

  const calculateScore = (userAnswers) => {
    let totalScore = 0;
    userAnswers.forEach((answer, index) => {
      const question = quiz.questions[index];
      const selectedOption = question.options.find(opt => opt.text === answer);
      if (selectedOption) {
        totalScore += selectedOption.traits.reduce((sum, trait) => sum + trait.score, 0);
      }
    });
    return (totalScore / (quiz.questions.length * 10)) * 100;
  };

  if (loading) return <div>Loading quiz...</div>;

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Quiz Completed! 🎉</h2>
        <div className="text-4xl font-bold text-indigo-600 mb-4">
          {Math.round(score)}%
        </div>
        <p className="text-gray-600 mb-6">
          Great job! You've earned {quiz.rewards.xp} XP
        </p>
        {score >= 80 && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="font-semibold text-green-800">
              Achievement Unlocked: {quiz.rewards.achievements[0].name}
            </p>
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Take Another Quiz
        </button>
      </motion.div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="relative h-2 bg-gray-200 rounded-full">
          <motion.div
            className="absolute h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">{currentQ.text}</h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.text)}
                className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition"
              >
                {option.text}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyQuiz;
