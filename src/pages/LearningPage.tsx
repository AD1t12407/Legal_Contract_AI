import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Filter, Search, Tag, Loader } from 'lucide-react';
import LearningCard from '../components/learning/LearningCard';
import LearningForm from '../components/learning/LearningForm';
import { useFocusSession } from '../contexts/FocusSessionContext';

const LearningPage: React.FC = () => {
  const { learnings, isLoading } = useFocusSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filteredLearnings = learnings.filter(learning => 
    learning.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center">
            <Book className="h-7 w-7 mr-2 text-primary-600" />
            Learning Cards
          </h1>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search learnings..."
                className="pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              onClick={() => setShowForm(true)}
            >
              <span className="mr-1">+</span> New
            </button>
          </div>
        </div>
        
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center text-gray-600 mb-2">
            <Filter className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center transition-colors">
              <Tag className="h-3 w-3 mr-1" />
              Recent
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center transition-colors">
              <Tag className="h-3 w-3 mr-1" />
              With Resources
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center transition-colors">
              <Tag className="h-3 w-3 mr-1" />
              With Quiz
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
            <Loader className="h-16 w-16 text-primary-500 animate-spin mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-1">Loading learning cards...</h3>
            <p className="text-gray-600 text-center max-w-md">
              Please wait while we fetch your learning content.
            </p>
          </div>
        ) : filteredLearnings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLearnings.map((learning, index) => (
              <LearningCard key={learning.id || index} learning={learning} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
            <Book className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-1">No learning cards yet</h3>
            <p className="text-gray-600 mb-4 text-center max-w-md">
              Start a focus session and capture what you've learned, or create a new learning card manually.
            </p>
            <button 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              onClick={() => setShowForm(true)}
            >
              Create Your First Learning Card
            </button>
          </div>
        )}
      </motion.div>

      {showForm && (
        <LearningForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default LearningPage;