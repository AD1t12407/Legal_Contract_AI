import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Activity,
  MapPin,
  Users,
  Database,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  BarChart3,
  Globe
} from 'lucide-react';
import { getEdgeNodes, EdgeNode } from '../../api/digitalBridgeApi';

const EdgeComputingPanel: React.FC = () => {
  const [nodes, setNodes] = useState<EdgeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedNode, setSelectedNode] = useState<EdgeNode | null>(null);

  useEffect(() => {
    loadEdgeNodes();
  }, [selectedRegion]);

  const loadEdgeNodes = async () => {
    setLoading(true);
    try {
      const response = await getEdgeNodes(selectedRegion || undefined);
      setNodes(response.edge_nodes);
    } catch (error) {
      console.error('Failed to load edge nodes:', error);
      // Mock data for demo
      setNodes([
        {
          node_id: 'edge_001',
          location: { lat: 14.6819, lng: 77.6006 },
          region: 'IN-AP',
          capacity_gb: 500.0,
          used_storage_gb: 234.5,
          available_storage_gb: 265.5,
          storage_utilization: 46.9,
          bandwidth_mbps: 100.0,
          connected_devices: 45,
          max_devices: 100,
          device_utilization: 45.0,
          status: 'online',
          last_sync: new Date().toISOString(),
          cached_content: ['math_grade8_te', 'science_grade9_hi', 'english_basics']
        },
        {
          node_id: 'edge_002',
          location: { lat: 11.6643, lng: 78.1460 },
          region: 'IN-TN',
          capacity_gb: 300.0,
          used_storage_gb: 156.8,
          available_storage_gb: 143.2,
          storage_utilization: 52.3,
          bandwidth_mbps: 50.0,
          connected_devices: 28,
          max_devices: 60,
          device_utilization: 46.7,
          status: 'online',
          last_sync: new Date(Date.now() - 300000).toISOString(),
          cached_content: ['tamil_literature', 'math_grade7_ta', 'science_basics']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5" />;
      case 'offline': return <XCircle className="w-5 h-5" />;
      case 'maintenance': return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 50) return 'bg-green-500';
    if (utilization < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(1)} GB`;
    return `${(bytes / 1024).toFixed(1)} TB`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const regions = ['IN-AP', 'IN-TN', 'IN-KA', 'IN-WB', 'IN-UP', 'IN-BR', 'IN-OR', 'IN-JH', 'IN-MP', 'IN-RJ'];

  const totalStats = nodes.reduce((acc, node) => ({
    totalCapacity: acc.totalCapacity + node.capacity_gb,
    totalUsed: acc.totalUsed + node.used_storage_gb,
    totalDevices: acc.totalDevices + node.connected_devices,
    totalMaxDevices: acc.totalMaxDevices + node.max_devices,
    onlineNodes: acc.onlineNodes + (node.status === 'online' ? 1 : 0)
  }), { totalCapacity: 0, totalUsed: 0, totalDevices: 0, totalMaxDevices: 0, onlineNodes: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Server className="w-8 h-8 mr-3 text-indigo-400" />
          Edge Computing Network
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">
              {totalStats.onlineNodes}/{nodes.length} nodes online
            </span>
          </div>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Server className="w-8 h-8" />
            <span className="text-2xl font-bold">{nodes.length}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Edge Nodes</h3>
          <p className="text-sm opacity-90">Active computing nodes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8" />
            <span className="text-2xl font-bold">{formatBytes(totalStats.totalCapacity)}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Total Storage</h3>
          <p className="text-sm opacity-90">{formatBytes(totalStats.totalUsed)} used</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" />
            <span className="text-2xl font-bold">{totalStats.totalDevices}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Connected Devices</h3>
          <p className="text-sm opacity-90">Max: {totalStats.totalMaxDevices}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {totalStats.totalCapacity > 0 ? Math.round((totalStats.totalUsed / totalStats.totalCapacity) * 100) : 0}%
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Network Load</h3>
          <p className="text-sm opacity-90">Average utilization</p>
        </motion.div>
      </div>

      {/* Region Filter */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Filter by Region
          </h3>
          <button
            onClick={loadEdgeNodes}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="mt-4">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Edge Nodes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading edge nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {nodes.map((node, index) => (
            <motion.div
              key={node.node_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Edge Node {node.node_id.split('_')[1]}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {node.region}
                    </span>
                    <span className={`flex items-center ${getStatusColor(node.status)}`}>
                      {getStatusIcon(node.status)}
                      <span className="ml-1 capitalize">{node.status}</span>
                    </span>
                  </div>
                </div>
                <div className="text-2xl">🖥️</div>
              </div>

              <div className="space-y-4">
                {/* Storage Utilization */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm flex items-center">
                      <HardDrive className="w-4 h-4 mr-2" />
                      Storage
                    </span>
                    <span className="text-white font-semibold">
                      {node.storage_utilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(node.storage_utilization)}`}
                      style={{ width: `${node.storage_utilization}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatBytes(node.used_storage_gb)} used</span>
                    <span>{formatBytes(node.available_storage_gb)} free</span>
                  </div>
                </div>

                {/* Device Connections */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Devices
                    </span>
                    <span className="text-white font-semibold">
                      {node.connected_devices}/{node.max_devices}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(node.device_utilization)}`}
                      style={{ width: `${node.device_utilization}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bandwidth & Performance */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Bandwidth</span>
                    <p className="text-white font-semibold">{node.bandwidth_mbps} Mbps</p>
                  </div>
                  <div>
                    <span className="text-gray-300">Last Sync</span>
                    <p className="text-white font-semibold">{formatTimestamp(node.last_sync)}</p>
                  </div>
                </div>

                {/* Cached Content */}
                <div>
                  <span className="text-gray-300 text-sm">Cached Content</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {node.cached_content.slice(0, 3).map((content) => (
                      <span
                        key={content}
                        className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full"
                      >
                        {content}
                      </span>
                    ))}
                    {node.cached_content.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                        +{node.cached_content.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => setSelectedNode(node)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View Details
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {nodes.length === 0 && !loading && (
        <div className="text-center py-12">
          <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No edge nodes found</p>
          <p className="text-gray-500 text-sm">Try selecting a different region or refresh the data</p>
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Edge Node {selectedNode.node_id.split('_')[1]} Details
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Node Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Node ID</span>
                      <span className="text-white font-semibold">{selectedNode.node_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Region</span>
                      <span className="text-white font-semibold">{selectedNode.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status</span>
                      <span className={`font-semibold ${getStatusColor(selectedNode.status)}`}>
                        {selectedNode.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Location</span>
                      <span className="text-white font-semibold">
                        {selectedNode.location.lat.toFixed(4)}, {selectedNode.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">Storage Utilization</span>
                        <span className="text-white">{selectedNode.storage_utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getUtilizationColor(selectedNode.storage_utilization)}`}
                          style={{ width: `${selectedNode.storage_utilization}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">Device Utilization</span>
                        <span className="text-white">{selectedNode.device_utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getUtilizationColor(selectedNode.device_utilization)}`}
                          style={{ width: `${selectedNode.device_utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Resource Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Capacity</span>
                      <span className="text-white font-semibold">{formatBytes(selectedNode.capacity_gb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Used Storage</span>
                      <span className="text-white font-semibold">{formatBytes(selectedNode.used_storage_gb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Available Storage</span>
                      <span className="text-green-400 font-semibold">{formatBytes(selectedNode.available_storage_gb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Bandwidth</span>
                      <span className="text-white font-semibold">{selectedNode.bandwidth_mbps} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Connected Devices</span>
                      <span className="text-white font-semibold">
                        {selectedNode.connected_devices}/{selectedNode.max_devices}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Last Sync</span>
                      <span className="text-white font-semibold">{formatTimestamp(selectedNode.last_sync)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Cached Content</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.cached_content.map((content) => (
                      <span
                        key={content}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full"
                      >
                        {content}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Manage Node
              </button>
              <button
                onClick={() => setSelectedNode(null)}
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

export default EdgeComputingPanel;
