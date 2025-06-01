"""
Language Service for Multilingual Support
Handles translation between English and Indian vernacular languages
"""

import asyncio
from typing import Dict, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LanguageService:
    """Service for handling multilingual translation and language detection"""
    
    # Supported Indian languages
    SUPPORTED_LANGUAGES = {
        'hi': 'Hindi',
        'te': 'Telugu', 
        'ta': 'Tamil',
        'bn': 'Bengali',
        'kn': 'Kannada',
        'en': 'English'
    }
    
    # Language-specific learning prompts
    LEARNING_PROMPTS = {
        'hi': {
            'question_prompt': "आपने क्या सीखा?",
            'quiz_intro': "आइए आपकी समझ का परीक्षण करते हैं:",
            'resource_intro': "यहाँ कुछ उपयोगी संसाधन हैं:",
            'explanation': "व्याख्या:"
        },
        'te': {
            'question_prompt': "మీరు ఏమి నేర్చుకున్నారు?",
            'quiz_intro': "మీ అవగాహనను పరీక్షిద్దాం:",
            'resource_intro': "ఇక్కడ కొన్ని ఉపయోగకరమైన వనరులు ఉన్నాయి:",
            'explanation': "వివరణ:"
        },
        'ta': {
            'question_prompt': "நீங்கள் என்ன கற்றுக்கொண்டீர்கள்?",
            'quiz_intro': "உங்கள் புரிதலை சோதிக்கலாம்:",
            'resource_intro': "இங்கே சில பயனுள்ள வளங்கள் உள்ளன:",
            'explanation': "விளக்கம்:"
        },
        'bn': {
            'question_prompt': "আপনি কী শিখেছেন?",
            'quiz_intro': "আসুন আপনার বোঝাপড়া পরীক্ষা করি:",
            'resource_intro': "এখানে কিছু দরকারী সম্পদ রয়েছে:",
            'explanation': "ব্যাখ্যা:"
        },
        'kn': {
            'question_prompt': "ನೀವು ಏನು ಕಲಿತಿದ್ದೀರಿ?",
            'quiz_intro': "ನಿಮ್ಮ ತಿಳುವಳಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸೋಣ:",
            'resource_intro': "ಇಲ್ಲಿ ಕೆಲವು ಉಪಯೋಗಕರ ಸಂಪನ್ಮೂಲಗಳಿವೆ:",
            'explanation': "ವಿವರಣೆ:"
        },
        'en': {
            'question_prompt': "What did you learn?",
            'quiz_intro': "Let's test your understanding:",
            'resource_intro': "Here are some useful resources:",
            'explanation': "Explanation:"
        }
    }
    
    def __init__(self):
        self.translator = Translator()
        self.cache = {}  # Simple in-memory cache for translations
        
    async def detect_language(self, text: str) -> str:
        """Detect the language of input text"""
        try:
            detected = detect(text)
            if detected in self.SUPPORTED_LANGUAGES:
                return detected
            return 'en'  # Default to English
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return 'en'
    
    async def translate_text(self, text: str, target_lang: str, source_lang: str = 'auto') -> str:
        """Translate text to target language"""
        try:
            # Check cache first
            cache_key = f"{text}_{source_lang}_{target_lang}"
            if cache_key in self.cache:
                return self.cache[cache_key]
            
            # Skip translation if source and target are the same
            if source_lang == target_lang:
                return text
                
            # Perform translation
            result = await asyncio.to_thread(
                self.translator.translate,
                text,
                dest=target_lang,
                src=source_lang
            )
            
            translated_text = result.text
            
            # Cache the result
            self.cache[cache_key] = translated_text
            
            return translated_text
            
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            return text  # Return original text if translation fails
    
    async def translate_learning_content(self, content: str, target_lang: str) -> Dict:
        """Translate learning content and return structured response"""
        try:
            if target_lang == 'en':
                return {
                    'content': content,
                    'language': 'en',
                    'prompts': self.LEARNING_PROMPTS['en']
                }
            
            # Translate the main content
            translated_content = await self.translate_text(content, target_lang, 'en')
            
            return {
                'content': translated_content,
                'language': target_lang,
                'prompts': self.LEARNING_PROMPTS.get(target_lang, self.LEARNING_PROMPTS['en'])
            }
            
        except Exception as e:
            logger.error(f"Learning content translation failed: {e}")
            return {
                'content': content,
                'language': 'en',
                'prompts': self.LEARNING_PROMPTS['en']
            }
    
    async def translate_quiz(self, quiz_data: List[Dict], target_lang: str) -> List[Dict]:
        """Translate quiz questions and options to target language"""
        try:
            if target_lang == 'en':
                return quiz_data
                
            translated_quiz = []
            
            for question_data in quiz_data:
                translated_question = {
                    'question': await self.translate_text(question_data['question'], target_lang),
                    'options': [],
                    'answer': await self.translate_text(question_data['answer'], target_lang),
                    'explanation': await self.translate_text(question_data.get('explanation', ''), target_lang)
                }
                
                # Translate options
                for option in question_data.get('options', []):
                    translated_option = await self.translate_text(option, target_lang)
                    translated_question['options'].append(translated_option)
                
                translated_quiz.append(translated_question)
            
            return translated_quiz
            
        except Exception as e:
            logger.error(f"Quiz translation failed: {e}")
            return quiz_data
    
    async def translate_resources(self, resources: List[Dict], target_lang: str) -> List[Dict]:
        """Translate resource titles and descriptions to target language"""
        try:
            if target_lang == 'en':
                return resources
                
            translated_resources = []
            
            for resource in resources:
                translated_resource = {
                    'title': await self.translate_text(resource['title'], target_lang),
                    'url': resource['url'],  # URLs don't need translation
                    'type': resource['type'],
                    'snippet': await self.translate_text(resource.get('snippet', ''), target_lang)
                }
                translated_resources.append(translated_resource)
            
            return translated_resources
            
        except Exception as e:
            logger.error(f"Resource translation failed: {e}")
            return resources
    
    def get_language_name(self, lang_code: str) -> str:
        """Get human-readable language name"""
        return self.SUPPORTED_LANGUAGES.get(lang_code, 'English')
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get all supported languages"""
        return self.SUPPORTED_LANGUAGES.copy()
    
    async def create_multilingual_prompt(self, base_prompt: str, target_lang: str, context: str = "") -> str:
        """Create a multilingual prompt for GPT-4o"""
        try:
            if target_lang == 'en':
                return base_prompt
            
            # Create a prompt that instructs GPT-4o to respond in the target language
            lang_name = self.get_language_name(target_lang)
            
            multilingual_prompt = f"""
            Please respond in {lang_name} language. 
            
            Original request: {base_prompt}
            
            Context: {context}
            
            Important: Your entire response should be in {lang_name}, including explanations, questions, and any educational content.
            """
            
            return multilingual_prompt
            
        except Exception as e:
            logger.error(f"Multilingual prompt creation failed: {e}")
            return base_prompt

# Global instance
language_service = LanguageService()
