import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, BrainCircuit } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import useFocusSession from '../../hooks/useFocusSession';

interface LearningPromptProps {
  onClose: () => void;
}

const LearningPrompt: React.FC<LearningPromptProps> = ({ onClose }) => {
  const [learnings, setLearnings] = useState<string[]>(['', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addLearning } = useFocusSession();
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Filter out empty learnings
      const validLearnings = learnings.filter(learning => learning.trim() !== '');
      
      // Submit each learning
      for (const learning of validLearnings) {
        await addLearning(learning);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting learnings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (index: number, value: string) => {
    const newLearnings = [...learnings];
    newLearnings[index] = value;
    setLearnings(newLearnings);
  };
  
  const hasAtLeastOneLearning = learnings.some(learning => learning.trim() !== '');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <BrainCircuit className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">What did you learn?</h2>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Capture up to 5 key learnings from your focus session. These will be enhanced with AI-powered resources and quizzes to help reinforce your knowledge.
          </p>
          
          <div className="space-y-3 mb-6">
            {learnings.map((learning, index) => (
              <div key={index} className="relative">
                <div className="absolute top-3 left-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-800">
                  {index + 1}
                </div>
                <TextareaAutosize
                  value={learning}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`Learning ${index + 1}`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[40px]"
                  maxRows={4}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              onClick={onClose}
            >
              Skip
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                hasAtLeastOneLearning 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={!hasAtLeastOneLearning || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Save Learnings
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LearningPrompt;