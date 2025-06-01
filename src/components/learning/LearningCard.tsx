import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  FileText,
  Link as LinkIcon,
  Video,
  Book,
  Brain,
  ExternalLink,
  Play,
  CheckCircle,
  Clock,
  Sparkles,
  BookOpen,
  Globe,
  Award
} from 'lucide-react';
import { Learning } from '../../contexts/FocusSessionContext';
import { format, parseISO, isValid } from 'date-fns';

interface LearningCardProps {
  learning: Learning;
}

const LearningCard: React.FC<LearningCardProps> = ({ learning }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: string}>({});

  // Safe date formatting function
  const safeFormatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'Unknown date';

    try {
      const date = parseISO(dateStr);

      if (!isValid(date) || isNaN(date.getTime())) {
        console.warn('Invalid date in LearningCard:', dateStr);
        return 'Unknown date';
      }

      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date in LearningCard:', error);
      return 'Unknown date';
    }
  };

  // Get resource counts for preview
  const resourceCounts = {
    articles: learning.resources?.filter(r => r.type === 'article').length || 0,
    videos: learning.resources?.filter(r => r.type === 'video').length || 0,
    courses: learning.resources?.filter(r => r.type === 'course').length || 0,
    total: learning.resources?.length || 0
  };

  const quizCount = learning.quiz?.length || 0;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

      <div className="relative p-6">
        {/* Enhanced Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start space-x-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'var(--primary-gradient)' }}
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--text-accent)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                  Learning Card
                </span>
                <div className="flex items-center space-x-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <Clock className="h-3 w-3" />
                  <span>{safeFormatDate(learning.createdAt)}</span>
                </div>
              </div>

              {/* Quick stats preview */}
              <div className="flex items-center space-x-3 mt-2">
                {resourceCounts.total > 0 && (
                  <div className="flex items-center space-x-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <BookOpen className="h-3 w-3" />
                    <span>{resourceCounts.total} resources</span>
                  </div>
                )}
                {quizCount > 0 && (
                  <div className="flex items-center space-x-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Award className="h-3 w-3" />
                    <span>{quizCount} quiz{quizCount > 1 ? 'zes' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl transition-all duration-200"
            style={{
              background: isExpanded ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)',
              color: isExpanded ? 'white' : 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Enhanced Content */}
        <div className="mb-6">
          <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
            {learning.content}
          </p>
        </div>

        {/* Quick Action Buttons */}
        {!isExpanded && (resourceCounts.total > 0 || quizCount > 0) && (
          <div className="flex items-center space-x-3 mb-4">
            {resourceCounts.total > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: 'rgb(34, 197, 94)',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}
              >
                <Globe className="h-4 w-4" />
                <span>View Resources</span>
              </motion.button>
            )}
            {quizCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  color: 'rgb(168, 85, 247)',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}
              >
                <Brain className="h-4 w-4" />
                <span>Take Quiz</span>
              </motion.button>
            )}
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="overflow-hidden border-t pt-6"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {/* Enhanced Resources Section */}
              {learning.resources && learning.resources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                           style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                        <Globe className="h-4 w-4" style={{ color: 'rgb(34, 197, 94)' }} />
                      </div>
                      Educational Resources
                    </h4>
                    <span className="text-sm px-3 py-1 rounded-full"
                          style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: 'rgb(34, 197, 94)'
                          }}>
                      {resourceCounts.total} found
                    </span>
                  </div>

                  {/* Resource Type Tabs */}
                  <div className="flex items-center space-x-2 mb-4">
                    {resourceCounts.articles > 0 && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs"
                           style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' }}>
                        <FileText className="h-3 w-3" />
                        <span>{resourceCounts.articles} Articles</span>
                      </div>
                    )}
                    {resourceCounts.videos > 0 && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs"
                           style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}>
                        <Video className="h-3 w-3" />
                        <span>{resourceCounts.videos} Videos</span>
                      </div>
                    )}
                    {resourceCounts.courses > 0 && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs"
                           style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'rgb(245, 158, 11)' }}>
                        <Book className="h-3 w-3" />
                        <span>{resourceCounts.courses} Courses</span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {learning.resources.map((resource, index) => {
                      const getResourceIcon = () => {
                        switch (resource.type) {
                          case 'video': return <Video className="h-5 w-5" style={{ color: 'rgb(239, 68, 68)' }} />;
                          case 'course': return <Book className="h-5 w-5" style={{ color: 'rgb(245, 158, 11)' }} />;
                          case 'article': return <FileText className="h-5 w-5" style={{ color: 'rgb(59, 130, 246)' }} />;
                          default: return <LinkIcon className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />;
                        }
                      };

                      const getResourceBg = () => {
                        switch (resource.type) {
                          case 'video': return 'rgba(239, 68, 68, 0.05)';
                          case 'course': return 'rgba(245, 158, 11, 0.05)';
                          case 'article': return 'rgba(59, 130, 246, 0.05)';
                          default: return 'rgba(255,255,255,0.05)';
                        }
                      };

                      return (
                        <motion.a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="group flex items-start p-4 rounded-xl transition-all duration-200 relative overflow-hidden"
                          style={{
                            background: getResourceBg(),
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <div className="flex-shrink-0 mr-4 relative z-10">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.1)' }}>
                              {getResourceIcon()}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-start justify-between">
                              <h5 className="font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors"
                                  style={{ color: 'var(--text-primary)' }}>
                                {resource.title}
                              </h5>
                              <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                                           style={{ color: 'var(--text-tertiary)' }} />
                            </div>
                            {resource.snippet && (
                              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {resource.snippet}
                              </p>
                            )}
                            <div className="flex items-center mt-2">
                              <span className="text-xs px-2 py-1 rounded-md capitalize"
                                    style={{
                                      background: 'rgba(255,255,255,0.1)',
                                      color: 'var(--text-tertiary)'
                                    }}>
                                {resource.type}
                              </span>
                            </div>
                          </div>
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Enhanced Quiz Section */}
              {learning.quiz && learning.quiz.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                           style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                        <Brain className="h-4 w-4" style={{ color: 'rgb(168, 85, 247)' }} />
                      </div>
                      Interactive Quiz
                    </h4>
                    <span className="text-sm px-3 py-1 rounded-full"
                          style={{
                            background: 'rgba(168, 85, 247, 0.1)',
                            color: 'rgb(168, 85, 247)'
                          }}>
                      {quizCount} question{quizCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {learning.quiz.map((quiz, quizIndex) => {
                      const quizKey = `${learning.id}-${quizIndex}`;
                      const isSelected = selectedQuizIndex === quizIndex;
                      const userAnswer = quizAnswers[quizKey];
                      const isAnswered = !!userAnswer;
                      const isCorrect = userAnswer === quiz.correct_answer;

                      return (
                        <motion.div
                          key={quizIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: quizIndex * 0.1 }}
                          className="relative overflow-hidden rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                                     style={{
                                       background: isAnswered
                                         ? (isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                                         : 'rgba(255,255,255,0.1)',
                                       color: isAnswered
                                         ? (isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
                                         : 'var(--text-secondary)'
                                     }}>
                                  {quizIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-base font-semibold leading-relaxed mb-2"
                                     style={{ color: 'var(--text-primary)' }}>
                                    {quiz.question || 'Quiz question is loading...'}
                                  </p>
                                </div>
                              </div>

                              {isAnswered && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center space-x-1"
                                >
                                  <CheckCircle className="h-5 w-5"
                                             style={{ color: isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }} />
                                  <span className="text-sm font-medium"
                                        style={{ color: isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
                                    {isCorrect ? 'Correct!' : 'Try again'}
                                  </span>
                                </motion.div>
                              )}
                            </div>

                            {quiz.options && quiz.options.length > 0 ? (
                              <div className="space-y-3">
                                {quiz.options.map((option, optIndex) => {
                                  const isThisCorrect = option === quiz.correct_answer;
                                  const isUserChoice = userAnswer === option;

                                  return (
                                    <motion.label
                                      key={optIndex}
                                      whileHover={{ scale: 1.01 }}
                                      whileTap={{ scale: 0.99 }}
                                      className="group flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden"
                                      style={{
                                        background: isAnswered
                                          ? (isThisCorrect
                                              ? 'rgba(34, 197, 94, 0.1)'
                                              : isUserChoice && !isThisCorrect
                                                ? 'rgba(239, 68, 68, 0.1)'
                                                : 'rgba(255,255,255,0.05)')
                                          : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${
                                          isAnswered
                                            ? (isThisCorrect
                                                ? 'rgba(34, 197, 94, 0.3)'
                                                : isUserChoice && !isThisCorrect
                                                  ? 'rgba(239, 68, 68, 0.3)'
                                                  : 'rgba(255,255,255,0.1)')
                                            : 'rgba(255,255,255,0.1)'
                                        }`
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={`quiz-${quizKey}`}
                                        value={option}
                                        checked={userAnswer === option}
                                        onChange={(e) => {
                                          setQuizAnswers(prev => ({
                                            ...prev,
                                            [quizKey]: e.target.value
                                          }));
                                        }}
                                        className="mt-1 h-4 w-4 border-2 focus:ring-2"
                                        style={{
                                          accentColor: isAnswered && isThisCorrect ? 'rgb(34, 197, 94)' : 'var(--text-accent)',
                                          borderColor: 'var(--border)'
                                        }}
                                      />
                                      <div className="ml-4 flex-1">
                                        <span className="text-sm font-medium"
                                              style={{
                                                color: isAnswered
                                                  ? (isThisCorrect
                                                      ? 'rgb(34, 197, 94)'
                                                      : isUserChoice && !isThisCorrect
                                                        ? 'rgb(239, 68, 68)'
                                                        : 'var(--text-secondary)')
                                                  : 'var(--text-primary)'
                                              }}>
                                          {option}
                                        </span>

                                        {isAnswered && isThisCorrect && quiz.explanation && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-2 p-3 rounded-lg"
                                            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                                          >
                                            <div className="flex items-start space-x-2">
                                              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0"
                                                        style={{ color: 'rgb(34, 197, 94)' }} />
                                              <p className="text-xs leading-relaxed"
                                                 style={{ color: 'rgb(34, 197, 94)' }}>
                                                <strong>Explanation:</strong> {quiz.explanation}
                                              </p>
                                            </div>
                                          </motion.div>
                                        )}
                                      </div>
                                    </motion.label>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                                       style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <Brain className="h-6 w-6 animate-pulse" style={{ color: 'var(--text-tertiary)' }} />
                                  </div>
                                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    AI is generating quiz options...
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LearningCard;