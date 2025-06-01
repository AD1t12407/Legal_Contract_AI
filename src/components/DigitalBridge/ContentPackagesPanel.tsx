import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Package, 
  Star, 
  Clock, 
  HardDrive,
  Wifi,
  WifiOff,
  Filter,
  Search,
  Play,
  BookOpen,
  Video,
  FileText,
  Headphones
} from 'lucide-react';
import { getContentPackages, downloadContentPackage, ContentPackage } from '../../api/digitalBridgeApi';

const ContentPackagesPanel: React.FC = () => {
  const [packages, setPackages] = useState<ContentPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    grade: '',
    subject: '',
    language: '',
    region: '',
    offline_only: false
  });
  const [selectedPackage, setSelectedPackage] = useState<ContentPackage | null>(null);
  const [downloads, setDownloads] = useState<Record<string, { progress: number; status: string }>>({});

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await getContentPackages(filters);
      setPackages(response.packages);
    } catch (error) {
      console.error('Failed to load content packages:', error);
      // Mock data for demo
      setPackages([
        {
          package_id: 'pkg_001',
          title: 'Basic Mathematics for Grade 8',
          subject: 'mathematics',
          grade: '8',
          language: 'te',
          region: 'IN-AP',
          content_type: 'mixed',
          size_mb: 45.2,
          offline_capable: true,
          prerequisites: ['grade_7_math'],
          learning_objectives: ['algebra_basics', 'geometry_introduction'],
          estimated_duration: 120,
          difficulty_level: 'intermediate',
          created_by: 'AP_Education_Board',
          version: '1.0',
          download_count: 1250,
          rating: 4.3
        },
        {
          package_id: 'pkg_002',
          title: 'Science Experiments for Rural Schools',
          subject: 'science',
          grade: '9',
          language: 'hi',
          region: 'IN-UP',
          content_type: 'video',
          size_mb: 89.7,
          offline_capable: true,
          prerequisites: ['basic_science'],
          learning_objectives: ['practical_experiments', 'scientific_method'],
          estimated_duration: 180,
          difficulty_level: 'intermediate',
          created_by: 'Rural_Science_Initiative',
          version: '1.2',
          download_count: 890,
          rating: 4.6
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (packageId: string) => {
    try {
      setDownloads(prev => ({ ...prev, [packageId]: { progress: 0, status: 'starting' } }));
      
      const response = await downloadContentPackage({
        package_id: packageId,
        user_id: 'current_user'
      });

      // Simulate download progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setDownloads(prev => ({ ...prev, [packageId]: { progress: 100, status: 'completed' } }));
        } else {
          setDownloads(prev => ({ ...prev, [packageId]: { progress, status: 'downloading' } }));
        }
      }, 500);

      alert(`✅ Download started: ${response.package_title}`);
    } catch (error) {
      console.error('Failed to start download:', error);
      setDownloads(prev => ({ ...prev, [packageId]: { progress: 0, status: 'error' } }));
      alert('❌ Failed to start download');
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Headphones className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      case 'interactive': return <Play className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  };

  const subjects = ['mathematics', 'science', 'english', 'social_studies', 'hindi', 'telugu'];
  const grades = ['6', '7', '8', '9', '10', '11', '12'];
  const languages = ['en', 'te', 'ta', 'hi', 'kn', 'bn'];
  const regions = ['IN-AP', 'IN-TN', 'IN-KA', 'IN-WB', 'IN-UP', 'IN-BR'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Package className="w-8 h-8 mr-3 text-teal-400" />
          Offline Content Packages
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 text-sm">
              {packages.length} packages available
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filter Content Packages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Grade</label>
            <select
              value={filters.grade}
              onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              value={filters.language}
              onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Offline Only</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.offline_only}
                onChange={(e) => setFilters(prev => ({ ...prev, offline_only: e.target.checked }))}
                className="mr-2 rounded"
              />
              <span className="text-white text-sm">Offline Capable</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadPackages}
              disabled={loading}
              className="w-full px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Loading...' : 'Apply Filters'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Packages Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading content packages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {packages.map((pkg, index) => {
            const downloadStatus = downloads[pkg.package_id];
            
            return (
              <motion.div
                key={pkg.package_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-teal-500 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
                      <span className="flex items-center">
                        {getContentTypeIcon(pkg.content_type)}
                        <span className="ml-1 capitalize">{pkg.content_type}</span>
                      </span>
                      <span>Grade {pkg.grade}</span>
                      <span className="uppercase">{pkg.language}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-white">{pkg.rating}</span>
                      </div>
                      <span className="text-gray-300">{pkg.download_count} downloads</span>
                      <span className={`${getDifficultyColor(pkg.difficulty_level)} capitalize`}>
                        {pkg.difficulty_level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pkg.offline_capable ? (
                      <WifiOff className="w-5 h-5 text-green-400" title="Offline Capable" />
                    ) : (
                      <Wifi className="w-5 h-5 text-gray-400" title="Online Required" />
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Size</span>
                    <span className="text-white font-semibold">{formatFileSize(pkg.size_mb)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Duration</span>
                    <span className="text-white font-semibold">{pkg.estimated_duration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Created by</span>
                    <span className="text-white font-semibold">{pkg.created_by}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-gray-300 text-sm">Learning Objectives</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pkg.learning_objectives.slice(0, 3).map((objective) => (
                      <span
                        key={objective}
                        className="px-2 py-1 bg-teal-600 text-white text-xs rounded-full"
                      >
                        {objective.replace('_', ' ')}
                      </span>
                    ))}
                    {pkg.learning_objectives.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                        +{pkg.learning_objectives.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {downloadStatus && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-300">Download Progress</span>
                      <span className="text-white">{Math.round(downloadStatus.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${downloadStatus.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 capitalize">
                      {downloadStatus.status}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedPackage(pkg)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDownload(pkg.package_id)}
                    disabled={downloadStatus?.status === 'downloading'}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadStatus?.status === 'completed' ? 'Downloaded' : 
                       downloadStatus?.status === 'downloading' ? 'Downloading...' : 'Download'}
                    </span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {packages.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No content packages found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria</p>
        </div>
      )}

      {/* Package Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">{selectedPackage.title}</h3>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Package Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Subject</span>
                      <span className="text-white font-semibold capitalize">{selectedPackage.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Grade Level</span>
                      <span className="text-white font-semibold">Grade {selectedPackage.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Language</span>
                      <span className="text-white font-semibold">{selectedPackage.language.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Region</span>
                      <span className="text-white font-semibold">{selectedPackage.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Content Type</span>
                      <span className="text-white font-semibold capitalize">{selectedPackage.content_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">File Size</span>
                      <span className="text-white font-semibold">{formatFileSize(selectedPackage.size_mb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Duration</span>
                      <span className="text-white font-semibold">{selectedPackage.estimated_duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Difficulty</span>
                      <span className={`font-semibold capitalize ${getDifficultyColor(selectedPackage.difficulty_level)}`}>
                        {selectedPackage.difficulty_level}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rating</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-white font-semibold">{selectedPackage.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Downloads</span>
                      <span className="text-white font-semibold">{selectedPackage.download_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Version</span>
                      <span className="text-white font-semibold">{selectedPackage.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Created by</span>
                      <span className="text-white font-semibold">{selectedPackage.created_by}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.prerequisites.map((prereq) => (
                      <span
                        key={prereq}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-full"
                      >
                        {prereq.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Learning Objectives</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.learning_objectives.map((objective) => (
                      <span
                        key={objective}
                        className="px-3 py-1 bg-teal-600 text-white text-sm rounded-full"
                      >
                        {objective.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    {selectedPackage.offline_capable ? (
                      <WifiOff className="w-5 h-5 text-green-400 mr-2" />
                    ) : (
                      <Wifi className="w-5 h-5 text-gray-400 mr-2" />
                    )}
                    Offline Capability
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {selectedPackage.offline_capable 
                      ? 'This content package can be downloaded and used completely offline, perfect for areas with limited internet connectivity.'
                      : 'This content requires an active internet connection to function properly.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleDownload(selectedPackage.package_id)}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Package</span>
              </button>
              <button
                onClick={() => setSelectedPackage(null)}
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

export default ContentPackagesPanel;
