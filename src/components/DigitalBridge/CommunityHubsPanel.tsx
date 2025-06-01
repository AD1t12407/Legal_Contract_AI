import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  MapPin, 
  Users, 
  Wifi, 
  Clock, 
  Phone, 
  Mail,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Navigation
} from 'lucide-react';
import { findNearbyHubsEnhanced, checkinToHub, CommunityHub } from '../../api/digitalBridgeApi';

const CommunityHubsPanel: React.FC = () => {
  const [hubs, setHubs] = useState<CommunityHub[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState({ lat: 14.6, lng: 77.6 });
  const [radiusKm, setRadiusKm] = useState(50);
  const [languageFilter, setLanguageFilter] = useState('');
  const [selectedHub, setSelectedHub] = useState<CommunityHub | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setSearchLocation(location);
          searchHubs(location.lat, location.lng);
        },
        () => {
          // Fallback to default location (Anantapur, AP)
          searchHubs(searchLocation.lat, searchLocation.lng);
        }
      );
    } else {
      searchHubs(searchLocation.lat, searchLocation.lng);
    }
  }, []);

  const searchHubs = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await findNearbyHubsEnhanced(lat, lng, radiusKm, languageFilter || undefined);
      setHubs(response.hubs);
    } catch (error) {
      console.error('Failed to search hubs:', error);
      // Fallback to mock data for demo
      setHubs([
        {
          hub_id: 'hub_001',
          name: 'Anantapur Learning Center',
          distance_km: 6.39,
          location: { lat: 14.6819, lng: 77.6006 },
          region: 'IN-AP',
          languages: ['te', 'en'],
          capacity: 50,
          current_users: 23,
          availability: '27 spots available',
          connectivity_type: 'wifi',
          resources: ['computers', 'tablets', 'books', 'internet'],
          operating_hours: { 'monday': '9:00-17:00', 'tuesday': '9:00-17:00' },
          contact_info: { phone: '+91-9876543210', email: 'anantapur@learning.org' },
          status: 'active'
        },
        {
          hub_id: 'hub_002',
          name: 'Salem Digital Hub',
          distance_km: 12.5,
          location: { lat: 11.6643, lng: 78.1460 },
          region: 'IN-TN',
          languages: ['ta', 'en'],
          capacity: 30,
          current_users: 18,
          availability: '12 spots available',
          connectivity_type: 'satellite',
          resources: ['tablets', 'solar_power', 'offline_content'],
          operating_hours: { 'monday': '10:00-16:00', 'tuesday': '10:00-16:00' },
          contact_info: { phone: '+91-9876543211', email: 'salem@learning.org' },
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (hubId: string) => {
    try {
      const response = await checkinToHub(hubId, { user_id: 'current_user' });
      alert(`✅ ${response.message}`);
      // Refresh hubs to update occupancy
      searchHubs(searchLocation.lat, searchLocation.lng);
    } catch (error) {
      console.error('Failed to check in:', error);
      alert('❌ Failed to check in to hub');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'maintenance': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectivityIcon = (type: string) => {
    switch (type) {
      case 'wifi': return '📶';
      case 'satellite': return '🛰️';
      case 'cellular': return '📱';
      default: return '🌐';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Building className="w-8 h-8 mr-3 text-blue-400" />
          Community Learning Hubs
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 text-sm">
              {hubs.length} hubs within {radiusKm}km
            </span>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Search Nearby Hubs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={searchLocation.lat}
              onChange={(e) => setSearchLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={searchLocation.lng}
              onChange={(e) => setSearchLocation(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Radius (km)
            </label>
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
              <option value="bn">Bengali</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => searchHubs(searchLocation.lat, searchLocation.lng)}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Search Hubs'}</span>
          </button>
          {userLocation && (
            <button
              onClick={() => {
                setSearchLocation(userLocation);
                searchHubs(userLocation.lat, userLocation.lng);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Use My Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Hubs Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Searching for nearby hubs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hubs.map((hub, index) => (
            <motion.div
              key={hub.hub_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{hub.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {hub.distance_km}km away
                    </span>
                    <span className={`flex items-center ${getStatusColor(hub.status)}`}>
                      {hub.status === 'active' ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                      {hub.status}
                    </span>
                  </div>
                </div>
                <div className="text-2xl">
                  {getConnectivityIcon(hub.connectivity_type)}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Capacity
                  </span>
                  <span className="text-white font-semibold">
                    {hub.current_users}/{hub.capacity}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(hub.current_users / hub.capacity) * 100}%` }}
                  ></div>
                </div>

                <div className="text-sm text-gray-300">
                  <span className="font-medium">Languages:</span> {hub.languages.join(', ')}
                </div>

                <div className="text-sm text-gray-300">
                  <span className="font-medium">Resources:</span> {hub.resources.join(', ')}
                </div>

                {hub.contact_info.phone && (
                  <div className="flex items-center text-sm text-gray-300">
                    <Phone className="w-4 h-4 mr-2" />
                    {hub.contact_info.phone}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedHub(hub)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleCheckin(hub.hub_id)}
                  disabled={hub.current_users >= hub.capacity}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Check In
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {hubs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No community hubs found in this area</p>
          <p className="text-gray-500 text-sm">Try expanding your search radius or changing location</p>
        </div>
      )}

      {/* Hub Details Modal */}
      {selectedHub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">{selectedHub.name}</h3>
              <button
                onClick={() => setSelectedHub(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-300 text-sm">Distance</span>
                  <p className="text-white font-semibold">{selectedHub.distance_km}km</p>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Status</span>
                  <p className={`font-semibold ${getStatusColor(selectedHub.status)}`}>
                    {selectedHub.status}
                  </p>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Connectivity</span>
                  <p className="text-white font-semibold">
                    {getConnectivityIcon(selectedHub.connectivity_type)} {selectedHub.connectivity_type}
                  </p>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Region</span>
                  <p className="text-white font-semibold">{selectedHub.region}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-300 text-sm">Operating Hours</span>
                <div className="mt-2 space-y-1">
                  {Object.entries(selectedHub.operating_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-300 capitalize">{day}</span>
                      <span className="text-white">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-gray-300 text-sm">Available Resources</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedHub.resources.map((resource) => (
                    <span
                      key={resource}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-gray-300 text-sm">Contact Information</span>
                <div className="mt-2 space-y-2">
                  {selectedHub.contact_info.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-white">{selectedHub.contact_info.phone}</span>
                    </div>
                  )}
                  {selectedHub.contact_info.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-white">{selectedHub.contact_info.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleCheckin(selectedHub.hub_id)}
                disabled={selectedHub.current_users >= selectedHub.capacity}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Check In to Hub
              </button>
              <button
                onClick={() => setSelectedHub(null)}
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

export default CommunityHubsPanel;
