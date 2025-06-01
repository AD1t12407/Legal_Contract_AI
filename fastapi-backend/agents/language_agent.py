"""
Language Selector Agent
Handles multilingual translation and language-specific content adaptation
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent
from ..services.language_service import language_service

logger = logging.getLogger(__name__)

class LanguageSelectorAgent(BaseAgent):
    """Agent responsible for language detection, translation, and localization"""
    
    def __init__(self):
        super().__init__(
            name="LanguageSelectorAgent",
            description="Handles multilingual translation and language-specific content adaptation for Indian vernacular languages"
        )
        self.supported_languages = language_service.get_supported_languages()
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process language-related tasks"""
        task_type = input_data.get('task_type')
        
        if task_type == 'detect_language':
            return await self.detect_language(input_data)
        elif task_type == 'translate_content':
            return await self.translate_content(input_data)
        elif task_type == 'localize_learning':
            return await self.localize_learning(input_data)
        elif task_type == 'translate_quiz':
            return await self.translate_quiz(input_data)
        elif task_type == 'translate_resources':
            return await self.translate_resources(input_data)
        elif task_type == 'create_multilingual_prompt':
            return await self.create_multilingual_prompt(input_data)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def detect_language(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect the language of input text"""
        text = input_data.get('text', '')
        
        if not text:
            return {'language': 'en', 'confidence': 0.0}
        
        detected_lang = await language_service.detect_language(text)
        
        return {
            'language': detected_lang,
            'language_name': language_service.get_language_name(detected_lang),
            'supported': detected_lang in self.supported_languages,
            'confidence': 1.0  # Simplified confidence score
        }
    
    async def translate_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Translate text content to target language"""
        text = input_data.get('text', '')
        target_lang = input_data.get('target_language', 'en')
        source_lang = input_data.get('source_language', 'auto')
        
        if not text:
            return {'translated_text': '', 'source_language': 'en', 'target_language': target_lang}
        
        translated_text = await language_service.translate_text(text, target_lang, source_lang)
        
        return {
            'translated_text': translated_text,
            'source_language': source_lang,
            'target_language': target_lang,
            'original_text': text
        }
    
    async def localize_learning(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Localize learning content for specific language and culture"""
        content = input_data.get('content', '')
        target_lang = input_data.get('target_language', 'en')
        user_role = input_data.get('role', 'student')
        
        # Translate the main content
        localized_content = await language_service.translate_learning_content(content, target_lang)
        
        # Add cultural context and role-specific adaptations
        cultural_adaptations = await self.add_cultural_context(content, target_lang, user_role)
        
        return {
            'localized_content': localized_content,
            'cultural_adaptations': cultural_adaptations,
            'target_language': target_lang,
            'role': user_role
        }
    
    async def translate_quiz(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Translate quiz questions and options"""
        quiz_data = input_data.get('quiz', [])
        target_lang = input_data.get('target_language', 'en')
        
        if not quiz_data:
            return {'translated_quiz': []}
        
        translated_quiz = await language_service.translate_quiz(quiz_data, target_lang)
        
        return {
            'translated_quiz': translated_quiz,
            'target_language': target_lang,
            'question_count': len(translated_quiz)
        }
    
    async def translate_resources(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Translate resource titles and descriptions"""
        resources = input_data.get('resources', [])
        target_lang = input_data.get('target_language', 'en')
        
        if not resources:
            return {'translated_resources': []}
        
        translated_resources = await language_service.translate_resources(resources, target_lang)
        
        return {
            'translated_resources': translated_resources,
            'target_language': target_lang,
            'resource_count': len(translated_resources)
        }
    
    async def create_multilingual_prompt(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a multilingual prompt for GPT-4o"""
        base_prompt = input_data.get('prompt', '')
        target_lang = input_data.get('target_language', 'en')
        context = input_data.get('context', '')
        
        multilingual_prompt = await language_service.create_multilingual_prompt(
            base_prompt, target_lang, context
        )
        
        return {
            'multilingual_prompt': multilingual_prompt,
            'target_language': target_lang,
            'original_prompt': base_prompt
        }
    
    async def add_cultural_context(self, content: str, target_lang: str, role: str) -> Dict[str, Any]:
        """Add cultural context and role-specific adaptations"""
        try:
            # Cultural adaptations for different Indian languages/regions
            cultural_contexts = {
                'hi': {
                    'greeting': 'नमस्ते',
                    'encouragement': 'बहुत अच्छा!',
                    'learning_style': 'व्यावहारिक उदाहरणों के साथ',
                    'cultural_references': ['गुरु-शिष्य परंपरा', 'श्लोक और कहावतें']
                },
                'te': {
                    'greeting': 'నమస్కారం',
                    'encouragement': 'చాలా బాగుంది!',
                    'learning_style': 'ఆచరణాత్మక ఉదాహరణలతో',
                    'cultural_references': ['గురు-శిష్య సంప్రదాయం', 'సుభాషితాలు']
                },
                'ta': {
                    'greeting': 'வணக்கம்',
                    'encouragement': 'மிகவும் நல்லது!',
                    'learning_style': 'நடைமுறை உदாहரணங்களுடன்',
                    'cultural_references': ['குரு-சிஷ்ய பரம்பரை', 'திருக்குறள் வரிகள்']
                },
                'bn': {
                    'greeting': 'নমস্কার',
                    'encouragement': 'খুবই ভালো!',
                    'learning_style': 'ব্যবহারিক উদাহরণ সহ',
                    'cultural_references': ['গুরু-শিষ্য ঐতিহ্য', 'রবীন্দ্রনাথের বাণী']
                },
                'kn': {
                    'greeting': 'ನಮಸ್ಕಾರ',
                    'encouragement': 'ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ!',
                    'learning_style': 'ಪ್ರಾಯೋಗಿಕ ಉದಾಹರಣೆಗಳೊಂದಿಗೆ',
                    'cultural_references': ['ಗುರು-ಶಿಷ್ಯ ಸಂಪ್ರದಾಯ', 'ವಚನಗಳು']
                }
            }
            
            # Role-specific adaptations
            role_adaptations = {
                'student': {
                    'tone': 'encouraging and supportive',
                    'complexity': 'simplified explanations',
                    'examples': 'relatable to daily life'
                },
                'researcher': {
                    'tone': 'academic and detailed',
                    'complexity': 'comprehensive analysis',
                    'examples': 'research-oriented'
                },
                'professional': {
                    'tone': 'practical and actionable',
                    'complexity': 'industry-focused',
                    'examples': 'workplace scenarios'
                }
            }
            
            cultural_context = cultural_contexts.get(target_lang, cultural_contexts['en'])
            role_context = role_adaptations.get(role, role_adaptations['student'])
            
            return {
                'cultural_context': cultural_context,
                'role_context': role_context,
                'recommendations': [
                    f"Use {cultural_context['greeting']} for greetings",
                    f"Incorporate {cultural_context['learning_style']} approach",
                    f"Apply {role_context['tone']} tone",
                    f"Provide {role_context['complexity']} level content"
                ]
            }
            
        except Exception as e:
            logger.error(f"Cultural context generation failed: {e}")
            return {
                'cultural_context': {},
                'role_context': {},
                'recommendations': []
            }
    
    async def get_language_preferences(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get language preferences for a user"""
        # This could be enhanced to store and retrieve user preferences
        default_preferences = {
            'primary_language': 'en',
            'secondary_languages': ['hi'],
            'learning_style': 'visual',
            'cultural_context': True,
            'voice_enabled': True
        }
        
        return default_preferences
    
    async def validate_translation_quality(self, original: str, translated: str, target_lang: str) -> Dict[str, Any]:
        """Validate translation quality (simplified implementation)"""
        try:
            # Basic validation checks
            quality_score = 1.0
            issues = []
            
            # Check if translation is not empty
            if not translated or translated.strip() == '':
                quality_score = 0.0
                issues.append("Empty translation")
            
            # Check if translation is same as original (might indicate translation failure)
            elif original.strip() == translated.strip() and target_lang != 'en':
                quality_score = 0.5
                issues.append("Translation appears unchanged")
            
            # Check length ratio (very short or very long translations might be problematic)
            elif len(translated) < len(original) * 0.3:
                quality_score = 0.7
                issues.append("Translation significantly shorter than original")
            
            elif len(translated) > len(original) * 3:
                quality_score = 0.7
                issues.append("Translation significantly longer than original")
            
            return {
                'quality_score': quality_score,
                'issues': issues,
                'validated': quality_score >= 0.7
            }
            
        except Exception as e:
            logger.error(f"Translation validation failed: {e}")
            return {
                'quality_score': 0.5,
                'issues': [f"Validation error: {str(e)}"],
                'validated': False
            }
