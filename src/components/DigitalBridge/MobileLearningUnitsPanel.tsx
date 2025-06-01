import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Navigation,
  Laptop,
  Wifi,
  Battery,
  Route,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { findNearbyMobileUnits, getMobileUnitSchedule, MobileLearningUnit } from '../../api/digitalBridgeApi';

const MobileLearningUnitsPanel: React.FC = () => {
  const [units, setUnits] = useState<MobileLearningUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState({ lat: 14.6, lng: 77.6 });
  const [radiusKm, setRadiusKm] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState<MobileLearningUnit | null>(null);
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
          searchUnits(location.lat, location.lng);
        },
        () => {
          // Fallback to default location
          searchUnits(searchLocation.lat, searchLocation.lng);
        }
      );
    } else {
      searchUnits(searchLocation.lat, searchLocation.lng);
    }
  }, []);

  const searchUnits = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await findNearbyMobileUnits(lat, lng, radiusKm);
      setUnits(response.mobile_units);
    } catch (error) {
      console.error('Failed to search mobile units:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnitDetails = async (unitId: string) => {
    try {
      const unitDetails = await getMobileUnitSchedule(unitId);
      setSelectedUnit(unitDetails);
    } catch (error) {
      console.error('Failed to load unit details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'en_route': return 'text-blue-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'en_route': return <Navigation className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const getTodaysSchedule = (unit: MobileLearningUnit) => {
    const today = getCurrentDay();
    return unit.schedule.find(s => s.day.toLowerCase() === today);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Truck className="w-8 h-8 mr-3 text-purple-400" />
          Mobile Learning Units
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Route className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 text-sm">
              {units.length} units within {radiusKm}km
            </span>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Find Mobile Learning Units
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={searchLocation.lat}
              onChange={(e) => setSearchLocation(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => searchUnits(searchLocation.lat, searchLocation.lng)}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Search Units'}</span>
          </button>
          {userLocation && (
            <button
              onClick={() => {
                setSearchLocation(userLocation);
                searchUnits(userLocation.lat, userLocation.lng);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Use My Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Units Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Searching for mobile learning units...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {units.map((unit, index) => {
            const todaysSchedule = getTodaysSchedule(unit);
            
            return (
              <motion.div
                key={unit.unit_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{unit.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {unit.distance_km}km away
                      </span>
                      <span className={`flex items-center ${getStatusColor(unit.status)}`}>
                        {getStatusIcon(unit.status)}
                        <span className="ml-1">{unit.status}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl">🚐</div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Students
                    </span>
                    <span className="text-white font-semibold">
                      {unit.current_students}/{unit.capacity}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(unit.current_students / unit.capacity) * 100}%` }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Subjects:</span> {unit.subjects.join(', ')}
                  </div>

                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Languages:</span> {unit.languages.join(', ')}
                  </div>

                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Equipment:</span> {unit.equipment.slice(0, 3).join(', ')}
                    {unit.equipment.length > 3 && ` +${unit.equipment.length - 3} more`}
                  </div>

                  {todaysSchedule && (
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center text-sm text-blue-400 mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Today's Schedule
                      </div>
                      <div className="text-white font-medium">
                        {todaysSchedule.location} • {todaysSchedule.time}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => loadUnitDetails(unit.unit_id)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    View Schedule
                  </button>
                  <button
                    disabled={unit.current_students >= unit.capacity}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reserve Spot
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {units.length === 0 && !loading && (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No mobile learning units found in this area</p>
          <p className="text-gray-500 text-sm">Try expanding your search radius or changing location</p>
        </div>
      )}

      {/* Unit Details Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">{selectedUnit.name}</h3>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Unit Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Unit Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status</span>
                      <span className={`font-semibold ${getStatusColor(selectedUnit.status)}`}>
                        {selectedUnit.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Capacity</span>
                      <span className="text-white font-semibold">
                        {selectedUnit.current_students}/{selectedUnit.capacity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Current Location</span>
                      <span className="text-white font-semibold">
                        {selectedUnit.current_location.lat.toFixed(4)}, {selectedUnit.current_location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Subjects & Languages</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-300 text-sm">Subjects</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedUnit.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-300 text-sm">Languages</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedUnit.languages.map((language) => (
                          <span
                            key={language}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Equipment</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedUnit.equipment.map((item) => (
                      <div key={item} className="flex items-center text-sm text-gray-300">
                        <Laptop className="w-4 h-4 mr-2 text-purple-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule & Route */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Weekly Schedule</h4>
                  <div className="space-y-2">
                    {selectedUnit.schedule.map((schedule, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          schedule.day.toLowerCase() === getCurrentDay()
                            ? 'bg-purple-600 border-purple-500'
                            : 'bg-gray-700 border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white capitalize">
                              {schedule.day}
                            </div>
                            <div className="text-sm text-gray-300">
                              {schedule.location}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-300">
                              <Clock className="w-4 h-4 mr-1" />
                              {schedule.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Route (Next Stops)</h4>
                  <div className="space-y-2">
                    {selectedUnit.next_stops.slice(0, 5).map((stop, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-700 rounded-lg">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <div className="text-sm text-gray-300">
                          {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                disabled={selectedUnit.current_students >= selectedUnit.capacity}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reserve Learning Spot
              </button>
              <button
                onClick={() => setSelectedUnit(null)}
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

export default MobileLearningUnitsPanel;
