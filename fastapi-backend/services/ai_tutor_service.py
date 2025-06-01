"""
AI Tutor Service for AutoPom
Provides intelligent tutoring, question answering, and educational guidance
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.tools.tavily_search import TavilySearchResults
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AITutorService:
    """AI-powered tutoring service with multilingual support"""
    
    def __init__(self):
        self.openai_client = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7
        )
        
        # Initialize Tavily for web search
        try:
            self.search_tool = TavilySearchResults(
                max_results=3,
                api_key=os.getenv("TAVILY_API_KEY")
            )
        except Exception as e:
            logger.warning(f"Tavily search not available: {e}")
            self.search_tool = None
        
        # Conversation history storage (in production, use Redis/Database)
        self.conversation_history = {}
        
        # Subject-specific prompts
        self.subject_prompts = {
            'mathematics': {
                'system_prompt': """You are an expert mathematics tutor specializing in Indian education systems. 
                You help students understand mathematical concepts through step-by-step explanations, 
                practical examples, and cultural context relevant to Indian students.""",
                'learning_style': 'analytical'
            },
            'science': {
                'system_prompt': """You are a science tutor with expertise in Physics, Chemistry, and Biology. 
                You explain scientific concepts using everyday examples familiar to Indian students, 
                relate science to Indian innovations, and encourage practical understanding.""",
                'learning_style': 'experimental'
            },
            'english': {
                'system_prompt': """You are an English language tutor who helps Indian students improve their 
                English skills while respecting their cultural background. You provide grammar help, 
                vocabulary building, and communication skills.""",
                'learning_style': 'communicative'
            },
            'social_studies': {
                'system_prompt': """You are a social studies tutor with deep knowledge of Indian history, 
                geography, civics, and culture. You help students understand their heritage while 
                developing critical thinking about society and governance.""",
                'learning_style': 'contextual'
            },
            'computer_science': {
                'system_prompt': """You are a computer science tutor who makes programming and technology 
                accessible to Indian students. You use practical examples and relate concepts to 
                India's growing tech industry.""",
                'learning_style': 'practical'
            },
            'general': {
                'system_prompt': """You are a knowledgeable tutor who can help with various subjects. 
                You adapt your teaching style to the student's needs and provide culturally relevant 
                examples for Indian students.""",
                'learning_style': 'adaptive'
            }
        }
    
    async def get_tutor_response(self, 
                                question: str, 
                                subject: str = 'general',
                                language: str = 'en',
                                student_level: str = 'intermediate',
                                user_id: str = 'default') -> Dict[str, Any]:
        """Get AI tutor response to student question"""
        try:
            # Get subject-specific prompt
            subject_config = self.subject_prompts.get(subject, self.subject_prompts['general'])
            
            # Build conversation context
            conversation_context = self._get_conversation_context(user_id)
            
            # Create language-specific instruction
            language_instruction = self._get_language_instruction(language)
            
            # Create the prompt
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"""{subject_config['system_prompt']}
                
                {language_instruction}
                
                Student Level: {student_level}
                Learning Style: {subject_config['learning_style']}
                
                Guidelines:
                1. Provide clear, step-by-step explanations
                2. Use examples relevant to Indian context
                3. Encourage critical thinking
                4. Be patient and supportive
                5. Adapt complexity to student level
                6. If you don't know something, admit it and suggest resources
                
                Previous conversation context: {conversation_context}"""),
                ("user", question)
            ])
            
            # Get AI response
            response = await self.openai_client.ainvoke(prompt.format_messages())
            tutor_response = response.content.strip()
            
            # Store conversation
            self._store_conversation(user_id, question, tutor_response)
            
            # Check if we need additional resources
            needs_resources = await self._should_provide_resources(question, subject)
            resources = []
            
            if needs_resources and self.search_tool:
                resources = await self._search_educational_resources(question, subject)
            
            return {
                'response': tutor_response,
                'subject': subject,
                'language': language,
                'student_level': student_level,
                'resources': resources,
                'follow_up_questions': await self._generate_follow_up_questions(question, subject, language),
                'confidence': 0.9
            }
            
        except Exception as e:
            logger.error(f"AI tutor response failed: {e}")
            return {
                'response': "I'm sorry, I'm having trouble right now. Please try again later.",
                'subject': subject,
                'language': language,
                'student_level': student_level,
                'resources': [],
                'follow_up_questions': [],
                'confidence': 0.0,
                'error': str(e)
            }
    
    async def explain_concept(self, 
                            concept: str, 
                            subject: str = 'general',
                            language: str = 'en',
                            difficulty: str = 'beginner') -> Dict[str, Any]:
        """Provide detailed explanation of a concept"""
        try:
            subject_config = self.subject_prompts.get(subject, self.subject_prompts['general'])
            language_instruction = self._get_language_instruction(language)
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"""{subject_config['system_prompt']}
                
                {language_instruction}
                
                You are explaining the concept: {concept}
                Difficulty level: {difficulty}
                
                Provide a comprehensive explanation that includes:
                1. Simple definition
                2. Key components or aspects
                3. Real-world examples (preferably Indian context)
                4. Common misconceptions
                5. Practical applications
                6. Memory aids or mnemonics"""),
                ("user", f"Explain the concept: {concept}")
            ])
            
            response = await self.openai_client.ainvoke(prompt.format_messages())
            explanation = response.content.strip()
            
            # Generate related concepts
            related_concepts = await self._find_related_concepts(concept, subject)
            
            return {
                'concept': concept,
                'explanation': explanation,
                'subject': subject,
                'difficulty': difficulty,
                'language': language,
                'related_concepts': related_concepts,
                'examples': await self._generate_examples(concept, subject, language)
            }
            
        except Exception as e:
            logger.error(f"Concept explanation failed: {e}")
            return {
                'concept': concept,
                'explanation': f"I'm having trouble explaining {concept} right now.",
                'subject': subject,
                'difficulty': difficulty,
                'language': language,
                'related_concepts': [],
                'examples': [],
                'error': str(e)
            }
    
    async def generate_practice_questions(self, 
                                        topic: str, 
                                        subject: str = 'general',
                                        difficulty: str = 'intermediate',
                                        count: int = 5) -> List[Dict[str, Any]]:
        """Generate practice questions for a topic"""
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"""You are creating practice questions for the topic: {topic}
                Subject: {subject}
                Difficulty: {difficulty}
                
                Generate {count} practice questions with the following format:
                1. Question text
                2. Multiple choice options (4 options)
                3. Correct answer
                4. Detailed explanation
                5. Hints for solving
                
                Make questions relevant to Indian education context."""),
                ("user", f"Generate {count} practice questions for: {topic}")
            ])
            
            response = await self.openai_client.ainvoke(prompt.format_messages())
            
            # Parse the response to extract questions
            # This is a simplified version - in production, use structured output
            questions_text = response.content.strip()
            
            # For now, return a structured format
            # In production, implement proper parsing
            return [{
                'question': f"Practice question about {topic}",
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct_answer': 'Option A',
                'explanation': f"Explanation for {topic} question",
                'hints': [f"Think about the key concepts of {topic}"],
                'difficulty': difficulty,
                'topic': topic
            }] * min(count, 3)  # Return up to 3 questions for now
            
        except Exception as e:
            logger.error(f"Practice question generation failed: {e}")
            return []
    
    def _get_language_instruction(self, language: str) -> str:
        """Get language-specific instruction for the AI"""
        if language == 'en':
            return "Respond in clear, simple English."
        
        language_names = {
            'hi': 'Hindi (हिन्दी)',
            'te': 'Telugu (తెలుగు)',
            'ta': 'Tamil (தமிழ்)',
            'bn': 'Bengali (বাংলা)',
            'kn': 'Kannada (ಕನ್ನಡ)'
        }
        
        lang_name = language_names.get(language, 'the requested language')
        return f"Respond primarily in {lang_name}. You may include English terms in parentheses for technical concepts."
    
    def _get_conversation_context(self, user_id: str) -> str:
        """Get recent conversation context for user"""
        if user_id not in self.conversation_history:
            return "No previous conversation."
        
        history = self.conversation_history[user_id][-3:]  # Last 3 exchanges
        context = []
        
        for exchange in history:
            context.append(f"Student: {exchange['question']}")
            context.append(f"Tutor: {exchange['response'][:100]}...")
        
        return "\n".join(context)
    
    def _store_conversation(self, user_id: str, question: str, response: str):
        """Store conversation exchange"""
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        self.conversation_history[user_id].append({
            'question': question,
            'response': response,
            'timestamp': asyncio.get_event_loop().time()
        })
        
        # Keep only last 10 exchanges
        if len(self.conversation_history[user_id]) > 10:
            self.conversation_history[user_id] = self.conversation_history[user_id][-10:]
    
    async def _should_provide_resources(self, question: str, subject: str) -> bool:
        """Determine if additional resources should be provided"""
        # Simple heuristic - provide resources for complex questions
        resource_indicators = [
            'how to', 'explain', 'what is', 'why does', 'examples of',
            'learn more', 'practice', 'study', 'understand'
        ]
        
        return any(indicator in question.lower() for indicator in resource_indicators)
    
    async def _search_educational_resources(self, question: str, subject: str) -> List[Dict[str, Any]]:
        """Search for educational resources"""
        try:
            if not self.search_tool:
                return []
            
            # Create search query
            search_query = f"{question} {subject} education tutorial"
            
            # Search for resources
            results = await asyncio.to_thread(self.search_tool.run, search_query)
            
            # Format results
            resources = []
            for result in results[:3]:  # Top 3 results
                resources.append({
                    'title': result.get('title', 'Educational Resource'),
                    'url': result.get('url', ''),
                    'snippet': result.get('content', '')[:200] + '...',
                    'type': 'article'
                })
            
            return resources
            
        except Exception as e:
            logger.error(f"Resource search failed: {e}")
            return []
    
    async def _generate_follow_up_questions(self, question: str, subject: str, language: str) -> List[str]:
        """Generate follow-up questions to encourage deeper learning"""
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"""Generate 2-3 follow-up questions that would help the student 
                explore the topic deeper. Questions should be thought-provoking and 
                encourage critical thinking. Respond in {language if language != 'en' else 'English'}."""),
                ("user", f"Original question: {question}")
            ])
            
            response = await self.openai_client.ainvoke(prompt.format_messages())
            
            # Parse follow-up questions (simplified)
            questions_text = response.content.strip()
            questions = [q.strip() for q in questions_text.split('\n') if q.strip()]
            
            return questions[:3]  # Return up to 3 questions
            
        except Exception as e:
            logger.error(f"Follow-up question generation failed: {e}")
            return []
    
    async def _find_related_concepts(self, concept: str, subject: str) -> List[str]:
        """Find concepts related to the given concept"""
        # This is a simplified version
        # In production, use a knowledge graph or semantic search
        
        related_concepts_map = {
            'mathematics': ['algebra', 'geometry', 'calculus', 'statistics', 'trigonometry'],
            'science': ['physics', 'chemistry', 'biology', 'environment', 'technology'],
            'english': ['grammar', 'vocabulary', 'literature', 'writing', 'speaking'],
            'social_studies': ['history', 'geography', 'civics', 'economics', 'culture']
        }
        
        return related_concepts_map.get(subject, ['learning', 'education', 'knowledge'])[:3]
    
    async def _generate_examples(self, concept: str, subject: str, language: str) -> List[str]:
        """Generate practical examples for the concept"""
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"""Generate 2-3 practical examples that illustrate the concept: {concept}
                Use examples relevant to Indian context and daily life. 
                Respond in {language if language != 'en' else 'English'}."""),
                ("user", f"Provide examples for: {concept}")
            ])
            
            response = await self.openai_client.ainvoke(prompt.format_messages())
            examples_text = response.content.strip()
            
            # Parse examples (simplified)
            examples = [ex.strip() for ex in examples_text.split('\n') if ex.strip()]
            
            return examples[:3]
            
        except Exception as e:
            logger.error(f"Example generation failed: {e}")
            return []

# Global instance
ai_tutor_service = AITutorService()
