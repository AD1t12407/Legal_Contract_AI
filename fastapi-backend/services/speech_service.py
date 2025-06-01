"""
Speech Service for Voice I/O
Handles speech-to-text and text-to-speech functionality
"""

import os
import asyncio
import tempfile
import logging
from typing import Optional, Dict, Any
from pathlib import Path
import aiofiles

# Speech processing imports
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    logging.warning("Whisper not available - speech-to-text disabled")

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    logging.warning("gTTS not available - text-to-speech disabled")

try:
    from elevenlabs import generate, set_api_key
    ELEVENLABS_AVAILABLE = True
    # Set API key if available
    elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    if elevenlabs_key:
        set_api_key(elevenlabs_key)
except ImportError:
    ELEVENLABS_AVAILABLE = False
    logging.warning("ElevenLabs not available - premium TTS disabled")

try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False
    logging.warning("Pydub not available - audio processing limited")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SpeechService:
    """Service for handling speech-to-text and text-to-speech operations"""
    
    # Language mappings for TTS
    TTS_LANGUAGE_MAP = {
        'hi': 'hi',      # Hindi
        'te': 'te',      # Telugu  
        'ta': 'ta',      # Tamil
        'bn': 'bn',      # Bengali
        'kn': 'kn',      # Kannada
        'en': 'en'       # English
    }
    
    def __init__(self):
        self.whisper_model = None
        self.temp_dir = Path(tempfile.gettempdir()) / "focuslearning_audio"
        self.temp_dir.mkdir(exist_ok=True)
        
        # Initialize Whisper model if available
        if WHISPER_AVAILABLE:
            try:
                self.whisper_model = whisper.load_model("base")
                logger.info("Whisper model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load Whisper model: {e}")
                self.whisper_model = None
    
    async def speech_to_text(self, audio_file_path: str, language: str = 'auto') -> Dict[str, Any]:
        """Convert speech to text using Whisper"""
        try:
            if not WHISPER_AVAILABLE or not self.whisper_model:
                return {
                    'success': False,
                    'error': 'Speech-to-text service not available',
                    'text': '',
                    'language': 'en'
                }
            
            # Process audio file
            result = await asyncio.to_thread(
                self.whisper_model.transcribe,
                audio_file_path,
                language=None if language == 'auto' else language
            )
            
            return {
                'success': True,
                'text': result['text'].strip(),
                'language': result.get('language', 'en'),
                'confidence': 1.0  # Whisper doesn't provide confidence scores
            }
            
        except Exception as e:
            logger.error(f"Speech-to-text conversion failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'language': 'en'
            }
    
    async def text_to_speech_gtts(self, text: str, language: str = 'en', slow: bool = False) -> Optional[str]:
        """Convert text to speech using gTTS"""
        try:
            if not GTTS_AVAILABLE:
                return None
            
            # Map language code
            tts_lang = self.TTS_LANGUAGE_MAP.get(language, 'en')
            
            # Create temporary file
            temp_file = self.temp_dir / f"tts_{asyncio.current_task().get_name()}_{hash(text)}.mp3"
            
            # Generate speech
            tts = gTTS(text=text, lang=tts_lang, slow=slow)
            await asyncio.to_thread(tts.save, str(temp_file))
            
            return str(temp_file)
            
        except Exception as e:
            logger.error(f"gTTS conversion failed: {e}")
            return None
    
    async def text_to_speech_elevenlabs(self, text: str, voice: str = "Rachel") -> Optional[str]:
        """Convert text to speech using ElevenLabs (premium option)"""
        try:
            if not ELEVENLABS_AVAILABLE:
                return None
            
            # Generate speech
            audio = await asyncio.to_thread(
                generate,
                text=text,
                voice=voice,
                model="eleven_multilingual_v1"
            )
            
            # Save to temporary file
            temp_file = self.temp_dir / f"elevenlabs_{hash(text)}.mp3"
            
            async with aiofiles.open(temp_file, 'wb') as f:
                await f.write(audio)
            
            return str(temp_file)
            
        except Exception as e:
            logger.error(f"ElevenLabs TTS failed: {e}")
            return None
    
    async def text_to_speech(self, text: str, language: str = 'en', premium: bool = False) -> Dict[str, Any]:
        """Convert text to speech with fallback options"""
        try:
            audio_file = None
            
            # Try premium option first if requested and available
            if premium and ELEVENLABS_AVAILABLE:
                audio_file = await self.text_to_speech_elevenlabs(text)
            
            # Fallback to gTTS
            if not audio_file and GTTS_AVAILABLE:
                audio_file = await self.text_to_speech_gtts(text, language)
            
            if audio_file:
                return {
                    'success': True,
                    'audio_file': audio_file,
                    'language': language,
                    'method': 'elevenlabs' if premium and ELEVENLABS_AVAILABLE else 'gtts'
                }
            else:
                return {
                    'success': False,
                    'error': 'No TTS service available',
                    'audio_file': None
                }
                
        except Exception as e:
            logger.error(f"Text-to-speech conversion failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'audio_file': None
            }
    
    async def process_audio_upload(self, audio_data: bytes, filename: str) -> str:
        """Process uploaded audio file and return path"""
        try:
            # Create temporary file for uploaded audio
            temp_file = self.temp_dir / f"upload_{filename}"
            
            async with aiofiles.open(temp_file, 'wb') as f:
                await f.write(audio_data)
            
            return str(temp_file)
            
        except Exception as e:
            logger.error(f"Audio upload processing failed: {e}")
            raise
    
    async def convert_audio_format(self, input_path: str, output_format: str = 'wav') -> Optional[str]:
        """Convert audio to different format using pydub"""
        try:
            if not PYDUB_AVAILABLE:
                return input_path  # Return original if conversion not available
            
            # Load audio
            audio = await asyncio.to_thread(AudioSegment.from_file, input_path)
            
            # Create output path
            output_path = str(Path(input_path).with_suffix(f'.{output_format}'))
            
            # Export in new format
            await asyncio.to_thread(audio.export, output_path, format=output_format)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Audio format conversion failed: {e}")
            return input_path
    
    def cleanup_temp_files(self, max_age_hours: int = 24):
        """Clean up old temporary files"""
        try:
            import time
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            
            for file_path in self.temp_dir.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        file_path.unlink()
                        logger.info(f"Cleaned up old temp file: {file_path}")
                        
        except Exception as e:
            logger.error(f"Temp file cleanup failed: {e}")
    
    def get_service_status(self) -> Dict[str, bool]:
        """Get status of speech services"""
        return {
            'whisper_available': WHISPER_AVAILABLE and self.whisper_model is not None,
            'gtts_available': GTTS_AVAILABLE,
            'elevenlabs_available': ELEVENLABS_AVAILABLE,
            'pydub_available': PYDUB_AVAILABLE
        }

# Global instance
speech_service = SpeechService()
