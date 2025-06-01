import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Send, Loader } from 'lucide-react';

interface VoiceInputProps {
  onVoiceSubmit: (audioBlob: Blob, text?: string) => void;
  onTextSubmit: (text: string) => void;
  language: string;
  isProcessing?: boolean;
  placeholder?: string;
  showTextInput?: boolean;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceSubmit,
  onTextSubmit,
  language,
  isProcessing = false,
  placeholder = "Ask a question or share what you learned...",
  showTextInput = true,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [hasAudioSupport, setHasAudioSupport] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioLevelTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for audio support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasAudioSupport(false);
    }

    return () => {
      stopRecording();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis for visual feedback
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onVoiceSubmit(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timers
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio level monitoring
      audioLevelTimerRef.current = setInterval(() => {
        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasAudioSupport(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onTextSubmit(textInput.trim());
      setTextInput('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguagePrompt = (lang: string) => {
    const prompts: Record<string, string> = {
      'hi': 'अपना सवाल पूछें या बताएं कि आपने क्या सीखा...',
      'te': 'మీ ప్రశ్న అడగండి లేదా మీరు ఏమి నేర్చుకున్నారో చెప్పండి...',
      'ta': 'உங்கள் கேள்வியைக் கேளுங்கள் அல்லது நீங்கள் கற்றதைப் பகிருங்கள்...',
      'bn': 'আপনার প্রশ্ন জিজ্ঞাসা করুন বা আপনি কী শিখেছেন তা শেয়ার করুন...',
      'kn': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ ಅಥವಾ ನೀವು ಕಲಿತದ್ದನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...',
      'en': placeholder
    };
    return prompts[lang] || prompts['en'];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Recording Interface */}
      {hasAudioSupport && (
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Button */}
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-md'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
          >
            {isProcessing ? (
              <Loader className="w-8 h-8 text-white animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
            
            {/* Audio level visualization */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-300"
                animate={{
                  scale: 1 + audioLevel * 0.3,
                  opacity: 0.7 + audioLevel * 0.3
                }}
                transition={{ duration: 0.1 }}
              />
            )}
          </motion.button>
          
          {/* Recording Status */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium">Recording</span>
                  <span className="text-sm">{formatTime(recordingTime)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tap the microphone again to stop
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isRecording && !isProcessing && (
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-1">
                <Volume2 className="w-4 h-4" />
                <span>Tap to record your voice</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Speak in {language === 'en' ? 'English' : 'your preferred language'}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Text Input Alternative */}
      {showTextInput && (
        <div className="relative">
          <div className="text-center text-sm text-gray-500 mb-2">
            {hasAudioSupport ? 'Or type your message:' : 'Type your message:'}
          </div>
          
          <form onSubmit={handleTextSubmit} className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={getLanguagePrompt(language)}
              disabled={isProcessing || isRecording}
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
            />
            
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing || isRecording}
              className="absolute bottom-3 right-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
      
      {/* No Audio Support Message */}
      {!hasAudioSupport && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-yellow-800 font-medium">Voice input not available</div>
          <div className="text-yellow-600 text-sm mt-1">
            Please use the text input below or check your microphone permissions
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
