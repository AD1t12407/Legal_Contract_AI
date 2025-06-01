"""
Offline Service for Low-Connectivity Support
Handles offline learning, local LLM processing, and sync operations
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
import sqlite3
from datetime import datetime, timedelta

# Offline LLM imports
try:
    import onnxruntime as ort
    from optimum.onnxruntime import ORTModelForCausalLM
    from transformers import AutoTokenizer
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    logging.warning("ONNX Runtime not available - offline LLM disabled")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OfflineService:
    """Service for handling offline learning and local processing"""
    
    def __init__(self):
        self.offline_db_path = Path("offline_data.db")
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        
        # Local model configuration
        self.local_model = None
        self.local_tokenizer = None
        
        # Initialize offline database
        self.init_offline_db()
        
        # Load local model if available
        if ONNX_AVAILABLE:
            asyncio.create_task(self.load_local_model())
    
    def init_offline_db(self):
        """Initialize SQLite database for offline storage"""
        try:
            conn = sqlite3.connect(self.offline_db_path)
            cursor = conn.cursor()
            
            # Create tables for offline data
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS offline_sessions (
                    id TEXT PRIMARY KEY,
                    start_time TEXT,
                    end_time TEXT,
                    duration INTEGER,
                    events TEXT,
                    synced BOOLEAN DEFAULT FALSE,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS offline_learnings (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    content TEXT,
                    language TEXT DEFAULT 'en',
                    role TEXT DEFAULT 'student',
                    resources TEXT,
                    quiz TEXT,
                    processed BOOLEAN DEFAULT FALSE,
                    synced BOOLEAN DEFAULT FALSE,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS offline_cache (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    expires_at TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Offline database initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize offline database: {e}")
    
    async def load_local_model(self):
        """Load local ONNX model for offline processing"""
        try:
            if not ONNX_AVAILABLE:
                return
            
            # Try to load a lightweight model like DistilBERT or TinyBERT
            model_name = "distilbert-base-uncased"
            model_path = self.models_dir / model_name
            
            if not model_path.exists():
                logger.info(f"Local model not found at {model_path}")
                return
            
            # Load tokenizer and model
            self.local_tokenizer = AutoTokenizer.from_pretrained(str(model_path))
            self.local_model = ORTModelForCausalLM.from_pretrained(str(model_path))
            
            logger.info("Local ONNX model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load local model: {e}")
            self.local_model = None
            self.local_tokenizer = None
    
    async def store_offline_session(self, session_data: Dict) -> bool:
        """Store session data for offline use"""
        try:
            conn = sqlite3.connect(self.offline_db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO offline_sessions 
                (id, start_time, end_time, duration, events, synced)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                session_data['id'],
                session_data.get('start_time'),
                session_data.get('end_time'),
                session_data.get('duration'),
                json.dumps(session_data.get('events', [])),
                False
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to store offline session: {e}")
            return False
    
    async def store_offline_learning(self, learning_data: Dict) -> bool:
        """Store learning data for offline processing"""
        try:
            conn = sqlite3.connect(self.offline_db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO offline_learnings 
                (id, session_id, content, language, role, resources, quiz, processed, synced)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                learning_data['id'],
                learning_data['session_id'],
                learning_data['content'],
                learning_data.get('language', 'en'),
                learning_data.get('role', 'student'),
                json.dumps(learning_data.get('resources', [])),
                json.dumps(learning_data.get('quiz', [])),
                learning_data.get('processed', False),
                False
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to store offline learning: {e}")
            return False
    
    async def generate_offline_quiz(self, content: str, language: str = 'en') -> List[Dict]:
        """Generate quiz questions using local processing"""
        try:
            # If local model is available, use it
            if self.local_model and self.local_tokenizer:
                return await self.generate_quiz_with_local_model(content, language)
            
            # Fallback to rule-based quiz generation
            return self.generate_fallback_quiz(content, language)
            
        except Exception as e:
            logger.error(f"Offline quiz generation failed: {e}")
            return self.generate_fallback_quiz(content, language)
    
    async def generate_quiz_with_local_model(self, content: str, language: str) -> List[Dict]:
        """Generate quiz using local ONNX model"""
        try:
            # This is a simplified implementation
            # In practice, you'd need a model specifically trained for quiz generation
            
            # For now, use the fallback method
            return self.generate_fallback_quiz(content, language)
            
        except Exception as e:
            logger.error(f"Local model quiz generation failed: {e}")
            return self.generate_fallback_quiz(content, language)
    
    def generate_fallback_quiz(self, content: str, language: str = 'en') -> List[Dict]:
        """Generate basic quiz questions using rule-based approach"""
        try:
            words = content.split()
            sentences = content.split('.')
            
            # Extract key terms (words longer than 4 characters)
            key_terms = []
            for word in words:
                clean_word = word.strip(",.?!\"'()[]{}").lower()
                if len(clean_word) > 4 and clean_word not in ['should', 'would', 'could', 'about', 'there', 'their', 'these', 'those', 'which', 'where', 'while']:
                    key_terms.append(clean_word)
            
            # Remove duplicates and take first 3
            unique_terms = list(set(key_terms))[:3]
            
            # Language-specific question templates
            templates = {
                'en': {
                    'question': "What is the significance of '{term}' in this content?",
                    'options': [
                        "It's a fundamental concept mentioned in the content",
                        "It represents a key challenge in this domain", 
                        "It's an important principle to understand",
                        "It's not particularly relevant to the main topic"
                    ],
                    'explanation': "The term '{term}' is mentioned in the learning content and represents an important concept."
                },
                'hi': {
                    'question': "इस सामग्री में '{term}' का क्या महत्व है?",
                    'options': [
                        "यह सामग्री में उल्लिखित एक मौलिक अवधारणा है",
                        "यह इस क्षेत्र में एक मुख्य चुनौती का प्रतिनिधित्व करता है",
                        "यह समझने के लिए एक महत्वपूर्ण सिद्धांत है",
                        "यह मुख्य विषय के लिए विशेष रूप से प्रासंगिक नहीं है"
                    ],
                    'explanation': "शब्द '{term}' सीखने की सामग्री में उल्लिखित है और एक महत्वपूर्ण अवधारणा का प्रतिनिधित्व करता है।"
                }
            }
            
            template = templates.get(language, templates['en'])
            quiz = []
            
            for i, term in enumerate(unique_terms):
                if i >= 3:  # Limit to 3 questions
                    break
                    
                question = {
                    'question': template['question'].format(term=term),
                    'options': template['options'].copy(),
                    'answer': template['options'][0],  # First option is always correct
                    'explanation': template['explanation'].format(term=term)
                }
                quiz.append(question)
            
            # If no terms found, create a generic question
            if not quiz:
                quiz.append({
                    'question': "What is a key takeaway from this learning content?" if language == 'en' else "इस सीखने की सामग्री से मुख्य बात क्या है?",
                    'options': [
                        "Understanding the main concepts" if language == 'en' else "मुख्य अवधारणाओं को समझना",
                        "Memorizing all details" if language == 'en' else "सभी विवरणों को याद रखना", 
                        "Skipping difficult parts" if language == 'en' else "कठिन भागों को छोड़ना",
                        "Reading quickly" if language == 'en' else "जल्दी पढ़ना"
                    ],
                    'answer': "Understanding the main concepts" if language == 'en' else "मुख्य अवधारणाओं को समझना",
                    'explanation': "The key to effective learning is understanding the main concepts." if language == 'en' else "प्रभावी सीखने की कुंजी मुख्य अवधारणाओं को समझना है।"
                })
            
            return quiz
            
        except Exception as e:
            logger.error(f"Fallback quiz generation failed: {e}")
            return []
    
    async def get_offline_data(self, data_type: str, limit: int = 10) -> List[Dict]:
        """Retrieve offline data"""
        try:
            conn = sqlite3.connect(self.offline_db_path)
            cursor = conn.cursor()
            
            if data_type == 'sessions':
                cursor.execute('''
                    SELECT id, start_time, end_time, duration, events, synced
                    FROM offline_sessions 
                    ORDER BY created_at DESC 
                    LIMIT ?
                ''', (limit,))
                
                rows = cursor.fetchall()
                sessions = []
                for row in rows:
                    sessions.append({
                        'id': row[0],
                        'start_time': row[1],
                        'end_time': row[2],
                        'duration': row[3],
                        'events': json.loads(row[4]) if row[4] else [],
                        'synced': bool(row[5])
                    })
                conn.close()
                return sessions
                
            elif data_type == 'learnings':
                cursor.execute('''
                    SELECT id, session_id, content, language, role, resources, quiz, processed, synced
                    FROM offline_learnings 
                    ORDER BY created_at DESC 
                    LIMIT ?
                ''', (limit,))
                
                rows = cursor.fetchall()
                learnings = []
                for row in rows:
                    learnings.append({
                        'id': row[0],
                        'session_id': row[1],
                        'content': row[2],
                        'language': row[3],
                        'role': row[4],
                        'resources': json.loads(row[5]) if row[5] else [],
                        'quiz': json.loads(row[6]) if row[6] else [],
                        'processed': bool(row[7]),
                        'synced': bool(row[8])
                    })
                conn.close()
                return learnings
            
            conn.close()
            return []
            
        except Exception as e:
            logger.error(f"Failed to get offline data: {e}")
            return []
    
    async def mark_as_synced(self, data_type: str, item_id: str) -> bool:
        """Mark offline data as synced"""
        try:
            conn = sqlite3.connect(self.offline_db_path)
            cursor = conn.cursor()
            
            table_name = f"offline_{data_type}"
            cursor.execute(f'''
                UPDATE {table_name} 
                SET synced = TRUE 
                WHERE id = ?
            ''', (item_id,))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to mark as synced: {e}")
            return False
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get offline service status"""
        return {
            'onnx_available': ONNX_AVAILABLE,
            'local_model_loaded': self.local_model is not None,
            'offline_db_ready': self.offline_db_path.exists(),
            'models_dir': str(self.models_dir)
        }

# Global instance
offline_service = OfflineService()
