import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mic,
  Send,
  Volume2,
  Brain,
  Heart,
  BookOpen,
  Users,
  Clock,
  Award,
  Lightbulb,
  HelpCircle,
  Globe,
  Target,
  Sparkles,
  Settings,
  Zap,
  Loader,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AITutorChat from '../components/ai-tutor/AITutorChat';


// Import API functions
import {
  askAITutor,
  explainConcept,
  generatePracticeQuestions,
  transcribeAudio,
  synthesizeSpeech,
  getTutorHistory,
  getSubjectTopics,
  type TutorResponse,
  type ConceptExplanation,
  type PracticeQuestion
} from '../api/aiTutorApi';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language?: string;
  audioUrl?: string;
}

interface TutorSession {
  id: string;
  subject: string;
  duration: number;
  questionsAsked: number;
  conceptsLearned: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const AITutorPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeMode, setActiveMode] = useState('chat');
  const [currentSession, setCurrentSession] = useState<TutorSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Integration State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conceptInput, setConceptInput] = useState('');
  const [conceptDifficulty, setConceptDifficulty] = useState('beginner');
  const [conceptExplanation, setConceptExplanation] = useState<ConceptExplanation | null>(null);
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [practiceCount, setPracticeCount] = useState(5);
  const [practiceDifficulty, setPracticeDifficulty] = useState('intermediate');
  const [tutorHistory, setTutorHistory] = useState<any[]>([]);
  const [subjectTopics, setSubjectTopics] = useState<any[]>([]);

  const subjects = [
    { id: 'general', name: 'General Learning', icon: <Brain className="w-5 h-5" />, color: 'var(--primary-gradient)' },
    { id: 'mathematics', name: 'Mathematics', icon: <BookOpen className="w-5 h-5" />, color: 'var(--secondary-gradient)' },
    { id: 'science', name: 'Science', icon: <Lightbulb className="w-5 h-5" />, color: 'var(--accent-gradient)' },
    { id: 'english', name: 'English', icon: <MessageCircle className="w-5 h-5" />, color: 'var(--voice-gradient)' },
    { id: 'social_studies', name: 'Social Studies', icon: <Users className="w-5 h-5" />, color: 'var(--primary-gradient)' },
    { id: 'computer_science', name: 'Computer Science', icon: <Zap className="w-5 h-5" />, color: 'var(--accent-gradient)' }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
  ];

  const modes = [
    {
      id: 'chat',
      name: 'Interactive Chat',
      description: 'Ask questions and get personalized explanations',
      icon: <MessageCircle className="w-5 h-5" />,
      color: '#4F46E5'
    },
    {
      id: 'explain',
      name: 'Concept Explanation',
      description: 'Get detailed explanations of complex concepts',
      icon: <Lightbulb className="w-5 h-5" />,
      color: '#F59E0B'
    },
    {
      id: 'practice',
      name: 'Practice Questions',
      description: 'Generate practice questions for any topic',
      icon: <Target className="w-5 h-5" />,
      color: '#10B981'
    },
    {
      id: 'voice',
      name: 'Voice Learning',
      description: 'Learn through voice interactions',
      icon: <Mic className="w-5 h-5" />,
      color: '#EF4444'
    }
  ];

  const quickQuestions = [
    "Explain this concept in simple terms",
    "Give me practice problems",
    "What should I learn next?",
    "Help me with homework",
    "Teach me something new today"
  ];

  const stats = [
    { label: 'Sessions Today', value: '3', icon: <Clock className="w-5 h-5" /> },
    { label: 'Questions Answered', value: '47', icon: <HelpCircle className="w-5 h-5" /> },
    { label: 'Concepts Learned', value: '12', icon: <Lightbulb className="w-5 h-5" /> },
    { label: 'Achievement Points', value: '285', icon: <Award className="w-5 h-5" /> }
  ];

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Namaste ${user?.name || 'Student'}! I'm your AI tutor. I'm here to help you learn in ${user?.language === 'hi' ? 'Hindi' : 'your preferred language'}. What would you like to learn today?`,
        sender: 'ai',
        timestamp: new Date(),
        language: user?.language || 'en'
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);
    setError(null);

    try {
      // Call real AI Tutor API
      const response: TutorResponse = await askAITutor(
        question,
        selectedSubject,
        selectedLanguage,
        'intermediate',
        user?.id || 'default'
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date(),
        language: selectedLanguage
      };

      setMessages(prev => [...prev, aiResponse]);

      // Add follow-up questions if available
      if (response.follow_up_questions && response.follow_up_questions.length > 0) {
        const followUpMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: `Here are some follow-up questions you might find interesting:\n${response.follow_up_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
          sender: 'ai',
          timestamp: new Date(),
          language: selectedLanguage
        };
        setMessages(prev => [...prev, followUpMessage]);
      }

    } catch (err) {
      console.error('AI Tutor API error:', err);
      setError('Failed to get AI response. Please try again.');

      // Fallback to mock response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm here to help! Could you please try asking your question again?",
        sender: 'ai',
        timestamp: new Date(),
        language: selectedLanguage
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string, subject: string): string => {
    // Simple AI response simulation - in real app, this would call actual AI API
    const responses = {
      general: [
        "That's a great question! Let me break this down for you step by step...",
        "I understand you're curious about this topic. Here's what you need to know...",
        "Excellent! This is an important concept. Let me explain it in simple terms..."
      ],
      math: [
        "Mathematics can be tricky, but let's solve this together! First, let's identify what we know...",
        "Great math question! The key to solving this is to understand the pattern...",
        "Math is all about practice. Let me show you the method and then we'll try some examples..."
      ],
      science: [
        "Science is fascinating! This phenomenon occurs because...",
        "That's a wonderful scientific question! Let me explain the concept with a simple example...",
        "Science helps us understand the world around us. In this case..."
      ],
      language: [
        "Language learning is a journey! Let me help you understand this grammar rule...",
        "That's a good question about language structure. Here's how it works...",
        "Communication is key! Let me explain this language concept clearly..."
      ]
    };

    const subjectResponses = responses[subject as keyof typeof responses] || responses.general;
    return subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const startNewSession = (subject: string) => {
    setSelectedSubject(subject);
    const session: TutorSession = {
      id: Date.now().toString(),
      subject,
      duration: 0,
      questionsAsked: 0,
      conceptsLearned: [],
      difficulty: 'medium'
    };
    setCurrentSession(session);
  };

  // Real API Functions
  const handleExplainConcept = async () => {
    if (!conceptInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setConceptExplanation(null);

    try {
      const explanation = await explainConcept(
        conceptInput,
        selectedSubject,
        selectedLanguage,
        conceptDifficulty
      );
      setConceptExplanation(explanation);
    } catch (err) {
      console.error('Concept explanation error:', err);
      setError('Failed to explain concept. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePracticeQuestions = async () => {
    if (!practiceInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPracticeQuestions([]);

    try {
      const result = await generatePracticeQuestions(
        practiceInput,
        selectedSubject,
        practiceDifficulty,
        practiceCount
      );
      setPracticeQuestions(result.questions);
    } catch (err) {
      console.error('Practice questions error:', err);
      setError('Failed to generate practice questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = async (audioFile: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await transcribeAudio(audioFile, selectedLanguage);
      setInputMessage(result.text);

      // Automatically send the transcribed message
      if (result.text.trim()) {
        await handleSendMessage();
      }
    } catch (err) {
      console.error('Voice transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tutor history on component mount
  useEffect(() => {
    const loadTutorHistory = async () => {
      try {
        const history = await getTutorHistory(user?.id || 'default', 5);
        setTutorHistory(history);
      } catch (err) {
        console.error('Failed to load tutor history:', err);
      }
    };

    if (user?.id) {
      loadTutorHistory();
    }
  }, [user?.id]);

  // Load subject topics when subject changes
  useEffect(() => {
    const loadSubjectTopics = async () => {
      try {
        const topics = await getSubjectTopics(selectedSubject, selectedLanguage);
        setSubjectTopics(topics);
      } catch (err) {
        console.error('Failed to load subject topics:', err);
      }
    };

    loadSubjectTopics();
  }, [selectedSubject, selectedLanguage]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          AI Tutors for Underprivileged Students
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          24/7 personalized tutoring with cultural awareness and voice interaction
        </p>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <div className="flex justify-center mb-2" style={{ color: 'var(--text-accent)' }}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMode(mode.id)}
              className="card p-4 text-left transition-all duration-200"
              style={{
                borderColor: isActive ? mode.color : 'var(--border)',
                borderWidth: '2px',
                background: isActive ? `${mode.color}10` : 'var(--bg-card)'
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{
                  background: isActive ? mode.color : `${mode.color}20`,
                  color: isActive ? 'white' : mode.color
                }}
              >
                {mode.icon}
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {mode.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {mode.description}
              </p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Settings Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="card p-4 mb-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="form-select"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="form-select"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="btn btn-outline flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <span>Voice Mode</span>
            </button>
            <button className="btn btn-outline flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            {activeMode === 'chat' && (
              <AITutorChat
                subject={selectedSubject}
                language={selectedLanguage}
                studentLevel="intermediate"
              />
            )}

            {activeMode === 'explain' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Lightbulb className="h-6 w-6 mr-3" style={{ color: 'var(--text-accent)' }} />
                  Concept Explanation
                </h2>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-500 text-sm">{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter a concept you'd like explained..."
                    value={conceptInput}
                    onChange={(e) => setConceptInput(e.target.value)}
                    className="form-input w-full"
                    disabled={isLoading}
                  />
                  <div className="flex space-x-4">
                    <select
                      value={conceptDifficulty}
                      onChange={(e) => setConceptDifficulty(e.target.value)}
                      className="form-select"
                      disabled={isLoading}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <button
                      onClick={handleExplainConcept}
                      disabled={isLoading || !conceptInput.trim()}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Explaining...</span>
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4" />
                          <span>Get Explanation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Concept Explanation Results */}
                {conceptExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="p-4 rounded-lg" style={{ background: 'var(--surface)' }}>
                      <h3 className="font-semibold mb-2 flex items-center" style={{ color: 'var(--text-primary)' }}>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        {conceptExplanation.concept}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {conceptExplanation.explanation}
                      </p>

                      {/* Related Concepts */}
                      {conceptExplanation.related_concepts && conceptExplanation.related_concepts.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2" style={{ color: 'var(--text-accent)' }}>
                            Related Concepts:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {conceptExplanation.related_concepts.map((concept, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 rounded-full text-xs"
                                style={{ background: 'var(--primary-gradient)', color: 'white' }}
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Examples */}
                      {conceptExplanation.examples && conceptExplanation.examples.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2" style={{ color: 'var(--text-accent)' }}>
                            Examples:
                          </h4>
                          <div className="space-y-2">
                            {conceptExplanation.examples.map((example, index) => (
                              <div key={index} className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                <h5 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {example.title}
                                </h5>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                  {example.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeMode === 'practice' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Target className="h-6 w-6 mr-3" style={{ color: 'var(--text-accent)' }} />
                  Practice Questions
                </h2>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-500 text-sm">{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter a topic for practice questions..."
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    className="form-input w-full"
                    disabled={isLoading}
                  />
                  <div className="flex space-x-4">
                    <select
                      value={practiceDifficulty}
                      onChange={(e) => setPracticeDifficulty(e.target.value)}
                      className="form-select"
                      disabled={isLoading}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Number of questions"
                      min="1"
                      max="10"
                      value={practiceCount}
                      onChange={(e) => setPracticeCount(parseInt(e.target.value) || 5)}
                      className="form-input w-32"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleGeneratePracticeQuestions}
                      disabled={isLoading || !practiceInput.trim()}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4" />
                          <span>Generate Questions</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Practice Questions Results */}
                {practiceQuestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <h3 className="font-semibold flex items-center" style={{ color: 'var(--text-primary)' }}>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Generated {practiceQuestions.length} Practice Questions
                    </h3>

                    {practiceQuestions.map((question, index) => (
                      <div key={index} className="p-4 rounded-lg" style={{ background: 'var(--surface)' }}>
                        <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                          Question {index + 1}: {question.question}
                        </h4>

                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{
                                      background: option === question.correct_answer ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                                      color: option === question.correct_answer ? 'white' : 'var(--text-secondary)'
                                    }}>
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                          <h5 className="font-medium text-sm mb-1" style={{ color: 'var(--text-accent)' }}>
                            Explanation:
                          </h5>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {question.explanation}
                          </p>
                        </div>

                        {question.hints && question.hints.length > 0 && (
                          <div className="mt-2">
                            <h5 className="font-medium text-sm mb-1" style={{ color: 'var(--text-accent)' }}>
                              Hints:
                            </h5>
                            <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                              {question.hints.map((hint, hintIndex) => (
                                <li key={hintIndex} className="flex items-start">
                                  <span className="mr-2">💡</span>
                                  {hint}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {activeMode === 'voice' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Mic className="h-6 w-6 mr-3" style={{ color: 'var(--text-accent)' }} />
                  Voice Learning
                </h2>
                <div className="text-center py-8">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: isRecording ? '#EF4444' : 'var(--surface)' }}
                  >
                    <Mic className="h-10 w-10" style={{ color: isRecording ? 'white' : 'var(--text-secondary)' }} />
                  </div>
                  <button
                    onClick={handleVoiceInput}
                    className={`btn ${isRecording ? 'btn-secondary' : 'btn-primary'} mb-4`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Voice Learning'}
                  </button>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {isRecording ? 'Listening... Speak your question or topic' : 'Click to start voice interaction'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Enhanced Quick Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Lightbulb className="h-5 w-5 mr-2" style={{ color: 'var(--text-accent)' }} />
                Quick Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickQuestion(question)}
                    className="p-4 text-left rounded-xl transition-all duration-200 border"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span className="text-sm font-medium">{question}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Learning Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <HelpCircle className="h-5 w-5 mr-2" style={{ color: 'var(--text-accent)' }} />
              Learning Tips
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  💡 Ask specific questions for better explanations
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  🎯 Use your native language for better understanding
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  🔄 Practice regularly with generated questions
                </p>
              </div>
            </div>
          </motion.div>

          {/* AI Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <Sparkles className="h-5 w-5 mr-2" style={{ color: 'var(--text-accent)' }} />
              AI Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" style={{ color: '#ef4444' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Cultural context awareness
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" style={{ color: '#10b981' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Personalized learning paths
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" style={{ color: '#3b82f6' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Multilingual support
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Voice interaction
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recent Topics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Recent Topics
            </h3>
            <div className="space-y-2">
              {['Algebra Basics', 'Cell Biology', 'Indian History', 'Programming Loops'].map((topic, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:scale-102"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <span className="text-sm">{topic}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Session Info */}
          {currentSession && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card"
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Current Session
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Subject:</span>
                  <span style={{ color: 'var(--text-primary)' }} className="capitalize">
                    {currentSession.subject}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {Math.floor(currentSession.duration / 60)}m {currentSession.duration % 60}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Questions:</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {currentSession.questionsAsked}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;
