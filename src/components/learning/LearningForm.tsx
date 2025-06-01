import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BrainCircuit, Sparkles, BookOpen } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import useFocusSession from '../../hooks/useFocusSession';

interface LearningFormProps {
  onClose: () => void;
}

const LearningForm: React.FC<LearningFormProps> = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learnings, setLearnings] = useState<string[]>(['', '', '', '', '']);
  const { addLearning } = useFocusSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validLearnings = learnings.filter(learning => learning.trim());
    if (validLearnings.length === 0) return;

    setIsSubmitting(true);

    try {
      for (const learning of validLearnings) {
        await addLearning(learning);
      }
      onClose();
    } catch (error) {
      console.error('Error adding learning:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLearning = (index: number, value: string) => {
    const newLearnings = [...learnings];
    newLearnings[index] = value;
    setLearnings(newLearnings);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 rounded-t-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'var(--primary-gradient)' }}
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                    What did you learn?
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Capture up to 5 key learnings from your focus session
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4 mb-8">
              {learnings.map((learning, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold mt-1 flex-shrink-0"
                      style={{
                        background: learning.trim() ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.1)',
                        color: learning.trim() ? 'white' : 'var(--text-tertiary)'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <TextareaAutosize
                        value={learning}
                        onChange={(e) => updateLearning(index, e.target.value)}
                        placeholder={`Learning ${index + 1}`}
                        className="w-full px-4 py-3 rounded-xl border-0 resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-primary)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        minRows={2}
                        maxRows={4}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced AI Enhancement Notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-6 p-4 rounded-xl"
              style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            >
              <div className="flex items-center space-x-3">
                <BrainCircuit className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  These will be enhanced with AI-powered resources and quizzes to help reinforce your knowledge.
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-medium transition-colors"
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}
                onClick={onClose}
              >
                Skip
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: learnings.some(l => l.trim()) ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.1)',
                  color: learnings.some(l => l.trim()) ? 'white' : 'var(--text-tertiary)'
                }}
                disabled={!learnings.some(l => l.trim()) || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Learnings</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LearningForm;