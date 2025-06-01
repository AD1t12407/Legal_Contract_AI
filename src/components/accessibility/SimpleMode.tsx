import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Eye, Volume2, Type, Contrast, Accessibility } from 'lucide-react';

interface SimpleModeSettings {
  enabled: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  contrast: 'normal' | 'high';
  voiceGuidance: boolean;
  reducedMotion: boolean;
  simpleLayout: boolean;
}

interface SimpleModeContextType {
  settings: SimpleModeSettings;
  updateSettings: (updates: Partial<SimpleModeSettings>) => void;
  toggleSimpleMode: () => void;
}

const SimpleModeContext = createContext<SimpleModeContextType | undefined>(undefined);

export const useSimpleMode = () => {
  const context = useContext(SimpleModeContext);
  if (!context) {
    throw new Error('useSimpleMode must be used within a SimpleModeProvider');
  }
  return context;
};

interface SimpleModeProviderProps {
  children: ReactNode;
}

export const SimpleModeProvider: React.FC<SimpleModeProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SimpleModeSettings>(() => {
    const saved = localStorage.getItem('simpleModeSettings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      fontSize: 'normal',
      contrast: 'normal',
      voiceGuidance: false,
      reducedMotion: false,
      simpleLayout: false
    };
  });

  useEffect(() => {
    localStorage.setItem('simpleModeSettings', JSON.stringify(settings));
    
    // Apply CSS classes based on settings
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('font-large', 'font-extra-large');
    if (settings.fontSize === 'large') {
      root.classList.add('font-large');
    } else if (settings.fontSize === 'extra-large') {
      root.classList.add('font-extra-large');
    }
    
    // High contrast
    root.classList.toggle('high-contrast', settings.contrast === 'high');
    
    // Reduced motion
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Simple layout
    root.classList.toggle('simple-layout', settings.simpleLayout);
    
  }, [settings]);

  const updateSettings = (updates: Partial<SimpleModeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleSimpleMode = () => {
    setSettings(prev => ({
      ...prev,
      enabled: !prev.enabled,
      // When enabling simple mode, apply accessibility-friendly defaults
      ...(prev.enabled ? {} : {
        fontSize: 'large',
        contrast: 'high',
        voiceGuidance: true,
        reducedMotion: true,
        simpleLayout: true
      })
    }));
  };

  const value = {
    settings,
    updateSettings,
    toggleSimpleMode
  };

  return (
    <SimpleModeContext.Provider value={value}>
      {children}
    </SimpleModeContext.Provider>
  );
};

interface SimpleModeToggleProps {
  className?: string;
}

export const SimpleModeToggle: React.FC<SimpleModeToggleProps> = ({ className = '' }) => {
  const { settings, toggleSimpleMode } = useSimpleMode();

  return (
    <button
      onClick={toggleSimpleMode}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
        settings.enabled
          ? 'bg-blue-100 border-blue-300 text-blue-800'
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      aria-label={`${settings.enabled ? 'Disable' : 'Enable'} simple mode for better accessibility`}
    >
      <Accessibility className="w-4 h-4" />
      <span className="font-medium">
        Simple Mode {settings.enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  );
};

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSimpleMode();

  if (!isOpen) return null;

  const speak = (text: string) => {
    if (settings.voiceGuidance && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Accessibility Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close accessibility panel"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
              <Type className="w-4 h-4" />
              <span>Text Size</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'normal', label: 'Normal', size: 'text-sm' },
                { value: 'large', label: 'Large', size: 'text-base' },
                { value: 'extra-large', label: 'Extra Large', size: 'text-lg' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateSettings({ fontSize: option.value as any });
                    speak(`Text size set to ${option.label}`);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    settings.fontSize === option.value
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className={option.size}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
              <Contrast className="w-4 h-4" />
              <span>Contrast</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'normal', label: 'Normal Contrast' },
                { value: 'high', label: 'High Contrast' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateSettings({ contrast: option.value as any });
                    speak(`Contrast set to ${option.label}`);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    settings.contrast === option.value
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Guidance */}
          <div>
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Voice Guidance</span>
              </div>
              <button
                onClick={() => {
                  const newValue = !settings.voiceGuidance;
                  updateSettings({ voiceGuidance: newValue });
                  if (newValue) {
                    speak('Voice guidance enabled');
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.voiceGuidance ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.voiceGuidance ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Reduced Motion */}
          <div>
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Reduce Motion</span>
              </div>
              <button
                onClick={() => {
                  const newValue = !settings.reducedMotion;
                  updateSettings({ reducedMotion: newValue });
                  speak(newValue ? 'Motion reduced' : 'Motion enabled');
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Simple Layout */}
          <div>
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Accessibility className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Simple Layout</span>
              </div>
              <button
                onClick={() => {
                  const newValue = !settings.simpleLayout;
                  updateSettings({ simpleLayout: newValue });
                  speak(newValue ? 'Simple layout enabled' : 'Standard layout enabled');
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.simpleLayout ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.simpleLayout ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            These settings are saved locally and will persist across sessions.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
