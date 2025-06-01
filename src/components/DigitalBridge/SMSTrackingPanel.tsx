import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Globe,
  Smartphone,
  MessageCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { sendSMSMessage, receiveSMSMessage, getSMSHistory, SMSInteraction } from '../../api/digitalBridgeApi';

const SMSTrackingPanel: React.FC = () => {
  const [smsHistory, setSmsHistory] = useState<SMSInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+91-9876543210');
  const [newMessage, setNewMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [testMode, setTestMode] = useState(true);
  const [autoReply, setAutoReply] = useState('');

  useEffect(() => {
    if (phoneNumber) {
      loadSMSHistory();
    }
  }, [phoneNumber]);

  const loadSMSHistory = async () => {
    setLoading(true);
    try {
      const response = await getSMSHistory(phoneNumber);
      setSmsHistory(response.history);
    } catch (error) {
      console.error('Failed to load SMS history:', error);
      // Mock data for demo
      setSmsHistory([
        {
          interaction_id: 'sms_001',
          message_type: 'query',
          content: 'HELP',
          language: 'en',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          response_sent: true
        },
        {
          interaction_id: 'sms_002',
          message_type: 'response',
          content: '📚 Learning Help: Reply with MATH, SCIENCE, or ENGLISH for study materials. Reply MENTOR for peer connections.',
          language: 'en',
          timestamp: new Date(Date.now() - 299000).toISOString(),
          response_sent: true
        },
        {
          interaction_id: 'sms_003',
          message_type: 'query',
          content: 'MATH GRADE 8',
          language: 'en',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          response_sent: true
        },
        {
          interaction_id: 'sms_004',
          message_type: 'response',
          content: '🔢 Math resources available! Reply GRADE followed by your class (e.g., GRADE 8) for materials.',
          language: 'en',
          timestamp: new Date(Date.now() - 119000).toISOString(),
          response_sent: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendSMSMessage({
        phone_number: phoneNumber,
        message: newMessage,
        language: selectedLanguage
      });
      
      setNewMessage('');
      loadSMSHistory(); // Refresh history
      alert('✅ SMS sent successfully');
    } catch (error) {
      console.error('Failed to send SMS:', error);
      alert('❌ Failed to send SMS');
    }
  };

  const handleReceiveSMS = async (message: string) => {
    try {
      const response = await receiveSMSMessage({
        phone_number: phoneNumber,
        message: message,
        language: selectedLanguage
      });
      
      setAutoReply(response.response);
      loadSMSHistory(); // Refresh history
    } catch (error) {
      console.error('Failed to process SMS:', error);
    }
  };

  const testMessages = [
    'HELP',
    'MATH',
    'SCIENCE',
    'ENGLISH',
    'GRADE 8',
    'HUB',
    'MENTOR',
    'SCHEDULE'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' },
    { code: 'bn', name: 'Bengali' }
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'query': return <ArrowRight className="w-4 h-4 text-blue-400" />;
      case 'response': return <ArrowLeft className="w-4 h-4 text-green-400" />;
      case 'notification': return <MessageCircle className="w-4 h-4 text-purple-400" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-pink-400" />
          SMS Learning Tracking
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 text-sm">
              {smsHistory.length} interactions
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SMS Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phone Number & Language Selection */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              SMS Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="+91-9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={loadSMSHistory}
                disabled={loading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Loading...' : 'Load History'}</span>
              </button>
            </div>
          </div>

          {/* Send SMS */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Send SMS Message
            </h3>
            <div className="space-y-4">
              <div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your SMS message here..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSendSMS}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send SMS</span>
                </button>
                <button
                  onClick={() => setNewMessage('')}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* SMS History */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              SMS Conversation History
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {smsHistory.map((interaction, index) => (
                <motion.div
                  key={interaction.interaction_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    interaction.message_type === 'query'
                      ? 'bg-blue-900 border-blue-700 ml-8'
                      : 'bg-green-900 border-green-700 mr-8'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getMessageTypeIcon(interaction.message_type)}
                      <span className="text-sm font-medium text-gray-300 capitalize">
                        {interaction.message_type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(interaction.timestamp)}
                    </span>
                  </div>
                  <p className="text-white">{interaction.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 uppercase">
                      {interaction.language}
                    </span>
                    {interaction.response_sent && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </motion.div>
              ))}
              {smsHistory.length === 0 && !loading && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No SMS interactions yet</p>
                  <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Panel & Auto-Reply */}
        <div className="space-y-6">
          {/* Quick Test Messages */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Quick Test Messages
            </h3>
            <div className="space-y-2">
              {testMessages.map((message) => (
                <button
                  key={message}
                  onClick={() => handleReceiveSMS(message)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-left text-sm"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Reply Preview */}
          {autoReply && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Auto-Reply Preview
              </h3>
              <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                <p className="text-white">{autoReply}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">Auto-generated response</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* SMS Statistics */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              SMS Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Interactions</span>
                <span className="text-white font-semibold">{smsHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Queries Received</span>
                <span className="text-white font-semibold">
                  {smsHistory.filter(s => s.message_type === 'query').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Responses Sent</span>
                <span className="text-white font-semibold">
                  {smsHistory.filter(s => s.message_type === 'response').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Success Rate</span>
                <span className="text-green-400 font-semibold">
                  {smsHistory.length > 0 ? 
                    Math.round((smsHistory.filter(s => s.response_sent).length / smsHistory.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* SMS Features */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">SMS Learning Features</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Multilingual Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Auto-Reply System</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Subject-based Routing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Hub Location Services</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Mentor Connections</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Schedule Information</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSTrackingPanel;
