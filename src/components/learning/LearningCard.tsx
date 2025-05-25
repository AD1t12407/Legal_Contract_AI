import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Link as LinkIcon, Video, Book, Brain } from 'lucide-react';
import { Learning } from '../../contexts/FocusSessionContext';
import { format, parseISO, isValid } from 'date-fns';

interface LearningCardProps {
  learning: Learning;
}

const LearningCard: React.FC<LearningCardProps> = ({ learning }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-xs text-gray-500">
              {safeFormatDate(learning.createdAt)}
            </span>
          </div>
          
          {/* Always show expand button since we now always have quiz/resources */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </button>
        </div>
        
        <p className="text-gray-800 mb-3">{learning.content}</p>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {learning.resources && learning.resources.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Resources</h4>
                  <div className="space-y-2">
                    {learning.resources.map((resource, index) => (
                      <a 
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        {resource.type === 'article' && <FileText className="h-4 w-4 text-primary-600 mr-2 mt-0.5" />}
                        {resource.type === 'video' && <Video className="h-4 w-4 text-error-600 mr-2 mt-0.5" />}
                        {resource.type === 'book' && <Book className="h-4 w-4 text-warning-600 mr-2 mt-0.5" />}
                        {resource.type === 'other' && <LinkIcon className="h-4 w-4 text-secondary-600 mr-2 mt-0.5" />}
                        <span className="text-sm text-gray-800 leading-tight">{resource.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {learning.quiz && learning.quiz.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quiz Yourself</h4>
                  <div className="space-y-3">
                    {learning.quiz.map((quiz, quizIndex) => (
                      <div key={quizIndex} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-800 mb-2">{quiz.question || 'Quiz question is loading...'}</p>
                        {quiz.options && quiz.options.length > 0 ? (
                          <div className="space-y-1">
                            {quiz.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center">
                                <input 
                                  type="radio" 
                                  id={`option-${learning.id}-${quizIndex}-${optIndex}`} 
                                  name={`quiz-${learning.id}-${quizIndex}`} 
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                  defaultChecked={option === quiz.answer}
                                />
                                <label 
                                  htmlFor={`option-${learning.id}-${quizIndex}-${optIndex}`}
                                  className={`ml-2 text-sm ${option === quiz.answer ? 'font-medium text-primary-600' : 'text-gray-700'}`}
                                >
                                  {option}
                                  {option === quiz.answer && (
                                    <span className="block text-xs text-gray-500 mt-1 ml-1">
                                      {quiz.explanation || 'Correct answer'}
                                    </span>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Quiz options are being generated...</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LearningCard;