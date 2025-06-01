import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Brain,
  Globe,
  Loader,
  Settings
} from 'lucide-react';

// Import the API function
import { askAITutor } from '../../api/aiTutorApi';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  language?: string;
  subject?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  followUpQuestions?: string[];
}

interface AITutorChatProps {
  subject?: string;
  language?: string;
  studentLevel?: string;
}

const AITutorChat: React.FC<AITutorChatProps> = ({
  subject = 'general',
  language = 'en',
  studentLevel = 'intermediate'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm your AI tutor. I'm here to help you learn ${subject}. What would you like to explore today?`,
      timestamp: new Date(),
      language,
      subject
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedSubject, setSelectedSubject] = useState(subject);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    { id: 'general', name: 'General', icon: '📚' },
    { id: 'mathematics', name: 'Mathematics', icon: '🔢' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'english', name: 'English', icon: '📝' },
    { id: 'social_studies', name: 'Social Studies', icon: '🌍' },
    { id: 'computer_science', name: 'Computer Science', icon: '💻' }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use the proper API function
      const data = await askAITutor(
        content,
        selectedSubject,
        selectedLanguage,
        studentLevel,
        'current_user'
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        language: selectedLanguage,
        subject: selectedSubject,
        resources: data.resources || [],
        followUpQuestions: data.follow_up_questions || []
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-speak AI response if enabled
      if (isSpeaking) {
        await speakText(data.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // Implement speech recognition here
      // This would use the Web Speech API or send audio to the backend
      console.log('Starting speech recognition...');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('Stopping speech recognition...');
  };

  const speakText = async (text: string) => {
    try {
      // For now, use browser's built-in speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' :
                        selectedLanguage === 'te' ? 'te-IN' :
                        selectedLanguage === 'ta' ? 'ta-IN' :
                        selectedLanguage === 'bn' ? 'bn-IN' :
                        selectedLanguage === 'kn' ? 'kn-IN' : 'en-US';
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  AI Tutor
                </h3>
                <p className="text-white text-opacity-80 text-sm">
                  {subjects.find(s => s.id === selectedSubject)?.name} • {languages.find(l => l.code === selectedLanguage)?.native}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white text-opacity-70">Online & Ready to Help</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSpeaking(!isSpeaking)}
                className="p-3 rounded-xl transition-all duration-200 hover:scale-110"
                style={{
                  background: isSpeaking ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {isSpeaking ? <Volume2 className="h-5 w-5 text-white" /> : <VolumeX className="h-5 w-5 text-white" />}
              </button>
              <button
                className="p-3 rounded-xl transition-all duration-200 hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Settings className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Enhanced Subject and Language Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-white text-opacity-80 text-sm font-medium mb-2">
                <BookOpen className="h-4 w-4 inline mr-2" />
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 rounded-xl text-white font-medium transition-all duration-200 focus:ring-2 focus:ring-white focus:ring-opacity-50"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id} className="bg-gray-800 text-white">
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-white text-opacity-80 text-sm font-medium mb-2">
                <Globe className="h-4 w-4 inline mr-2" />
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 rounded-xl text-white font-medium transition-all duration-200 focus:ring-2 focus:ring-white focus:ring-opacity-50"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                    {lang.native}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-4 rounded-2xl shadow-lg ${
                    message.type === 'user'
                      ? 'rounded-br-md'
                      : 'rounded-bl-md'
                  }`}
                  style={{
                    background: message.type === 'user'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'var(--surface)',
                    color: message.type === 'user'
                      ? 'white'
                      : 'var(--text-primary)',
                    border: message.type === 'ai' ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <p className="leading-relaxed text-sm md:text-base">{message.content}</p>

                  {/* Resources */}
                  {message.resources && message.resources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium opacity-80">Resources:</p>
                      {message.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 rounded bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors"
                        >
                          <span className="text-sm">{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium opacity-80">Follow-up questions:</p>
                      {message.followUpQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleFollowUpQuestion(question)}
                          className="block w-full text-left p-2 rounded bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors text-sm"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`flex items-center mt-1 space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: message.type === 'user' ? 'var(--text-accent)' : 'var(--accent-gradient)' }}
                  >
                    {message.type === 'user' ? (
                      <User className="h-3 w-3" style={{ color: 'white' }} />
                    ) : (
                      <Bot className="h-3 w-3" style={{ color: 'white' }} />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 p-4 rounded-lg" style={{ background: 'var(--surface)' }}>
              <Loader className="h-4 w-4 animate-spin" style={{ color: 'var(--text-accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                AI is thinking...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex space-x-3 p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything in your preferred language..."
              className="w-full p-4 pr-12 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '16px'
              }}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isRecording ? 'animate-pulse' : ''
              }`}
              style={{
                background: isRecording ? '#ef4444' : 'var(--surface)',
                color: isRecording ? 'white' : 'var(--text-tertiary)'
              }}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: !inputMessage.trim() || isLoading
                ? 'var(--border)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3 px-4">
          {['Explain this concept', 'Give me practice problems', 'What should I learn next?', 'Help with homework'].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="px-3 py-2 text-xs rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)'
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITutorChat;
