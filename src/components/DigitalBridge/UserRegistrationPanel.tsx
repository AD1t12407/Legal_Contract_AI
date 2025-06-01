import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  MapPin, 
  Phone, 
  Globe, 
  GraduationCap,
  Smartphone,
  Wifi,
  CheckCircle,
  AlertCircle,
  Navigation,
  Users,
  BookOpen
} from 'lucide-react';
import { registerUser, UserProfile } from '../../api/digitalBridgeApi';

const UserRegistrationPanel: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    region: '',
    languages: [] as string[],
    location: { lat: 0, lng: 0 },
    phone_number: '',
    device_type: 'mobile',
    connectivity: 'low',
    learning_preferences: [] as string[],
    mentorship_status: 'learner'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get current location');
          setLocationLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await registerUser(formData);
      setSuccess(true);
      setError('');
      
      // Reset form
      setFormData({
        name: '',
        grade: '',
        region: '',
        languages: [],
        location: { lat: 0, lng: 0 },
        phone_number: '',
        device_type: 'mobile',
        connectivity: 'low',
        learning_preferences: [],
        mentorship_status: 'learner'
      });

      alert(`✅ User registered successfully! User ID: ${response.user_id}`);
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Failed to register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const regions = [
    { code: 'IN-AP', name: 'Andhra Pradesh' },
    { code: 'IN-TN', name: 'Tamil Nadu' },
    { code: 'IN-KA', name: 'Karnataka' },
    { code: 'IN-WB', name: 'West Bengal' },
    { code: 'IN-UP', name: 'Uttar Pradesh' },
    { code: 'IN-BR', name: 'Bihar' },
    { code: 'IN-OR', name: 'Odisha' },
    { code: 'IN-JH', name: 'Jharkhand' },
    { code: 'IN-MP', name: 'Madhya Pradesh' },
    { code: 'IN-RJ', name: 'Rajasthan' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' },
    { code: 'bn', name: 'Bengali' },
    { code: 'or', name: 'Odia' }
  ];

  const subjects = [
    'mathematics',
    'science',
    'english',
    'social_studies',
    'hindi',
    'telugu',
    'tamil',
    'physics',
    'chemistry',
    'biology',
    'computer_science'
  ];

  const grades = ['6', '7', '8', '9', '10', '11', '12'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <UserPlus className="w-8 h-8 mr-3 text-blue-400" />
          User Registration
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 text-sm">
              Join the Digital Bridge Network
            </span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grade Level *
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Region *
                </label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region.code} value={region.code}>{region.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91-9876543210"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lat}
                  onChange={(e) => handleInputChange('location', { ...formData.location, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="14.6819"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.location.lng}
                  onChange={(e) => handleInputChange('location', { ...formData.location, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="77.6006"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
                  <span>{locationLoading ? 'Getting...' : 'Get Location'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Languages *
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map(language => (
                <label key={language.code} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language.code)}
                    onChange={(e) => handleArrayChange('languages', language.code, e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{language.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Learning Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Learning Preferences
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {subjects.map(subject => (
                <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.learning_preferences.includes(subject)}
                    onChange={(e) => handleArrayChange('learning_preferences', subject, e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 capitalize">
                    {subject.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Device & Connectivity */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Device & Connectivity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Device Type
                </label>
                <select
                  value={formData.device_type}
                  onChange={(e) => handleInputChange('device_type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mobile">Mobile Phone</option>
                  <option value="tablet">Tablet</option>
                  <option value="desktop">Desktop/Laptop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connectivity Level
                </label>
                <select
                  value={formData.connectivity}
                  onChange={(e) => handleInputChange('connectivity', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low (2G/Basic)</option>
                  <option value="medium">Medium (3G/WiFi)</option>
                  <option value="high">High (4G/Broadband)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mentorship Status
                </label>
                <select
                  value={formData.mentorship_status}
                  onChange={(e) => handleInputChange('mentorship_status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="learner">Learner</option>
                  <option value="mentor">Mentor</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">User registered successfully!</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.grade || !formData.region || formData.languages.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>{loading ? 'Registering...' : 'Register User'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  grade: '',
                  region: '',
                  languages: [],
                  location: { lat: 0, lng: 0 },
                  phone_number: '',
                  device_type: 'mobile',
                  connectivity: 'low',
                  learning_preferences: [],
                  mentorship_status: 'learner'
                });
                setError('');
                setSuccess(false);
              }}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Registration Benefits */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Benefits of Registration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Access to nearby community hubs</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Connect with local learning peers</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Receive SMS learning updates</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Download offline content packages</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Track mobile learning unit schedules</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Mentorship opportunities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationPanel;
