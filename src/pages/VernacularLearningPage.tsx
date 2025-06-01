import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Play, 
  Pause, 
  Volume2, 
  BookOpen, 
  Award, 
  TrendingUp,
  Mic,
  CheckCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  duration: string;
  lessons: number;
  isCompleted: boolean;
}

interface LanguageStats {
  language: string;
  name: string;
  flag: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  streak: number;
}

const VernacularLearningPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(user?.language || 'hi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);

  const languages = [
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' }
  ];

  const [languageStats] = useState<LanguageStats[]>([
    { language: 'hi', name: 'Hindi', flag: '🇮🇳', progress: 75, lessonsCompleted: 45, totalLessons: 60, streak: 12 },
    { language: 'te', name: 'Telugu', flag: '🇮🇳', progress: 60, lessonsCompleted: 30, totalLessons: 50, streak: 8 },
    { language: 'ta', name: 'Tamil', flag: '🇮🇳', progress: 40, lessonsCompleted: 20, totalLessons: 50, streak: 5 },
    { language: 'bn', name: 'Bengali', flag: '🇮🇳', progress: 25, lessonsCompleted: 15, totalLessons: 60, streak: 3 },
    { language: 'kn', name: 'Kannada', flag: '🇮🇳', progress: 10, lessonsCompleted: 5, totalLessons: 50, streak: 1 }
  ]);

  const [modules] = useState<LearningModule[]>([
    {
      id: '1',
      title: 'Basic Greetings & Introductions',
      description: 'Learn essential greetings and how to introduce yourself',
      language: 'hi',
      difficulty: 'beginner',
      progress: 100,
      duration: '15 min',
      lessons: 8,
      isCompleted: true
    },
    {
      id: '2',
      title: 'Numbers & Counting',
      description: 'Master numbers from 1-100 with pronunciation',
      language: 'hi',
      difficulty: 'beginner',
      progress: 75,
      duration: '20 min',
      lessons: 10,
      isCompleted: false
    },
    {
      id: '3',
      title: 'Family & Relationships',
      description: 'Vocabulary for family members and relationships',
      language: 'hi',
      difficulty: 'intermediate',
      progress: 30,
      duration: '25 min',
      lessons: 12,
      isCompleted: false
    },
    {
      id: '4',
      title: 'Daily Conversations',
      description: 'Common phrases for everyday situations',
      language: 'hi',
      difficulty: 'intermediate',
      progress: 0,
      duration: '30 min',
      lessons: 15,
      isCompleted: false
    }
  ]);

  const currentLanguageStats = languageStats.find(stat => stat.language === selectedLanguage);
  const currentModules = modules.filter(module => module.language === selectedLanguage);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handlePlayModule = (moduleId: string) => {
    setCurrentModule(moduleId);
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Personalized Learning Platforms
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Master vernacular languages with AI-powered personalization
        </p>
      </motion.div>

      {/* Language Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card mb-8"
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Choose Your Language
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                selectedLanguage === lang.code 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              style={{
                background: selectedLanguage === lang.code 
                  ? 'var(--accent-gradient)' 
                  : 'var(--surface)',
                borderColor: selectedLanguage === lang.code 
                  ? 'var(--text-accent)' 
                  : 'var(--border)'
              }}
            >
              <div className="text-2xl mb-2">{lang.flag}</div>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {lang.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {lang.native}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Current Language Stats */}
      {currentLanguageStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentLanguageStats.name} Progress
            </h2>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" style={{ color: '#fbbf24' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                {currentLanguageStats.streak} day streak
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {currentLanguageStats.progress}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Overall Progress
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${currentLanguageStats.progress}%`,
                    background: 'var(--accent-gradient)'
                  }}
                ></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {currentLanguageStats.lessonsCompleted}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Lessons Completed
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                of {currentLanguageStats.totalLessons} total
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {currentLanguageStats.streak}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Day Streak
              </div>
              <div className="flex justify-center mt-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Learning Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
          Learning Modules
        </h2>
        <div className="grid gap-4">
          {currentModules.map((module, index) => (
            <div key={module.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getDifficultyColor(module.difficulty) }}
                    ></div>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {module.title}
                    </h3>
                    {module.isCompleted && (
                      <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                    )}
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {module.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {module.lessons} lessons
                    </span>
                    <span>{module.duration}</span>
                    <span className="capitalize">{module.difficulty}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${module.progress}%`,
                          background: module.isCompleted ? '#10b981' : 'var(--primary-gradient)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => handlePlayModule(module.id)}
                    className="btn btn-primary"
                  >
                    {currentModule === module.id && isPlaying ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {module.progress > 0 ? 'Continue' : 'Start'}
                  </button>
                  
                  <button className="btn btn-outline">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </button>
                  
                  <button className="btn btn-ghost">
                    <Mic className="w-4 h-4 mr-2" />
                    Practice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Voice Practice Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="card"
        style={{ background: 'var(--voice-gradient)' }}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            AI-Powered Voice Practice
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Practice pronunciation with our AI tutor that understands your native accent
          </p>
          <button className="btn btn-secondary">
            <Mic className="w-5 h-5 mr-2" />
            Start Voice Session
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VernacularLearningPage;
