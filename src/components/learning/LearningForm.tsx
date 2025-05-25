import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, BrainCircuit } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import useFocusSession from '../../hooks/useFocusSession';

interface LearningFormProps {
  onClose: () => void;
}

const LearningForm: React.FC<LearningFormProps> = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addLearning } = useFocusSession();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addLearning(content);
      onClose();
    } catch (error) {
      console.error('Error adding learning:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <BrainCircuit className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">New Learning</h2>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="learning-content" className="block text-sm font-medium text-gray-700 mb-1">
                What did you learn?
              </label>
              <TextareaAutosize
                id="learning-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter what you learned..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                minRows={4}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Learning
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LearningForm;