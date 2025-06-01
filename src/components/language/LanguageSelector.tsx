import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Check, Volume2 } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  showVoiceTest?: boolean;
  className?: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  showVoiceTest = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  const testVoice = async (languageCode: string) => {
    setTestingVoice(languageCode);
    
    try {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
      const testText = getTestText(languageCode);
      
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: testText,
          language: languageCode,
          premium: 'false'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setTestingVoice(null);
        };
        
        audio.onerror = () => {
          setTestingVoice(null);
        };
        
        await audio.play();
      } else {
        setTestingVoice(null);
      }
    } catch (error) {
      console.error('Voice test failed:', error);
      setTestingVoice(null);
    }
  };

  const getTestText = (languageCode: string): string => {
    const testTexts: Record<string, string> = {
      'en': 'Hello! This is a voice test for English.',
      'hi': 'नमस्ते! यह हिन्दी के लिए आवाज़ का परीक्षण है।',
      'te': 'నమస్కారం! ఇది తెలుగు కోసం వాయిస్ టెస్ట్.',
      'ta': 'வணக்கம்! இது தமிழுக்கான குரல் சோதனை.',
      'bn': 'নমস্কার! এটি বাংলার জন্য ভয়েস টেস্ট।',
      'kn': 'ನಮಸ್ಕಾರ! ಇದು ಕನ್ನಡಕ್ಕಾಗಿ ಧ್ವನಿ ಪರೀಕ್ಷೆ.'
    };
    return testTexts[languageCode] || testTexts['en'];
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-lg">{selectedLang.flag}</span>
        <span className="font-medium text-gray-900">{selectedLang.nativeName}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-gray-400"
        >
          ▼
        </motion.div>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 px-3 py-2 border-b border-gray-100">
              Select your preferred language
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((language) => (
                <motion.div
                  key={language.code}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer rounded-md"
                  onClick={() => handleLanguageSelect(language.code)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{language.flag}</span>
                    <div>
                      <div className="font-medium text-gray-900">{language.nativeName}</div>
                      <div className="text-sm text-gray-500">{language.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {showVoiceTest && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          testVoice(language.code);
                        }}
                        disabled={testingVoice === language.code}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                        title="Test voice"
                      >
                        {testingVoice === language.code ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    
                    {selectedLanguage === language.code && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-500">
              More languages coming soon
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;
