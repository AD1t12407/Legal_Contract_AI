import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Users, 
  MapPin, 
  Smartphone, 
  Download, 
  MessageSquare,
  Server,
  Truck,
  Building,
  UserPlus,
  Activity,
  Globe,
  Zap
} from 'lucide-react';
import { getDigitalBridgeHealth } from '../../api/digitalBridgeApi';
import CommunityHubsPanel from './CommunityHubsPanel';
import MobileLearningUnitsPanel from './MobileLearningUnitsPanel';
import PeerNetworkPanel from './PeerNetworkPanel';
import ContentPackagesPanel from './ContentPackagesPanel';
import SMSTrackingPanel from './SMSTrackingPanel';
import EdgeComputingPanel from './EdgeComputingPanel';
import UserRegistrationPanel from './UserRegistrationPanel';

interface DigitalBridgeStats {
  users_registered: number;
  community_hubs: number;
  mobile_units: number;
  peer_connections: number;
  content_packages: number;
  edge_nodes: number;
  sms_interactions: number;
}

const DigitalBridgeDashboard: React.FC = () => {
  const [stats, setStats] = useState<DigitalBridgeStats | null>(null);
  const [activePanel, setActivePanel] = useState<string>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDigitalBridgeHealth();
      setStats(response.digital_bridge);
    } catch (error) {
      console.error('Failed to load Digital Bridge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const panels = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'hubs', label: 'Community Hubs', icon: Building },
    { id: 'mobile', label: 'Mobile Units', icon: Truck },
    { id: 'peers', label: 'Peer Network', icon: Users },
    { id: 'content', label: 'Content Packages', icon: Download },
    { id: 'sms', label: 'SMS Tracking', icon: MessageSquare },
    { id: 'edge', label: 'Edge Computing', icon: Server },
    { id: 'register', label: 'User Registration', icon: UserPlus },
  ];

  const statCards = [
    {
      title: 'Registered Users',
      value: stats?.users_registered || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Active learners in the network'
    },
    {
      title: 'Community Hubs',
      value: stats?.community_hubs || 0,
      icon: Building,
      color: 'from-green-500 to-green-600',
      description: 'Learning centers available'
    },
    {
      title: 'Mobile Units',
      value: stats?.mobile_units || 0,
      icon: Truck,
      color: 'from-purple-500 to-purple-600',
      description: 'Mobile classrooms active'
    },
    {
      title: 'Peer Connections',
      value: stats?.peer_connections || 0,
      icon: Wifi,
      color: 'from-orange-500 to-orange-600',
      description: 'Active peer-to-peer links'
    },
    {
      title: 'Content Packages',
      value: stats?.content_packages || 0,
      icon: Download,
      color: 'from-teal-500 to-teal-600',
      description: 'Offline learning materials'
    },
    {
      title: 'SMS Interactions',
      value: stats?.sms_interactions || 0,
      icon: MessageSquare,
      color: 'from-pink-500 to-pink-600',
      description: 'SMS learning sessions'
    },
    {
      title: 'Edge Nodes',
      value: stats?.edge_nodes || 0,
      icon: Server,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Edge computing nodes'
    }
  ];

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'hubs':
        return <CommunityHubsPanel />;
      case 'mobile':
        return <MobileLearningUnitsPanel />;
      case 'peers':
        return <PeerNetworkPanel />;
      case 'content':
        return <ContentPackagesPanel />;
      case 'sms':
        return <SMSTrackingPanel />;
      case 'edge':
        return <EdgeComputingPanel />;
      case 'register':
        return <UserRegistrationPanel />;
      default:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                🌉 Digital Bridge Platform
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Bridging the digital divide in rural education through edge computing, 
                community hubs, mobile learning units, and peer-to-peer content sharing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {statCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <card.icon className="w-8 h-8" />
                    <span className="text-2xl font-bold">{card.value}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-400" />
                  Rural Education Impact
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Villages Reached</span>
                    <span className="text-white font-semibold">150+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Languages Supported</span>
                    <span className="text-white font-semibold">6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Offline Capability</span>
                    <span className="text-green-400 font-semibold">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Data Saved (MB)</span>
                    <span className="text-white font-semibold">2.3GB</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                  System Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Edge Node Uptime</span>
                    <span className="text-green-400 font-semibold">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Response Time</span>
                    <span className="text-white font-semibold">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Content Sync Success</span>
                    <span className="text-green-400 font-semibold">98.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Peer Connections Active</span>
                    <span className="text-white font-semibold">234</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Digital Bridge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Wifi className="w-8 h-8 mr-3 text-blue-400" />
            Digital Bridge Platform
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">System Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <nav className="p-4 space-y-2">
            {panels.map((panel) => (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activePanel === panel.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <panel.icon className="w-5 h-5" />
                <span className="font-medium">{panel.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderActivePanel()}
        </div>
      </div>
    </div>
  );
};

export default DigitalBridgeDashboard;
