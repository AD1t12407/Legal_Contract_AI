import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Clock,
  Brain,
  LayoutDashboard,
  Globe,
  Volume2,
  Accessibility,
  User,
  Shield,
  Mic,
  Zap,
  Wifi,
  WifiOff,
  Database,
  Languages,
  BookOpen,
  Target,
  Award,
  MessageSquare,
  Headphones,
  Download,
  Smartphone,
  RefreshCw,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'focus', label: 'Focus Sessions', icon: Clock },
    { id: 'learning', label: 'Learning & AI', icon: Brain },
    { id: 'language', label: 'Language & Voice', icon: Globe },
    { id: 'speech', label: 'Speech & Audio', icon: Mic },
    { id: 'gamification', label: 'Gamification', icon: Award },
    { id: 'offline', label: 'Offline Mode', icon: WifiOff },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
          <Settings className="h-7 w-7 mr-3" style={{ color: 'var(--text-accent)' }} />
          Settings
        </h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3"
                      style={{
                        background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderLeft: activeTab === tab.id ? '3px solid var(--text-accent)' : '3px solid transparent'
                      }}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card">{renderTabContent()}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  function renderTabContent() {
    switch (activeTab) {
      case 'notifications':
        return <NotificationsSettings />;
      case 'focus':
        return <FocusSettings />;
      case 'learning':
        return <LearningSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'speech':
        return <SpeechSettings />;
      case 'gamification':
        return <GamificationSettings />;
      case 'offline':
        return <OfflineSettings />;
      case 'accessibility':
        return <AccessibilitySettings />;
      case 'account':
        return <AccountSettings user={user} />;
      default:
        return <NotificationsSettings />;
    }
  }
};

// Settings Components
const NotificationsSettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <Bell className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Notifications
    </h2>

    <div className="space-y-6">
      <ToggleSetting
        title="Focus Session Reminders"
        description="Notify me to start a focus session"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Idle Alerts"
        description="Alert me when I become idle during a focus session"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Learning Prompts"
        description="Prompt me to record learnings after a focus session"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Voice Notifications"
        description="Use voice alerts for important notifications"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Extension Sync"
        description="Sync notifications with Chrome extension"
        defaultChecked={true}
      />
    </div>
  </div>
);

const FocusSettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <Clock className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Focus Session Settings
    </h2>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Default Session Duration
        </label>
        <select
          className="form-input w-full max-w-xs"
          defaultValue="25"
        >
          <option value="15">15 minutes</option>
          <option value="25">25 minutes (Pomodoro)</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Idle Timeout (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="30"
          defaultValue="5"
          className="form-input w-full max-w-xs"
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Time before marking session as idle
        </p>
      </div>

      <ToggleSetting
        title="Auto-start Break Timer"
        description="Automatically start break timer after focus session"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Sound Notifications"
        description="Play sound when session starts/ends"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Website Blocking"
        description="Block distracting websites during focus sessions"
        defaultChecked={false}
      />
    </div>
  </div>
);

const LearningSettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <Brain className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Learning & AI Settings
    </h2>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Learning Profile
        </label>
        <select className="form-input w-full max-w-xs" defaultValue="student">
          <option value="student">Student (Rural Focus)</option>
          <option value="researcher">Researcher</option>
          <option value="professional">Professional</option>
          <option value="teacher">Teacher/Educator</option>
        </select>
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Affects AI tutor behavior and content recommendations
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Student Level
        </label>
        <select className="form-input w-full max-w-xs" defaultValue="intermediate">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Preferred Subjects
        </label>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          {['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'General'].map(subject => (
            <label key={subject} className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" defaultChecked={subject === 'General'} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subject}</span>
            </label>
          ))}
        </div>
      </div>

      <ToggleSetting
        title="AI Tutoring"
        description="Enable AI-powered tutoring assistance"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Generate Quizzes"
        description="Create quiz questions for each learning session"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Auto-Generate Resources"
        description="Automatically find relevant learning resources"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Cultural Context"
        description="Adapt content for Indian educational context"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Practice Questions"
        description="Generate practice questions based on learning content"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Concept Explanations"
        description="Get detailed explanations for complex concepts"
        defaultChecked={true}
      />
    </div>
  </div>
);

const LanguageSettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <Globe className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Language & Voice Settings
    </h2>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Interface Language
        </label>
        <select className="form-input w-full max-w-xs" defaultValue="en">
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="bn">বাংলা (Bengali)</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
        </select>
      </div>

      <ToggleSetting
        title="Voice Commands"
        description="Enable voice control for navigation and actions"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Text-to-Speech"
        description="Read content aloud in selected language"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Voice Feedback"
        description="Provide voice feedback for actions"
        defaultChecked={true}
      />
    </div>
  </div>
);

const AccessibilitySettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <Accessibility className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Accessibility Settings
    </h2>

    <div className="space-y-6">
      <ToggleSetting
        title="High Contrast Mode"
        description="Increase contrast for better visibility"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Large Text"
        description="Increase font size throughout the app"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Screen Reader Support"
        description="Enhanced support for screen readers"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Reduced Motion"
        description="Minimize animations and transitions"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Simple Mode"
        description="Simplified interface for easier navigation"
        defaultChecked={false}
      />
    </div>
  </div>
);

