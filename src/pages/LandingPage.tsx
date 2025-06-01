import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Mic, 
  Globe, 
  Users, 
  Zap, 
  BookOpen, 
  MessageCircle, 
  Wifi,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Personalized Learning Platforms",
      subtitle: "For Vernacular Languages",
      description: "Interactive lessons in Hindi, Telugu, Tamil, Bengali, and Kannada with AI-powered personalization.",
      gradient: "var(--primary-gradient)",
      link: "/vernacular-learning"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "AI Tutors",
      subtitle: "For Underprivileged Students",
      description: "24/7 AI tutoring support with voice interaction and culturally-aware content delivery.",
      gradient: "var(--secondary-gradient)",
      link: "/ai-tutor"
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "Digital Bridge Tools",
      subtitle: "For Rural Education",
      description: "Offline-capable learning tools that work without internet and sync when connected.",
      gradient: "var(--accent-gradient)",
      link: "/digital-bridge"
    }
  ];

  const stats = [
    { number: "5", label: "Languages Supported", icon: <Globe className="w-5 h-5" /> },
    { number: "10K+", label: "Students Reached", icon: <Users className="w-5 h-5" /> },
    { number: "95%", label: "Offline Capability", icon: <Wifi className="w-5 h-5" /> },
    { number: "24/7", label: "AI Support", icon: <Brain className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Rural Maharashtra",
      text: "AutoPom helped me learn in Hindi when English was difficult. The voice feature made it so much easier!",
      rating: 5
    },
    {
      name: "Ravi Kumar",
      location: "Andhra Pradesh",
      text: "Even without internet, I could continue learning. This changed my life completely.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8" style={{ color: 'var(--text-accent)' }} />
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AutoPom</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/auth/signin')}
                className="btn btn-ghost"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/auth/signup')}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Transforming Educational Experiences Through{' '}
              <span 
                className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              >
                AI Technologies
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Empowering rural Indian students with personalized learning in vernacular languages, 
              AI tutoring, and tools to bridge the digital divide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/auth/signup')}
                className="btn btn-primary btn-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Learning Now
              </button>
              <button 
                onClick={() => navigate('/auth/signin')}
                className="btn btn-outline btn-lg"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Explore Features
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2" style={{ color: 'var(--text-accent)' }}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {stat.number}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Three Pillars of Educational Transformation
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Our comprehensive approach addresses the unique challenges faced by rural Indian students
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="card cursor-pointer group"
                onClick={() => navigate(feature.link)}
              >
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto"
                  style={{ background: feature.gradient }}
                >
                  <div style={{ color: 'var(--text-primary)' }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-accent)' }}>
                  {feature.subtitle}
                </p>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
                <div className="flex items-center text-sm group-hover:translate-x-2 transition-transform" style={{ color: 'var(--text-accent)' }}>
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Transforming Lives Across India
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="card"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#fbbf24' }} />
                  ))}
                </div>
                <p className="mb-4 italic" style={{ color: 'var(--text-secondary)' }}>
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {testimonial.name}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {testimonial.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="card"
            style={{ background: 'var(--primary-gradient)' }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to Transform Your Learning Journey?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of students already learning with AutoPom
            </p>
            <button 
              onClick={() => navigate('/auth/signup')}
              className="btn btn-secondary btn-lg"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Start Your Free Journey
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p style={{ color: 'var(--text-tertiary)' }}>
            © 2024 AutoPom. Built with ❤️ for rural Indian students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
