import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  MapPin, 
  BookOpen, 
  MessageCircle,
  Star,
  Wifi,
  Search,
  Filter,
  Heart,
  Award,
  Clock,
  Globe
} from 'lucide-react';
import { discoverPeersEnhanced, connectWithPeer, PeerInfo } from '../../api/digitalBridgeApi';

const PeerNetworkPanel: React.FC = () => {
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId] = useState('demo_user_001'); // In real app, get from auth
  const [searchFilters, setSearchFilters] = useState({
    radiusKm: 50,
    grade: '',
    subject: ''
  });
  const [selectedPeer, setSelectedPeer] = useState<PeerInfo | null>(null);
  const [connectionRequests, setConnectionRequests] = useState<string[]>([]);

  useEffect(() => {
    searchPeers();
  }, []);

  const searchPeers = async () => {
    setLoading(true);
    try {
      const response = await discoverPeersEnhanced(
        currentUserId,
        searchFilters.radiusKm,
        searchFilters.grade || undefined,
        searchFilters.subject || undefined
      );
      setPeers(response.peers);
    } catch (error) {
      console.error('Failed to discover peers:', error);
      // Mock data for demo
      setPeers([
        {
          user_id: 'peer_001',
          name: 'Ravi Kumar',
          grade: '8',
          distance_km: 5.2,
          shared_subjects: ['mathematics', 'science'],
          mentorship_status: 'learner',
          languages: ['te', 'en'],
          connectivity: 'medium',
          last_active: new Date().toISOString()
        },
        {
          user_id: 'peer_002',
          name: 'Priya Sharma',
          grade: '9',
          distance_km: 8.7,
          shared_subjects: ['mathematics', 'english'],
          mentorship_status: 'mentor',
          languages: ['te', 'en'],
          connectivity: 'high',
          last_active: new Date().toISOString()
        },
        {
          user_id: 'peer_003',
          name: 'Arjun Reddy',
          grade: '8',
          distance_km: 12.3,
          shared_subjects: ['science', 'mathematics'],
          mentorship_status: 'both',
          languages: ['te', 'en', 'hi'],
          connectivity: 'low',
          last_active: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (peerId: string, connectionType: string = 'peer') => {
    try {
      setConnectionRequests(prev => [...prev, peerId]);
      const response = await connectWithPeer({
        user1_id: currentUserId,
        user2_id: peerId,
        connection_type: connectionType
      });
      alert(`✅ ${response.message}`);
      // Refresh peers to update connection status
      searchPeers();
    } catch (error) {
      console.error('Failed to connect with peer:', error);
      alert('❌ Failed to connect with peer');
    } finally {
      setConnectionRequests(prev => prev.filter(id => id !== peerId));
    }
  };

  const getMentorshipIcon = (status: string) => {
    switch (status) {
      case 'mentor': return '👨‍🏫';
      case 'learner': return '👨‍🎓';
      case 'both': return '🤝';
      default: return '👤';
    }
  };

  const getConnectivityColor = (connectivity: string) => {
    switch (connectivity) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectivityBars = (connectivity: string) => {
    const bars = connectivity === 'high' ? 3 : connectivity === 'medium' ? 2 : 1;
    return (
      <div className="flex space-x-1">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-1 h-3 rounded ${
              i <= bars ? getConnectivityColor(connectivity).replace('text-', 'bg-') : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const subjects = ['mathematics', 'science', 'english', 'social_studies', 'hindi', 'telugu'];
  const grades = ['6', '7', '8', '9', '10', '11', '12'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Users className="w-8 h-8 mr-3 text-orange-400" />
          Peer Learning Network
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 text-sm">
              {peers.length} peers nearby
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Find Learning Partners
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Radius (km)
            </label>
            <input
              type="number"
              value={searchFilters.radiusKm}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, radiusKm: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grade Level
            </label>
            <select
              value={searchFilters.grade}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject Interest
            </label>
            <select
              value={searchFilters.subject}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={searchPeers}
              disabled={loading}
              className="w-full px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Find Peers'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Peer Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Discovering learning partners...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peers.map((peer, index) => (
            <motion.div
              key={peer.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {peer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{peer.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <span>Grade {peer.grade}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {peer.distance_km}km
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-2xl">
                  {getMentorshipIcon(peer.mentorship_status)}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Mentorship</span>
                  <span className="text-white font-medium capitalize">
                    {peer.mentorship_status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Connectivity</span>
                  <div className="flex items-center space-x-2">
                    {getConnectivityBars(peer.connectivity)}
                    <span className={`text-sm font-medium ${getConnectivityColor(peer.connectivity)}`}>
                      {peer.connectivity}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-300 text-sm">Languages</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {peer.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                      >
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-300 text-sm">Shared Subjects</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {peer.shared_subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  Active recently
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeer(peer)}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleConnect(peer.user_id, 'peer')}
                  disabled={connectionRequests.includes(peer.user_id)}
                  className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {connectionRequests.includes(peer.user_id) ? 'Connecting...' : 'Connect'}
                </button>
                {peer.mentorship_status === 'mentor' && (
                  <button
                    onClick={() => handleConnect(peer.user_id, 'mentor')}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {peers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No learning partners found</p>
          <p className="text-gray-500 text-sm">Try expanding your search radius or changing filters</p>
        </div>
      )}

      {/* Peer Profile Modal */}
      {selectedPeer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedPeer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedPeer.name}</h3>
                  <p className="text-gray-300">Grade {selectedPeer.grade} • {selectedPeer.distance_km}km away</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPeer(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-300 text-sm">Mentorship Status</span>
                  <p className="text-white font-semibold capitalize flex items-center">
                    <span className="mr-2">{getMentorshipIcon(selectedPeer.mentorship_status)}</span>
                    {selectedPeer.mentorship_status}
                  </p>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Connectivity</span>
                  <div className="flex items-center space-x-2">
                    {getConnectivityBars(selectedPeer.connectivity)}
                    <span className={`font-semibold ${getConnectivityColor(selectedPeer.connectivity)}`}>
                      {selectedPeer.connectivity}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-gray-300 text-sm">Languages</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPeer.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-gray-300 text-sm">Shared Learning Interests</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPeer.shared_subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Learning Compatibility</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Subject Match</span>
                    <span className="text-green-400 font-semibold">
                      {selectedPeer.shared_subjects.length} subjects
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Distance</span>
                    <span className="text-white font-semibold">{selectedPeer.distance_km}km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Language Compatibility</span>
                    <span className="text-green-400 font-semibold">High</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleConnect(selectedPeer.user_id, 'peer')}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Connect as Peer
              </button>
              {selectedPeer.mentorship_status === 'mentor' && (
                <button
                  onClick={() => handleConnect(selectedPeer.user_id, 'mentor')}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Mentorship
                </button>
              )}
              <button
                onClick={() => setSelectedPeer(null)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PeerNetworkPanel;