const AccountSettings: React.FC<{ user: any }> = ({ user }) => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <User className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Account Settings
    </h2>

    <div className="space-y-6">
      <div className="p-4 rounded-lg" style={{ background: 'var(--surface)' }}>
        <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Profile Information</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>Name:</strong> {user?.name || 'Not set'}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>Email:</strong> {user?.email || 'Not set'}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <strong>Language:</strong> {user?.language || 'English'}
        </p>
      </div>

      <ToggleSetting
        title="Data Sync"
        description="Sync data across devices and extension"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Analytics"
        description="Help improve the app by sharing usage data"
        defaultChecked={true}
      />

      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button className="btn btn-outline text-red-500 border-red-500 hover:bg-red-50">
          Delete Account
        </button>
      </div>
    </div>
  </div>
);

// New Settings Components
const SpeechSettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <Mic className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Speech & Audio Settings
    </h2>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Speech Recognition Language
        </label>
        <select className="form-input w-full max-w-xs" defaultValue="en">
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="bn">বাংলা (Bengali)</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Voice Speed
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          defaultValue="1"
          className="w-full max-w-xs"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          <span>Slow</span>
          <span>Normal</span>
          <span>Fast</span>
        </div>
      </div>

      <ToggleSetting
        title="Voice Commands"
        description="Enable voice control for navigation and actions"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Speech-to-Text"
        description="Convert speech to text for learning inputs"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Text-to-Speech"
        description="Read content aloud in selected language"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Voice Feedback"
        description="Provide voice feedback for actions"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Auto-Transcribe Sessions"
        description="Automatically transcribe focus sessions"
        defaultChecked={false}
      />

      <ToggleSetting
        title="Pronunciation Guide"
        description="Show pronunciation guides for new words"
        defaultChecked={true}
      />
    </div>
  </div>
);

const GamificationSettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
      <Award className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
      Gamification Settings
    </h2>

    <div className="space-y-6">
      <ToggleSetting
        title="Achievement Notifications"
        description="Show notifications when earning achievements"
        defaultChecked={true}
      />

      <ToggleSetting
        title="XP Tracking"
        description="Track experience points for activities"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Leaderboards"
        description="Participate in community leaderboards"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Streak Reminders"
        description="Get reminders to maintain your streak"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Level Up Celebrations"
        description="Show celebrations when leveling up"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Badge Collection"
        description="Collect badges for various achievements"
        defaultChecked={true}
      />

      <ToggleSetting
        title="Progress Sharing"
        description="Allow sharing progress with mentors/teachers"
        defaultChecked={false}
      />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Difficulty Level
        </label>
        <select className="form-input w-full max-w-xs" defaultValue="balanced">
          <option value="easy">Easy (More rewards)</option>
          <option value="balanced">Balanced</option>
          <option value="challenging">Challenging (Fewer rewards)</option>
        </select>
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Affects achievement difficulty and XP rewards
        </p>
      </div>
    </div>
  </div>
);

const OfflineSettings: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkSyncStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/offline/sync-status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/offline/sync', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        console.log('Sync completed:', data);
        checkSyncStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <WifiOff className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
        Offline Mode Settings
      </h2>

      <div className="space-y-6">
        {/* Sync Status */}
        <div className="p-4 rounded-lg" style={{ background: 'var(--surface)' }}>
          <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Sync Status</h3>
          {syncStatus ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Last Sync:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {syncStatus.last_sync ? new Date(syncStatus.last_sync).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Unsynced Sessions:</span>
                <span style={{ color: 'var(--text-primary)' }}>{syncStatus.unsynced_items?.sessions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Unsynced Learnings:</span>
                <span style={{ color: 'var(--text-primary)' }}>{syncStatus.unsynced_items?.learnings || 0}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Loading sync status...</p>
          )}

          <div className="flex space-x-2 mt-4">
            <button
              onClick={checkSyncStatus}
              disabled={isLoading}
              className="btn btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Check Status</span>
            </button>
            <button
              onClick={syncData}
              disabled={isLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Wifi className="h-4 w-4" />
              <span>Sync Now</span>
            </button>
          </div>
        </div>

        <ToggleSetting
          title="Auto-Sync"
          description="Automatically sync when internet is available"
          defaultChecked={true}
        />

        <ToggleSetting
          title="Offline Mode"
          description="Enable full offline functionality"
          defaultChecked={true}
        />

        <ToggleSetting
          title="Cache Learning Content"
          description="Download content for offline access"
          defaultChecked={true}
        />

        <ToggleSetting
          title="Low Bandwidth Mode"
          description="Optimize for slow internet connections"
          defaultChecked={false}
        />

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Sync Frequency
          </label>
          <select className="form-input w-full max-w-xs" defaultValue="auto">
            <option value="manual">Manual Only</option>
            <option value="auto">Automatic</option>
            <option value="wifi">WiFi Only</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Storage Limit (MB)
          </label>
          <input
            type="number"
            min="100"
            max="5000"
            defaultValue="1000"
            className="form-input w-full max-w-xs"
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Maximum storage for offline data
          </p>
        </div>
      </div>
    </div>
  );
};

// Toggle Setting Component
interface ToggleSettingProps {
  title: string;
  description: string;
  defaultChecked: boolean;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ title, description, defaultChecked }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div
        className="w-11 h-6 rounded-full peer transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--text-accent)]"
        style={{
          background: 'var(--border)',
          '--peer-checked-bg': 'var(--text-accent)'
        }}
      ></div>
    </label>
  </div>
);

export default SettingsPage;