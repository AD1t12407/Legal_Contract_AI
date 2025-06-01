"""
Speech Agent
Handles speech-to-text and text-to-speech operations for voice interaction
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from .base_agent import BaseAgent
from ..services.speech_service import speech_service

logger = logging.getLogger(__name__)

class SpeechAgent(BaseAgent):
    """Agent responsible for voice input/output processing"""
    
    def __init__(self):
        super().__init__(
            name="SpeechAgent",
            description="Handles speech-to-text and text-to-speech operations for voice-enabled learning"
        )
        self.service_status = speech_service.get_service_status()
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process speech-related tasks"""
        task_type = input_data.get('task_type')
        
        if task_type == 'speech_to_text':
            return await self.speech_to_text(input_data)
        elif task_type == 'text_to_speech':
            return await self.text_to_speech(input_data)
        elif task_type == 'process_voice_question':
            return await self.process_voice_question(input_data)
        elif task_type == 'generate_audio_response':
            return await self.generate_audio_response(input_data)
        elif task_type == 'voice_interaction_flow':
            return await self.voice_interaction_flow(input_data)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def speech_to_text(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert speech to text"""
        audio_file_path = input_data.get('audio_file_path')
        language = input_data.get('language', 'auto')
        
        if not audio_file_path:
            return {
                'success': False,
                'error': 'No audio file provided',
                'text': '',
                'language': 'en'
            }
        
        result = await speech_service.speech_to_text(audio_file_path, language)
        
        return {
            'success': result['success'],
            'text': result.get('text', ''),
            'detected_language': result.get('language', 'en'),
            'confidence': result.get('confidence', 0.0),
            'error': result.get('error')
        }
    
    async def text_to_speech(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert text to speech"""
        text = input_data.get('text', '')
        language = input_data.get('language', 'en')
        premium = input_data.get('premium', False)
        
        if not text:
            return {
                'success': False,
                'error': 'No text provided',
                'audio_file': None
            }
        
        result = await speech_service.text_to_speech(text, language, premium)
        
        return {
            'success': result['success'],
            'audio_file': result.get('audio_file'),
            'language': result.get('language', language),
            'method': result.get('method', 'unknown'),
            'error': result.get('error')
        }
    
    async def process_voice_question(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a voice question from user"""
        audio_file_path = input_data.get('audio_file_path')
        user_language = input_data.get('user_language', 'en')
        context = input_data.get('context', {})
        
        # Step 1: Convert speech to text
        stt_result = await self.speech_to_text({
            'audio_file_path': audio_file_path,
            'language': user_language
        })
        
        if not stt_result['success']:
            return {
                'success': False,
                'error': 'Speech recognition failed',
                'stage': 'speech_to_text'
            }
        
        question_text = stt_result['text']
        detected_language = stt_result['detected_language']
        
        return {
            'success': True,
            'question_text': question_text,
            'detected_language': detected_language,
            'confidence': stt_result['confidence'],
            'ready_for_processing': True,
            'context': context
        }
    
    async def generate_audio_response(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate audio response for text answer"""
        response_text = input_data.get('response_text', '')
        language = input_data.get('language', 'en')
        premium = input_data.get('premium', False)
        
        if not response_text:
            return {
                'success': False,
                'error': 'No response text provided'
            }
        
        # Generate audio
        tts_result = await self.text_to_speech({
            'text': response_text,
            'language': language,
            'premium': premium
        })
        
        return {
            'success': tts_result['success'],
            'audio_file': tts_result.get('audio_file'),
            'response_text': response_text,
            'language': language,
            'error': tts_result.get('error')
        }
    
    async def voice_interaction_flow(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Complete voice interaction flow: speech -> text -> processing -> speech"""
        audio_file_path = input_data.get('audio_file_path')
        user_language = input_data.get('user_language', 'en')
        session_id = input_data.get('session_id')
        context = input_data.get('context', {})
        
        flow_result = {
            'success': False,
            'stages': {},
            'final_audio': None,
            'conversation_log': []
        }
        
        try:
            # Stage 1: Speech to Text
            stt_result = await self.process_voice_question({
                'audio_file_path': audio_file_path,
                'user_language': user_language,
                'context': context
            })
            
            flow_result['stages']['speech_to_text'] = stt_result
            
            if not stt_result['success']:
                return flow_result
            
            question_text = stt_result['question_text']
            detected_language = stt_result['detected_language']
            
            # Log the conversation
            flow_result['conversation_log'].append({
                'type': 'user_speech',
                'text': question_text,
                'language': detected_language,
                'timestamp': asyncio.get_event_loop().time()
            })
            
            # Stage 2: Process the question (this would typically involve other agents)
            # For now, we'll create a simple response
            response_text = await self.generate_simple_response(question_text, detected_language)
            
            flow_result['stages']['text_processing'] = {
                'success': True,
                'response_text': response_text,
                'language': detected_language
            }
            
            # Stage 3: Text to Speech for response
            tts_result = await self.generate_audio_response({
                'response_text': response_text,
                'language': detected_language,
                'premium': context.get('premium_voice', False)
            })
            
            flow_result['stages']['text_to_speech'] = tts_result
            
            if tts_result['success']:
                flow_result['final_audio'] = tts_result['audio_file']
                flow_result['success'] = True
                
                # Log the response
                flow_result['conversation_log'].append({
                    'type': 'system_response',
                    'text': response_text,
                    'language': detected_language,
                    'audio_file': tts_result['audio_file'],
                    'timestamp': asyncio.get_event_loop().time()
                })
            
            return flow_result
            
        except Exception as e:
            logger.error(f"Voice interaction flow failed: {e}")
            flow_result['error'] = str(e)
            return flow_result
    
    async def generate_simple_response(self, question: str, language: str) -> str:
        """Generate a simple response to a question (placeholder for more sophisticated processing)"""
        try:
            # Language-specific responses
            responses = {
                'en': {
                    'greeting': "Hello! I'm here to help you with your learning.",
                    'learning': "That's a great question about learning. Let me help you understand this better.",
                    'quiz': "I can help you test your knowledge with some questions.",
                    'default': "Thank you for your question. I'm processing your learning request."
                },
                'hi': {
                    'greeting': "नमस्ते! मैं आपकी सीखने में मदद करने के लिए यहाँ हूँ।",
                    'learning': "यह सीखने के बारे में एक बेहतरीन सवाल है। मैं आपको इसे बेहतर समझने में मदद करूंगा।",
                    'quiz': "मैं कुछ सवालों के साथ आपके ज्ञान का परीक्षण करने में आपकी मदद कर सकता हूँ।",
                    'default': "आपके सवाल के लिए धन्यवाद। मैं आपकी सीखने की अनुरोध को प्रोसेस कर रहा हूँ।"
                },
                'te': {
                    'greeting': "నమస్కారం! నేను మీ అభ్యాసంలో సహాయం చేయడానికి ఇక్కడ ఉన్నాను।",
                    'learning': "ఇది అభ్యాసం గురించి అద్భుతమైన ప్రశ్న. నేను దీన్ని బాగా అర్థం చేసుకోవడంలో మీకు సహాయం చేస్తాను।",
                    'quiz': "నేను కొన్ని ప్రశ్నలతో మీ జ్ఞానాన్ని పరీక్షించడంలో మీకు సహాయం చేయగలను।",
                    'default': "మీ ప్రశ్నకు ధన్యవాదాలు. నేను మీ అభ్యాస అభ్యర్థనను ప్రాసెస్ చేస్తున్నాను।"
                }
            }
            
            lang_responses = responses.get(language, responses['en'])
            
            # Simple keyword matching for response selection
            question_lower = question.lower()
            
            if any(word in question_lower for word in ['hello', 'hi', 'नमस्ते', 'నమస్కారం']):
                return lang_responses['greeting']
            elif any(word in question_lower for word in ['learn', 'study', 'सीख', 'అభ్యాసం']):
                return lang_responses['learning']
            elif any(word in question_lower for word in ['quiz', 'test', 'प्रश्न', 'ప్రశ్న']):
                return lang_responses['quiz']
            else:
                return lang_responses['default']
                
        except Exception as e:
            logger.error(f"Simple response generation failed: {e}")
            return "I'm here to help you learn better."
    
    async def cleanup_audio_files(self, max_age_hours: int = 24):
        """Clean up old audio files"""
        try:
            speech_service.cleanup_temp_files(max_age_hours)
            return {'success': True, 'message': 'Audio files cleaned up'}
        except Exception as e:
            logger.error(f"Audio cleanup failed: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_voice_capabilities(self) -> Dict[str, Any]:
        """Get current voice processing capabilities"""
        return {
            'speech_to_text': self.service_status['whisper_available'],
            'text_to_speech_basic': self.service_status['gtts_available'],
            'text_to_speech_premium': self.service_status['elevenlabs_available'],
            'audio_processing': self.service_status['pydub_available'],
            'supported_languages': ['en', 'hi', 'te', 'ta', 'bn', 'kn'],
            'max_audio_duration': 300,  # 5 minutes
            'supported_formats': ['mp3', 'wav', 'ogg']
        }
    
    async def validate_audio_input(self, audio_file_path: str) -> Dict[str, Any]:
        """Validate audio input file"""
        try:
            from pathlib import Path
            import os
            
            file_path = Path(audio_file_path)
            
            if not file_path.exists():
                return {'valid': False, 'error': 'Audio file not found'}
            
            file_size = os.path.getsize(file_path)
            max_size = 50 * 1024 * 1024  # 50MB
            
            if file_size > max_size:
                return {'valid': False, 'error': 'Audio file too large'}
            
            # Check file extension
            allowed_extensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac']
            if file_path.suffix.lower() not in allowed_extensions:
                return {'valid': False, 'error': 'Unsupported audio format'}
            
            return {
                'valid': True,
                'file_size': file_size,
                'format': file_path.suffix.lower(),
                'duration_estimate': file_size / (128 * 1024 / 8)  # Rough estimate for 128kbps
            }
            
        except Exception as e:
            logger.error(f"Audio validation failed: {e}")
            return {'valid': False, 'error': str(e)}
