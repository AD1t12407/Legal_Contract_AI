import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, User, Mail, Lock, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(mode === 'signup' || mode === 'register');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    language: 'en'
  });

  const languages = [
    { code: 'en', name: '🇺🇸 English', native: 'English' },
    { code: 'hi', name: '🇮🇳 हिन्दी', native: 'Hindi' },
    { code: 'te', name: '🇮🇳 తెలుగు', native: 'Telugu' },
    { code: 'ta', name: '🇮🇳 தமிழ்', native: 'Tamil' },
    { code: 'bn', name: '🇮🇳 বাংলা', native: 'Bengali' },
    { code: 'kn', name: '🇮🇳 ಕನ್ನಡ', native: 'Kannada' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;

      if (isSignUp) {
        success = await register(formData);
      } else {
        success = await login(formData.email, formData.password);
      }

      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: '',
      email: '',
      password: '',
      language: 'en'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost mb-4 mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-8 h-8" style={{ color: 'var(--text-accent)' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AutoPom</span>
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isSignUp
              ? 'Join thousands of learners worldwide'
              : 'Sign in to continue your learning journey'
            }
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={isSignUp}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      focusRingColor: 'var(--text-accent)'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Preferred Language
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    required={isSignUp}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 appearance-none"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Select your language</option>
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary btn-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Demo User Info */}
          {!isSignUp && (
            <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                🎯 Try Demo Account
              </h4>
              <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <p><strong>Email:</strong> demo@autopom.app</p>
                <p><strong>Password:</strong> demo123</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Demo user: Priya Sharma from rural Maharashtra
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    email: 'demo@autopom.app',
                    password: 'demo123'
                  });
                }}
                className="mt-2 text-xs btn btn-outline btn-sm w-full"
              >
                Fill Demo Credentials
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p style={{ color: 'var(--text-secondary)' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="font-medium hover:underline"
                style={{ color: 'var(--text-accent)' }}
              >
                {isSignUp ? 'Sign in here' : 'Create one here'}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Extension Integration Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Have the Chrome extension? Your account will sync automatically.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
