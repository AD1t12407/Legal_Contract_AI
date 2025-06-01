from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json
import uuid
import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Configuration for Agent System and Digital Bridge
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Digital Bridge Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Edge Computing Configuration
EDGE_NODES = os.getenv("EDGE_NODES", "").split(",") if os.getenv("EDGE_NODES") else []
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Location Services
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# Regional Configuration
SUPPORTED_REGIONS = {
    "IN-AP": {"name": "Andhra Pradesh", "languages": ["te", "en"], "timezone": "Asia/Kolkata"},
    "IN-TN": {"name": "Tamil Nadu", "languages": ["ta", "en"], "timezone": "Asia/Kolkata"},
    "IN-KA": {"name": "Karnataka", "languages": ["kn", "en"], "timezone": "Asia/Kolkata"},
    "IN-WB": {"name": "West Bengal", "languages": ["bn", "en"], "timezone": "Asia/Kolkata"},
    "IN-UP": {"name": "Uttar Pradesh", "languages": ["hi", "en"], "timezone": "Asia/Kolkata"},
    "IN-BR": {"name": "Bihar", "languages": ["hi", "en"], "timezone": "Asia/Kolkata"},
    "IN-OR": {"name": "Odisha", "languages": ["or", "en"], "timezone": "Asia/Kolkata"},
    "IN-JH": {"name": "Jharkhand", "languages": ["hi", "en"], "timezone": "Asia/Kolkata"},
    "IN-MP": {"name": "Madhya Pradesh", "languages": ["hi", "en"], "timezone": "Asia/Kolkata"},
    "IN-RJ": {"name": "Rajasthan", "languages": ["hi", "en"], "timezone": "Asia/Kolkata"}
}

# Try to import OpenAI (optional)
try:
    import openai
    OPENAI_AVAILABLE = bool(OPENAI_API_KEY)
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI not available - using fallback quiz generation")

# Agent System Functions
async def search_with_tavily(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search using Tavily API for educational resources including articles and videos"""
    if not TAVILY_API_KEY:
        print("Tavily API key not available - using mock resources")
        return generate_mock_resources(query)

    try:
        url = "https://api.tavily.com/search"
        all_resources = []

        # Search 1: General educational articles (3 results)
        article_payload = {
            "api_key": TAVILY_API_KEY,
            "query": f"{query} educational resources learning materials tutorial guide",
            "search_depth": "basic",
            "include_answer": False,
            "include_images": False,
            "include_raw_content": False,
            "max_results": 3
        }

        article_response = requests.post(url, json=article_payload, timeout=10)
        if article_response.status_code == 200:
            article_data = article_response.json()
            article_results = article_data.get("results", [])

            for result in article_results:
                resource_type = "article"
                result_url = result.get("url", "")
                if "youtube.com" in result_url or "youtu.be" in result_url:
                    resource_type = "video"
                elif ".pdf" in result_url:
                    resource_type = "pdf"
                elif "khan" in result_url.lower() or "coursera" in result_url.lower() or "edx" in result_url.lower():
                    resource_type = "course"

                all_resources.append({
                    "title": result.get("title", "Educational Resource"),
                    "url": result_url,
                    "type": resource_type,
                    "snippet": result.get("content", "")[:200] + "..." if result.get("content") else ""
                })

        # Search 2: Specific video content (2 results)
        video_payload = {
            "api_key": TAVILY_API_KEY,
            "query": f"{query} video tutorial youtube educational explanation",
            "search_depth": "basic",
            "include_answer": False,
            "include_images": False,
            "include_raw_content": False,
            "max_results": 2
        }

        video_response = requests.post(url, json=video_payload, timeout=10)
        if video_response.status_code == 200:
            video_data = video_response.json()
            video_results = video_data.get("results", [])

            for result in video_results:
                result_url = result.get("url", "")
                # Prioritize video content
                resource_type = "video" if ("youtube.com" in result_url or "youtu.be" in result_url or "video" in result.get("title", "").lower()) else "article"

                all_resources.append({
                    "title": result.get("title", "Educational Video"),
                    "url": result_url,
                    "type": resource_type,
                    "snippet": result.get("content", "")[:200] + "..." if result.get("content") else ""
                })

        # Ensure we have at least 2 videos by adding mock videos if needed
        video_count = sum(1 for r in all_resources if r["type"] == "video")
        if video_count < 2:
            mock_videos = generate_mock_videos(query, 2 - video_count)
            all_resources.extend(mock_videos)

        return all_resources[:max_results]

    except Exception as e:
        print(f"Tavily search error: {e}")
        return generate_mock_resources(query)

def generate_mock_videos(query: str, count: int = 2) -> List[Dict[str, Any]]:
    """Generate mock video resources when not enough videos are found"""
    videos = [
        {
            "title": f"{query} - Complete Tutorial",
            "url": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}+tutorial",
            "type": "video",
            "snippet": f"Comprehensive video tutorial covering all aspects of {query} with step-by-step explanations."
        },
        {
            "title": f"Understanding {query} - Educational Video",
            "url": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}+explained",
            "type": "video",
            "snippet": f"Educational video that breaks down {query} concepts in an easy-to-understand format."
        },
        {
            "title": f"{query} Masterclass - Video Course",
            "url": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}+masterclass",
            "type": "video",
            "snippet": f"Professional video course covering advanced concepts and practical applications of {query}."
        }
    ]
    return videos[:count]

def generate_mock_resources(query: str) -> List[Dict[str, Any]]:
    """Generate mock resources when Tavily is not available"""
    return [
        {
            "title": f"Learn about {query} - Khan Academy",
            "url": f"https://www.khanacademy.org/search?page_search_query={query.replace(' ', '%20')}",
            "type": "course",
            "snippet": f"Comprehensive educational content about {query} with interactive exercises and videos."
        },
        {
            "title": f"{query} - Wikipedia",
            "url": f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}",
            "type": "article",
            "snippet": f"Detailed encyclopedia article covering the fundamentals and advanced concepts of {query}."
        },
        {
            "title": f"{query} Tutorial - YouTube",
            "url": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}+tutorial",
            "type": "video",
            "snippet": f"Video tutorials and explanations about {query} from educational content creators."
        },
        {
            "title": f"{query} Explained - Educational Video",
            "url": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}+explained",
            "type": "video",
            "snippet": f"Clear explanations and demonstrations of {query} concepts through engaging video content."
        }
    ]

async def generate_quiz_with_openai(content: str, resources: List[Dict] = None, role: str = "student") -> List[Dict[str, Any]]:
    """Generate highly topic-specific quiz using OpenAI with proper context"""
    if not OPENAI_AVAILABLE:
        return generate_fallback_quiz(content)

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)

        # Role-based difficulty and focus
        role_context = {
            "student": {
                "difficulty": "intermediate",
                "focus": "understanding core concepts and practical applications",
                "question_types": "conceptual understanding, basic applications, and foundational knowledge"
            },
            "researcher": {
                "difficulty": "advanced",
                "focus": "deep analysis, research methodologies, and critical evaluation",
                "question_types": "analytical thinking, research methods, and advanced concepts"
            },
            "professional": {
                "difficulty": "advanced",
                "focus": "practical implementation, real-world applications, and problem-solving",
                "question_types": "implementation strategies, best practices, and professional scenarios"
            }
        }

        current_role = role_context.get(role, role_context["student"])

        # Create a highly specific prompt based on the actual content
        prompt = f"""You are an expert educator creating quiz questions for a {role} learning about: "{content}"

CONTEXT:
- Learner role: {role}
- Difficulty level: {current_role['difficulty']}
- Focus area: {current_role['focus']}
- Question types: {current_role['question_types']}

TASK: Create 3 highly specific multiple-choice questions that directly test knowledge about the EXACT topics mentioned in the learning content: "{content}"

REQUIREMENTS:
1. Questions must be DIRECTLY about the specific topics/concepts mentioned in the content
2. Use the exact terminology from the learning content
3. Test {current_role['focus']}
4. Create realistic, challenging distractors
5. Provide educational explanations

EXAMPLE (if content was "React hooks and useState"):
[
  {{
    "question": "What is the primary purpose of the useState hook in React?",
    "options": [
      "To manage component state in functional components",
      "To handle component lifecycle methods",
      "To optimize component rendering performance",
      "To connect components to external APIs"
    ],
    "correct_answer": "To manage component state in functional components",
    "explanation": "useState is a React hook that allows functional components to have state variables, replacing the need for class components for state management."
  }}
]

Now create 3 questions specifically about: "{content}"

Respond with ONLY valid JSON array, no other text:"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert educator creating {current_role['difficulty']}-level quiz questions for a {role}. Focus on {current_role['focus']}. Respond ONLY with valid JSON array, no explanatory text."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,  # Very low temperature for consistent, focused questions
            max_tokens=1500
        )

        quiz_text = response.choices[0].message.content.strip()

        # Clean up the response
        if quiz_text.startswith("```json"):
            quiz_text = quiz_text[7:]
        if quiz_text.endswith("```"):
            quiz_text = quiz_text[:-3]
        quiz_text = quiz_text.strip()

        # Parse and validate
        quiz = json.loads(quiz_text)
        if not isinstance(quiz, list):
            quiz = [quiz]

        # Ensure we have exactly 3 questions
        quiz = quiz[:3]

        print(f"✅ Generated {len(quiz)} topic-specific questions using OpenAI")
        return quiz

    except Exception as e:
        print(f"❌ OpenAI quiz generation error: {e}")
        return generate_fallback_quiz(content)

def generate_fallback_quiz(content: str) -> List[Dict[str, Any]]:
    """Generate improved fallback quiz when OpenAI is not available"""

    # Analyze content to extract meaningful information
    content_lower = content.lower()
    words = content.split()

    # Extract key terms (improved filtering)
    key_terms = []
    stop_words = {
        "should", "would", "could", "about", "there", "their", "these", "those",
        "learning", "content", "today", "learned", "study", "understand", "know",
        "important", "concept", "principle", "idea", "thing", "things", "something"
    }

    for word in words:
        clean_word = word.strip(",.?!\"'()[]{}").lower()
        if (len(clean_word) > 4 and
            clean_word not in stop_words and
            clean_word.isalpha() and
            not clean_word.startswith(('http', 'www'))):
            key_terms.append(clean_word.title())

    # Get unique terms and prioritize longer, more specific terms
    unique_terms = list(dict.fromkeys(key_terms))  # Preserve order while removing duplicates
    unique_terms.sort(key=len, reverse=True)  # Longer terms first
    unique_terms = unique_terms[:5]  # Take top 5 terms

    # Detect topic domain for better question generation
    topic_domain = detect_topic_domain(content_lower)

    # Generate contextual quiz questions
    quiz = []

    if len(unique_terms) >= 2:
        # Question 1: Definition/Concept question
        main_term = unique_terms[0]
        quiz.append({
            "question": f"What is the primary focus when learning about {main_term}?",
            "options": [
                f"Understanding the core principles and applications of {main_term}",
                f"Memorizing all technical details about {main_term}",
                f"Comparing {main_term} with unrelated topics",
                f"Avoiding practical applications of {main_term}"
            ],
            "correct_answer": f"Understanding the core principles and applications of {main_term}",
            "explanation": f"When learning about {main_term}, it's most important to grasp the fundamental concepts and how they can be applied practically."
        })

        # Question 2: Application/Relationship question
        if len(unique_terms) >= 2:
            term1, term2 = unique_terms[0], unique_terms[1]
            quiz.append({
                "question": f"How do {term1} and {term2} relate in the context of this learning topic?",
                "options": [
                    f"{term1} and {term2} are complementary concepts that work together",
                    f"{term1} and {term2} are completely unrelated topics",
                    f"{term1} is always more important than {term2}",
                    f"{term1} and {term2} cannot be studied simultaneously"
                ],
                "correct_answer": f"{term1} and {term2} are complementary concepts that work together",
                "explanation": f"In most learning contexts, {term1} and {term2} are interconnected concepts that enhance understanding when studied together."
            })

        # Question 3: Domain-specific question
        domain_question = generate_domain_specific_question(topic_domain, unique_terms[0])
        quiz.append(domain_question)

    else:
        # Fallback to generic but educational questions
        quiz = [
            {
                "question": "What is the most effective approach to learning new concepts?",
                "options": [
                    "Active engagement and practical application",
                    "Passive reading without practice",
                    "Memorization without understanding",
                    "Avoiding challenging material"
                ],
                "correct_answer": "Active engagement and practical application",
                "explanation": "Research shows that active learning and practical application lead to better understanding and retention of new concepts."
            },
            {
                "question": "Why is it important to connect new learning to existing knowledge?",
                "options": [
                    "It helps build a stronger foundation and improves retention",
                    "It makes learning more difficult",
                    "It's not necessary for effective learning",
                    "It only works for advanced learners"
                ],
                "correct_answer": "It helps build a stronger foundation and improves retention",
                "explanation": "Connecting new information to existing knowledge creates stronger neural pathways and makes the information more meaningful and memorable."
            },
            {
                "question": "What role does practice play in mastering new skills or concepts?",
                "options": [
                    "Practice reinforces learning and builds competency",
                    "Practice is only needed for physical skills",
                    "Practice makes learning more confusing",
                    "Practice should be avoided until mastery is achieved"
                ],
                "correct_answer": "Practice reinforces learning and builds competency",
                "explanation": "Regular practice helps consolidate learning, identify areas for improvement, and build confidence in applying new knowledge or skills."
            }
        ]

    return quiz[:3]  # Return exactly 3 questions

def detect_topic_domain(content: str) -> str:
    """Detect the general domain/subject of the learning content"""

    # Define domain keywords
    domains = {
        "technology": ["programming", "code", "software", "algorithm", "computer", "data", "api", "web", "app", "digital", "tech", "javascript", "python", "react", "html", "css"],
        "science": ["experiment", "hypothesis", "theory", "research", "biology", "chemistry", "physics", "scientific", "analysis", "method"],
        "mathematics": ["equation", "formula", "calculate", "number", "math", "algebra", "geometry", "statistics", "probability", "function"],
        "business": ["marketing", "management", "strategy", "finance", "economics", "business", "company", "profit", "market", "customer"],
        "language": ["grammar", "vocabulary", "writing", "reading", "language", "communication", "literature", "essay", "word"],
        "history": ["historical", "past", "century", "war", "civilization", "culture", "ancient", "modern", "period", "era"],
        "health": ["health", "medical", "body", "exercise", "nutrition", "wellness", "fitness", "disease", "treatment"]
    }

    # Count domain matches
    domain_scores = {}
    for domain, keywords in domains.items():
        score = sum(1 for keyword in keywords if keyword in content)
        if score > 0:
            domain_scores[domain] = score

    # Return the domain with highest score, or "general" if no clear match
    if domain_scores:
        return max(domain_scores, key=domain_scores.get)
    return "general"

def generate_domain_specific_question(domain: str, main_term: str) -> Dict[str, Any]:
    """Generate a domain-specific question based on the detected topic area"""

    domain_questions = {
        "technology": {
            "question": f"When implementing {main_term} in a project, what is the most important consideration?",
            "options": [
                f"Understanding the requirements and choosing appropriate tools for {main_term}",
                f"Using the most complex approach possible for {main_term}",
                f"Avoiding documentation when working with {main_term}",
                f"Implementing {main_term} without testing"
            ],
            "correct_answer": f"Understanding the requirements and choosing appropriate tools for {main_term}",
            "explanation": f"Successful implementation of {main_term} requires clear understanding of requirements and selecting the right tools and approaches for the specific use case."
        },
        "science": {
            "question": f"What is the best approach to studying {main_term} scientifically?",
            "options": [
                f"Observe, hypothesize, and test theories about {main_term}",
                f"Accept all information about {main_term} without question",
                f"Avoid experimental approaches to {main_term}",
                f"Study {main_term} in isolation from other concepts"
            ],
            "correct_answer": f"Observe, hypothesize, and test theories about {main_term}",
            "explanation": f"The scientific method of observation, hypothesis formation, and testing is the most reliable way to understand {main_term} and its properties."
        },
        "mathematics": {
            "question": f"What is essential for mastering {main_term} in mathematics?",
            "options": [
                f"Understanding the underlying principles and practicing problem-solving with {main_term}",
                f"Memorizing formulas related to {main_term} without understanding",
                f"Avoiding practical applications of {main_term}",
                f"Learning {main_term} without connecting it to other mathematical concepts"
            ],
            "correct_answer": f"Understanding the underlying principles and practicing problem-solving with {main_term}",
            "explanation": f"Mathematical mastery of {main_term} comes from understanding the fundamental principles and applying them through varied problem-solving practice."
        }
    }

    # Return domain-specific question or generic one
    if domain in domain_questions:
        return domain_questions[domain]
    else:
        return {
            "question": f"What is the key to effectively learning about {main_term}?",
            "options": [
                f"Breaking down {main_term} into manageable components and building understanding gradually",
                f"Trying to learn everything about {main_term} at once",
                f"Avoiding practical examples of {main_term}",
                f"Learning {main_term} without any context or background"
            ],
            "correct_answer": f"Breaking down {main_term} into manageable components and building understanding gradually",
            "explanation": f"Effective learning of {main_term} involves breaking complex topics into smaller, manageable parts and building understanding step by step."
        }

# Agent System - Process Learning Function
async def process_learning_with_agents(learning_content: str, learning_id: str, role: str = "student") -> Dict[str, Any]:
    """Process learning content with AI agents to generate resources and quiz"""
    try:
        print(f"🤖 Agent System: Processing learning content for ID {learning_id}")
        print(f"   📚 Content: {learning_content[:100]}...")
        print(f"   👤 Role: {role}")

        # Step 1: Search for educational resources using Tavily
        print("🔍 Searching for educational resources...")
        resources = await search_with_tavily(learning_content, max_results=5)

        # Step 2: Generate topic-specific quiz using OpenAI with role context
        print(f"📝 Generating {role}-level quiz questions...")
        quiz = await generate_quiz_with_openai(learning_content, resources, role)

        result = {
            "learning_id": learning_id,
            "resources": resources,
            "quiz": quiz,
            "processed": True,
            "agent_status": "success",
            "role": role
        }

        print(f"✅ Agent System: Successfully processed learning {learning_id}")
        print(f"   - Found {len(resources)} resources")
        print(f"   - Generated {len(quiz)} topic-specific quiz questions for {role}")

        return result

    except Exception as e:
        print(f"❌ Agent System Error: {e}")
        return {
            "learning_id": learning_id,
            "resources": generate_mock_resources(learning_content),
            "quiz": generate_fallback_quiz(learning_content),
            "processed": True,
            "agent_status": "fallback",
            "role": role,
            "error": str(e)
        }

# Learning Card Models
class LearningCreate(BaseModel):
    session_id: str
    content: str
    role: str = "student"

class Learning(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    role: str = "student"
    resources: Optional[List[Dict[str, str]]] = None
    quiz: Optional[List[Dict[str, Any]]] = None
    processed: bool = False

# In-memory storage for learning cards (in production, use database)
learning_cards_storage: Dict[str, Learning] = {}

# Digital Bridge Models and Storage
class UserProfile(BaseModel):
    user_id: str
    name: str
    grade: str
    region: str
    languages: List[str]
    location: Optional[Dict[str, float]] = None  # {"lat": 12.34, "lng": 56.78}
    phone_number: Optional[str] = None
    device_type: str = "mobile"  # mobile, tablet, desktop
    connectivity: str = "low"  # low, medium, high
    learning_preferences: List[str] = []
    mentorship_status: str = "learner"  # learner, mentor, both

class CommunityHub(BaseModel):
    hub_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: Dict[str, float]  # {"lat": 12.34, "lng": 56.78}
    region: str
    languages: List[str]
    capacity: int
    current_users: int = 0
    connectivity_type: str = "wifi"  # wifi, satellite, cellular
    resources: List[str] = []
    operating_hours: Dict[str, str] = {}
    contact_info: Dict[str, str] = {}
    status: str = "active"  # active, maintenance, offline

class MobileLearningUnit(BaseModel):
    unit_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    current_location: Dict[str, float]
    route: List[Dict[str, float]] = []
    schedule: List[Dict[str, str]] = []
    capacity: int
    current_students: int = 0
    subjects: List[str] = []
    languages: List[str] = []
    equipment: List[str] = []
    status: str = "active"  # active, en_route, maintenance

class PeerConnection(BaseModel):
    connection_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    connection_type: str = "peer"  # peer, mentor, study_group
    shared_subjects: List[str] = []
    distance_km: float
    last_interaction: datetime = Field(default_factory=datetime.now)
    status: str = "active"  # active, inactive, blocked

class ContentPackage(BaseModel):
    package_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subject: str
    grade: str
    language: str
    region: str
    content_type: str = "mixed"  # text, video, audio, interactive, mixed
    size_mb: float
    offline_capable: bool = True
    prerequisites: List[str] = []
    learning_objectives: List[str] = []
    estimated_duration: int  # minutes
    difficulty_level: str = "intermediate"
    created_by: str
    version: str = "1.0"
    download_count: int = 0
    rating: float = 0.0

class SMSInteraction(BaseModel):
    interaction_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone_number: str
    message_type: str = "query"  # query, response, notification, reminder
    content: str
    language: str
    timestamp: datetime = Field(default_factory=datetime.now)
    response_sent: bool = False
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class EdgeNode(BaseModel):
    node_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location: Dict[str, float]
    region: str
    capacity_gb: float
    used_storage_gb: float = 0.0
    bandwidth_mbps: float
    connected_devices: int = 0
    max_devices: int
    status: str = "online"  # online, offline, maintenance
    last_sync: datetime = Field(default_factory=datetime.now)
    cached_content: List[str] = []

# In-memory storage for Digital Bridge (in production, use distributed database)
user_profiles: Dict[str, UserProfile] = {}
community_hubs: Dict[str, CommunityHub] = {}
mobile_units: Dict[str, MobileLearningUnit] = {}
peer_connections: Dict[str, PeerConnection] = {}
content_packages: Dict[str, ContentPackage] = {}
sms_interactions: Dict[str, SMSInteraction] = {}
edge_nodes: Dict[str, EdgeNode] = {}

# Initialize some sample data
def initialize_sample_data():
    """Initialize sample data for Digital Bridge"""

    # Sample Community Hubs
    sample_hubs = [
        CommunityHub(
            name="Anantapur Learning Center",
            location={"lat": 14.6819, "lng": 77.6006},
            region="IN-AP",
            languages=["te", "en"],
            capacity=50,
            current_users=23,
            connectivity_type="wifi",
            resources=["computers", "tablets", "books", "internet"],
            operating_hours={"monday": "9:00-17:00", "tuesday": "9:00-17:00"},
            contact_info={"phone": "+91-9876543210", "email": "anantapur@learning.org"}
        ),
        CommunityHub(
            name="Salem Digital Hub",
            location={"lat": 11.6643, "lng": 78.1460},
            region="IN-TN",
            languages=["ta", "en"],
            capacity=30,
            current_users=18,
            connectivity_type="satellite",
            resources=["tablets", "solar_power", "offline_content"],
            operating_hours={"monday": "10:00-16:00", "tuesday": "10:00-16:00"},
            contact_info={"phone": "+91-9876543211", "email": "salem@learning.org"}
        )
    ]

    for hub in sample_hubs:
        community_hubs[hub.hub_id] = hub

    # Sample Mobile Learning Units
    sample_units = [
        MobileLearningUnit(
            name="Mobile Classroom Alpha",
            current_location={"lat": 14.5, "lng": 77.5},
            route=[
                {"lat": 14.5, "lng": 77.5},
                {"lat": 14.6, "lng": 77.6},
                {"lat": 14.7, "lng": 77.7}
            ],
            schedule=[
                {"day": "monday", "location": "Kadiri", "time": "9:00-12:00"},
                {"day": "tuesday", "location": "Anantapur", "time": "9:00-12:00"}
            ],
            capacity=25,
            current_students=15,
            subjects=["mathematics", "science", "english"],
            languages=["te", "en"],
            equipment=["tablets", "projector", "generator", "satellite_internet"]
        )
    ]

    for unit in sample_units:
        mobile_units[unit.unit_id] = unit

    # Sample Content Packages
    sample_packages = [
        ContentPackage(
            title="Basic Mathematics for Grade 8",
            subject="mathematics",
            grade="8",
            language="te",
            region="IN-AP",
            content_type="mixed",
            size_mb=45.2,
            offline_capable=True,
            prerequisites=["grade_7_math"],
            learning_objectives=["algebra_basics", "geometry_introduction"],
            estimated_duration=120,
            difficulty_level="intermediate",
            created_by="AP_Education_Board",
            download_count=1250,
            rating=4.3
        ),
        ContentPackage(
            title="Science Experiments for Rural Schools",
            subject="science",
            grade="9",
            language="hi",
            region="IN-UP",
            content_type="video",
            size_mb=89.7,
            offline_capable=True,
            prerequisites=["basic_science"],
            learning_objectives=["practical_experiments", "scientific_method"],
            estimated_duration=180,
            difficulty_level="intermediate",
            created_by="Rural_Science_Initiative",
            download_count=890,
            rating=4.6
        )
    ]

    for package in sample_packages:
        content_packages[package.package_id] = package

    # Sample Edge Nodes
    sample_nodes = [
        EdgeNode(
            location={"lat": 14.6819, "lng": 77.6006},
            region="IN-AP",
            capacity_gb=500.0,
            used_storage_gb=234.5,
            bandwidth_mbps=100.0,
            connected_devices=45,
            max_devices=100,
            cached_content=["math_grade8_te", "science_grade9_hi", "english_basics"]
        ),
        EdgeNode(
            location={"lat": 11.6643, "lng": 78.1460},
            region="IN-TN",
            capacity_gb=300.0,
            used_storage_gb=156.8,
            bandwidth_mbps=50.0,
            connected_devices=28,
            max_devices=60,
            cached_content=["tamil_literature", "math_grade7_ta", "science_basics"]
        )
    ]

    for node in sample_nodes:
        edge_nodes[node.node_id] = node

# Initialize sample data on startup
initialize_sample_data()

# FastAPI app
app = FastAPI(title="AutoPom API - Simplified")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Models for API requests/responses
class TutorRequest(BaseModel):
    question: str
    subject: str = "general"
    language: str = "en"
    student_level: str = "intermediate"
    user_id: str = "default"

class TutorResponse(BaseModel):
    response: str
    subject: str
    language: str
    student_level: str
    resources: List[Dict[str, str]] = []
    follow_up_questions: List[str] = []
    confidence: float = 0.9

class ConceptRequest(BaseModel):
    concept: str
    subject: str = "general"
    language: str = "en"
    difficulty: str = "beginner"

class ConceptExplanation(BaseModel):
    concept: str
    explanation: str
    subject: str
    difficulty: str
    language: str
    related_concepts: List[str] = []
    examples: List[Dict[str, str]] = []

class PracticeRequest(BaseModel):
    topic: str
    subject: str = "general"
    difficulty: str = "intermediate"
    count: int = 5

class PracticeQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    hints: List[str] = []
    difficulty: str
    topic: str

# Mock data and responses
def generate_mock_tutor_response(question: str, subject: str, language: str) -> TutorResponse:
    """Generate a mock AI tutor response"""
    responses = {
        "en": f"Great question about {subject}! Let me explain this concept step by step. {question} is an important topic that requires understanding of fundamental principles.",
        "hi": f"{subject} के बारे में बहुत अच्छा प्रश्न! मैं इस अवधारणा को चरणबद्ध तरीके से समझाता हूं।",
        "te": f"{subject} గురించి చాలా మంచి ప్రశ్న! ఈ భావనను దశలవారీగా వివరిస్తాను।",
        "ta": f"{subject} பற்றிய மிகச் சிறந்த கேள்வி! இந்த கருத்தை படிப்படியாக விளக்குகிறேன்।",
        "bn": f"{subject} সম্পর্কে দুর্দান্ত প্রশ্ন! আমি এই ধারণাটি ধাপে ধাপে ব্যাখ্যা করি।",
        "kn": f"{subject} ಬಗ್ಗೆ ಅದ್ಭುತ ಪ್ರಶ್ನೆ! ಈ ಪರಿಕಲ್ಪನೆಯನ್ನು ಹಂತ ಹಂತವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ।"
    }
    
    return TutorResponse(
        response=responses.get(language, responses["en"]),
        subject=subject,
        language=language,
        student_level="intermediate",
        resources=[
            {
                "title": f"Learn more about {subject}",
                "url": f"https://example.com/{subject}",
                "description": f"Comprehensive guide to {subject}"
            }
        ],
        follow_up_questions=[
            f"What are the practical applications of {subject}?",
            f"How does {subject} relate to real-world scenarios?",
            f"Can you give me more examples of {subject}?"
        ]
    )

def generate_mock_concept_explanation(concept: str, subject: str, language: str, difficulty: str) -> ConceptExplanation:
    """Generate a mock concept explanation"""
    explanations = {
        "en": f"The concept of '{concept}' in {subject} is fundamental to understanding this field. At the {difficulty} level, we can explain it as a core principle that governs how things work in this domain.",
        "hi": f"'{concept}' की अवधारणा {subject} में इस क्षेत्र को समझने के लिए मौलिक है।",
        "te": f"'{concept}' భావన {subject} లో ఈ రంగాన్ని అర్థం చేసుకోవడానికి ప్రాథమికమైనది।",
        "ta": f"'{concept}' கருத்து {subject} இல் இந்த துறையை புரிந்துகொள்வதற்கு அடிப்படையானது।",
        "bn": f"'{concept}' ধারণা {subject} এ এই ক্ষেত্রটি বোঝার জন্য মৌলিক।",
        "kn": f"'{concept}' ಪರಿಕಲ್ಪನೆ {subject} ನಲ್ಲಿ ಈ ಕ್ಷೇತ್ರವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮೂಲಭೂತವಾಗಿದೆ।"
    }
    
    return ConceptExplanation(
        concept=concept,
        explanation=explanations.get(language, explanations["en"]),
        subject=subject,
        difficulty=difficulty,
        language=language,
        related_concepts=[f"Related concept 1 to {concept}", f"Related concept 2 to {concept}"],
        examples=[
            {
                "title": f"Example 1 of {concept}",
                "description": f"This shows how {concept} works in practice"
            },
            {
                "title": f"Example 2 of {concept}",
                "description": f"Another way to understand {concept}"
            }
        ]
    )

def generate_mock_practice_questions(topic: str, subject: str, difficulty: str, count: int) -> List[PracticeQuestion]:
    """Generate mock practice questions"""
    questions = []
    for i in range(min(count, 5)):  # Limit to 5 questions
        question = PracticeQuestion(
            question=f"Question {i+1}: What is the main principle of {topic} in {subject}?",
            options=[
                f"Option A: First principle of {topic}",
                f"Option B: Second principle of {topic}",
                f"Option C: Third principle of {topic}",
                f"Option D: Fourth principle of {topic}"
            ],
            correct_answer=f"Option A: First principle of {topic}",
            explanation=f"The correct answer is Option A because it represents the fundamental principle of {topic} in {subject}.",
            hints=[
                f"Think about the basic definition of {topic}",
                f"Consider how {topic} is applied in {subject}"
            ],
            difficulty=difficulty,
            topic=topic
        )
        questions.append(question)
    
    return questions

# API Endpoints
@app.get("/")
async def root():
    return {"message": "AutoPom API - Simplified Version", "status": "running"}

@app.post("/ai-tutor/ask")
async def ask_ai_tutor(
    question: str,
    subject: str = "general",
    language: str = "en",
    student_level: str = "intermediate",
    user_id: str = "default"
):
    """Ask AI tutor a question"""
    try:
        response = generate_mock_tutor_response(question, subject, language)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI tutor error: {str(e)}")

@app.post("/ai-tutor/explain")
async def explain_concept(
    concept: str,
    subject: str = "general",
    language: str = "en",
    difficulty: str = "beginner"
):
    """Get detailed explanation of a concept"""
    try:
        response = generate_mock_concept_explanation(concept, subject, language, difficulty)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Concept explanation error: {str(e)}")

@app.post("/ai-tutor/practice-questions")
async def generate_practice_questions(
    topic: str,
    subject: str = "general",
    difficulty: str = "intermediate",
    count: int = 5
):
    """Generate practice questions for a topic"""
    try:
        questions = generate_mock_practice_questions(topic, subject, difficulty, count)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Practice questions error: {str(e)}")

@app.post("/speech/transcribe")
async def transcribe_audio():
    """Mock speech transcription endpoint"""
    return {
        "text": "This is a mock transcription of your audio",
        "confidence": 0.95,
        "language": "en"
    }

@app.post("/speech/synthesize")
async def synthesize_speech(
    text: str,
    language: str = "en",
    voice: str = "default"
):
    """Mock speech synthesis endpoint"""
    return {
        "audio_url": f"https://example.com/audio/{uuid.uuid4()}.mp3",
        "duration": len(text) * 0.1  # Mock duration based on text length
    }

# Missing endpoints that the frontend is calling
@app.get("/sessions")
async def get_sessions():
    """Mock sessions endpoint"""
    return [
        {
            "id": "session_1",
            "start_time": "2024-01-01T10:00:00Z",
            "end_time": "2024-01-01T11:00:00Z",
            "duration": 3600,
            "subject": "mathematics"
        }
    ]

@app.get("/learnings")
async def get_learnings():
    """Mock learnings endpoint"""
    return [
        {
            "id": "learning_1",
            "session_id": "session_1",
            "content": "Learned about algebra basics",
            "created_at": "2024-01-01T10:30:00Z",
            "role": "student"
        }
    ]

@app.get("/ai-tutor/history")
async def get_tutor_history(
    user_id: str,
    limit: int = 10
):
    """Get AI tutor conversation history"""
    return [
        {
            "question": "What is algebra?",
            "response": "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols.",
            "timestamp": "2024-01-01T10:00:00Z",
            "subject": "mathematics"
        },
        {
            "question": "How do I solve linear equations?",
            "response": "To solve linear equations, isolate the variable by performing the same operations on both sides.",
            "timestamp": "2024-01-01T10:15:00Z",
            "subject": "mathematics"
        }
    ]

@app.get("/ai-tutor/topics")
async def get_subject_topics(
    subject: str,
    language: str = "en"
):
    """Get topics for a subject"""
    topics_by_subject = {
        "mathematics": [
            {
                "topic": "Algebra",
                "description": "Working with variables and equations",
                "difficulty": "beginner",
                "prerequisites": []
            },
            {
                "topic": "Geometry",
                "description": "Study of shapes and spatial relationships",
                "difficulty": "intermediate",
                "prerequisites": ["Basic arithmetic"]
            }
        ],
        "science": [
            {
                "topic": "Physics",
                "description": "Study of matter and energy",
                "difficulty": "intermediate",
                "prerequisites": ["Mathematics"]
            },
            {
                "topic": "Chemistry",
                "description": "Study of substances and their properties",
                "difficulty": "intermediate",
                "prerequisites": ["Basic mathematics"]
            }
        ],
        "general": [
            {
                "topic": "Critical Thinking",
                "description": "Developing analytical skills",
                "difficulty": "beginner",
                "prerequisites": []
            }
        ]
    }

    return topics_by_subject.get(subject, topics_by_subject["general"])

@app.get("/analytics")
async def get_analytics(days: int = 7):
    """Mock analytics endpoint"""
    return {
        "total_sessions": 15,
        "total_focus_time": 7200,  # 2 hours in seconds
        "avg_session_length": 480,  # 8 minutes
        "avg_interruptions": 2.3,
        "peak_focus_hours": [9, 10, 14, 15, 16],
        "interruption_heatmap": {
            "monday": 3,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 4,
            "friday": 2,
            "saturday": 1,
            "sunday": 1
        }
    }

# DIGITAL BRIDGE API ENDPOINTS
@app.get("/digital-bridge/content")
async def get_offline_content(
    subject: Optional[str] = None,
    language: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """Get available offline content"""
    content = [
        {
            "id": "content_1",
            "title": "Mathematics Basics - Offline Pack",
            "description": "Complete mathematics fundamentals for offline learning",
            "content_type": "lesson",
            "size_mb": 150.5,
            "language": language or "en",
            "subject": subject or "mathematics",
            "difficulty": difficulty or "beginner",
            "download_url": "https://example.com/download/math_basics.zip",
            "thumbnail_url": "https://example.com/thumbnails/math.jpg",
            "duration": 3600,
            "prerequisites": [],
            "tags": ["offline", "mathematics", "basics"],
            "offline_available": True,
            "last_updated": "2024-01-01T00:00:00Z"
        },
        {
            "id": "content_2",
            "title": "Science Experiments - Hindi",
            "description": "Interactive science experiments in Hindi",
            "content_type": "video",
            "size_mb": 250.0,
            "language": "hi",
            "subject": "science",
            "difficulty": "intermediate",
            "download_url": "https://example.com/download/science_hindi.zip",
            "thumbnail_url": "https://example.com/thumbnails/science.jpg",
            "duration": 5400,
            "prerequisites": ["Basic science knowledge"],
            "tags": ["offline", "science", "hindi", "experiments"],
            "offline_available": True,
            "last_updated": "2024-01-01T00:00:00Z"
        }
    ]
    return content

@app.post("/digital-bridge/download")
async def download_content(request: dict):
    """Start content download"""
    content_id = request.get("content_id")
    priority = request.get("priority", "medium")

    return {
        "download_id": f"download_{uuid.uuid4()}",
        "estimated_time": 300  # 5 minutes
    }

@app.get("/digital-bridge/download/{download_id}/progress")
async def get_download_progress(download_id: str):
    """Get download progress"""
    return {
        "progress": 75.5,
        "status": "downloading",
        "bytes_downloaded": 113250000,
        "total_bytes": 150000000,
        "estimated_time_remaining": 60
    }

@app.get("/digital-bridge/sync/status")
async def get_sync_status(device_id: str):
    """Get sync status"""
    return {
        "device_id": device_id,
        "last_sync": "2024-01-01T12:00:00Z",
        "pending_uploads": 3,
        "pending_downloads": 1,
        "storage_used_mb": 1024,
        "storage_available_mb": 2048,
        "sync_in_progress": False,
        "connection_quality": "good"
    }

@app.post("/digital-bridge/sync/start")
async def start_sync(request: dict):
    """Start sync process"""
    device_id = request.get("device_id")
    sync_type = request.get("sync_type", "incremental")

    return {
        "sync_id": f"sync_{uuid.uuid4()}",
        "estimated_time": 120
    }

@app.get("/digital-bridge/peers/discover")
async def discover_peers(device_id: str, radius: int = 100):
    """Discover nearby peer devices"""
    return [
        {
            "device_id": "peer_device_1",
            "device_name": "Student's Phone",
            "distance_meters": 25,
            "connection_type": "bluetooth",
            "available_content": ["content_1", "content_3"],
            "last_seen": "2024-01-01T12:00:00Z",
            "trust_level": 0.9
        },
        {
            "device_id": "peer_device_2",
            "device_name": "Community Tablet",
            "distance_meters": 50,
            "connection_type": "wifi_direct",
            "available_content": ["content_2", "content_4"],
            "last_seen": "2024-01-01T11:55:00Z",
            "trust_level": 0.95
        }
    ]

@app.post("/digital-bridge/peers/request")
async def request_content_from_peer(request: dict):
    """Request content from peer device"""
    return {
        "transfer_id": f"transfer_{uuid.uuid4()}",
        "estimated_time": 180
    }

@app.get("/digital-bridge/hubs/nearby")
async def find_nearby_hubs(latitude: float, longitude: float, radius: int = 50):
    """Find nearby community hubs"""
    return [
        {
            "id": "hub_1",
            "name": "Village Learning Center",
            "location": {
                "latitude": latitude + 0.001,
                "longitude": longitude + 0.001,
                "address": "Main Street, Village Center"
            },
            "status": "online",
            "capacity": 50,
            "current_users": 12,
            "available_content": ["content_1", "content_2", "content_3"],
            "mentor_available": True,
            "last_updated": "2024-01-01T12:00:00Z",
            "contact_info": {
                "phone": "+91-9876543210",
                "email": "hub@village.edu"
            }
        }
    ]

@app.post("/digital-bridge/hubs/connect")
async def connect_to_hub(request: dict):
    """Connect to community hub"""
    return {
        "connection_id": f"conn_{uuid.uuid4()}",
        "available_content": ["content_1", "content_2", "content_3"],
        "mentor_info": {
            "name": "Priya Sharma",
            "subjects": ["Mathematics", "Science"],
            "available_hours": "9 AM - 5 PM"
        }
    }

# VERNACULAR LEARNING API ENDPOINTS
@app.get("/vernacular/languages")
async def get_supported_languages():
    """Get supported languages"""
    return [
        {
            "code": "en",
            "name": "English",
            "native_name": "English",
            "region": "Global",
            "speakers": 1500000000,
            "writing_system": "Latin",
            "supported_features": {
                "text_to_speech": True,
                "speech_to_text": True,
                "translation": True,
                "content_available": True
            }
        },
        {
            "code": "hi",
            "name": "Hindi",
            "native_name": "हिन्दी",
            "region": "North India",
            "speakers": 600000000,
            "writing_system": "Devanagari",
            "supported_features": {
                "text_to_speech": True,
                "speech_to_text": True,
                "translation": True,
                "content_available": True
            }
        },
        {
            "code": "te",
            "name": "Telugu",
            "native_name": "తెలుగు",
            "region": "Andhra Pradesh, Telangana",
            "speakers": 95000000,
            "writing_system": "Telugu script",
            "supported_features": {
                "text_to_speech": True,
                "speech_to_text": True,
                "translation": True,
                "content_available": True
            }
        }
    ]

@app.post("/vernacular/translate")
async def translate_text(request: dict):
    """Translate text between languages"""
    text = request.get("text", "")
    source_language = request.get("source_language", "en")
    target_language = request.get("target_language", "hi")

    # Mock translation
    translations = {
        "en_to_hi": f"[हिन्दी] {text}",
        "en_to_te": f"[తెలుగు] {text}",
        "hi_to_en": f"[English] {text}",
        "te_to_en": f"[English] {text}"
    }

    translation_key = f"{source_language}_to_{target_language}"
    translated = translations.get(translation_key, f"[{target_language.upper()}] {text}")

    return {
        "original_text": text,
        "translated_text": translated,
        "source_language": source_language,
        "target_language": target_language,
        "confidence": 0.95,
        "cultural_notes": [f"Adapted for {target_language} cultural context"],
        "alternative_translations": []
    }

@app.get("/vernacular/content")
async def get_vernacular_content(
    language: str,
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    content_type: Optional[str] = None
):
    """Get vernacular learning content"""
    return [
        {
            "id": "vernacular_1",
            "title": f"Mathematics in {language.upper()}",
            "description": f"Learn mathematics concepts in {language}",
            "content": f"This is educational content in {language}",
            "language": language,
            "subject": subject or "mathematics",
            "difficulty": difficulty or "beginner",
            "content_type": content_type or "lesson",
            "cultural_context": [f"{language} cultural context"],
            "local_examples": [f"Local example in {language}"],
            "audio_url": f"https://example.com/audio/{language}/math.mp3",
            "video_url": f"https://example.com/video/{language}/math.mp4",
            "images": [f"https://example.com/images/{language}/math1.jpg"],
            "created_by": "ai",
            "rating": 4.5,
            "usage_count": 150
        }
    ]

# GAMIFICATION API ENDPOINTS
@app.get("/gamification/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get user gamification stats"""
    return {
        "user_id": user_id,
        "level": 15,
        "total_points": 2450,
        "points_to_next_level": 550,
        "current_streak": 7,
        "longest_streak": 21,
        "total_focus_time": 14400,  # 4 hours
        "lessons_completed": 45,
        "achievements_unlocked": 12,
        "badges_earned": 8,
        "rank_global": 1247,
        "rank_local": 23
    }

@app.post("/gamification/progress")
async def update_user_progress(request: dict):
    """Update user progress and award points"""
    user_id = request.get("user_id")
    activity = request.get("activity", {})

    return {
        "points_earned": 50,
        "level_up": False,
        "new_achievements": [
            {
                "id": "focus_master",
                "title": "Focus Master",
                "description": "Completed 1 hour of focused learning",
                "icon": "🎯",
                "category": "focus",
                "points": 100,
                "rarity": "rare",
                "unlocked": True,
                "unlocked_date": datetime.now().isoformat(),
                "progress_percentage": 100
            }
        ],
        "new_badges": []
    }

@app.get("/gamification/achievements/{user_id}")
async def get_user_achievements(user_id: str, category: Optional[str] = None):
    """Get user achievements"""
    return [
        {
            "id": "first_lesson",
            "title": "First Steps",
            "description": "Complete your first lesson",
            "icon": "🌟",
            "category": "learning",
            "points": 25,
            "rarity": "common",
            "requirements": [{"type": "lessons_completed", "target": 1, "current": 1}],
            "unlocked": True,
            "unlocked_date": "2024-01-01T10:00:00Z",
            "progress_percentage": 100
        },
        {
            "id": "focus_warrior",
            "title": "Focus Warrior",
            "description": "Focus for 30 minutes without interruption",
            "icon": "⚔️",
            "category": "focus",
            "points": 100,
            "rarity": "rare",
            "requirements": [{"type": "continuous_focus", "target": 1800, "current": 1200}],
            "unlocked": False,
            "progress_percentage": 67
        }
    ]

@app.get("/gamification/leaderboard")
async def get_leaderboard(
    period: str = "weekly",
    category: str = "points",
    limit: int = 50
):
    """Get leaderboard"""
    return {
        "period": period,
        "category": category,
        "entries": [
            {
                "rank": 1,
                "user_id": "user_123",
                "username": "StudyChamp",
                "avatar_url": "https://example.com/avatars/user123.jpg",
                "score": 3500,
                "change_from_last": 2,
                "badges": ["focus_master", "streak_keeper"]
            },
            {
                "rank": 2,
                "user_id": "user_456",
                "username": "LearningStar",
                "avatar_url": "https://example.com/avatars/user456.jpg",
                "score": 3200,
                "change_from_last": -1,
                "badges": ["quick_learner", "consistent"]
            }
        ],
        "user_rank": 15,
        "total_participants": 1247
    }

# LEARNING CARDS API WITH AGENT SYSTEM
@app.post("/learning", response_model=Learning)
async def create_learning_card(
    learning_data: LearningCreate,
    background_tasks: BackgroundTasks
):
    """Create a new learning card with AI agent processing"""
    try:
        # Create learning card
        learning_id = str(uuid.uuid4())
        learning = Learning(
            id=learning_id,
            session_id=learning_data.session_id,
            content=learning_data.content,
            role=learning_data.role,
            created_at=datetime.now(),
            resources=[],
            quiz=[],
            processed=False
        )

        # Store in memory (in production, use database)
        learning_cards_storage[learning_id] = learning

        # Start background agent processing
        background_tasks.add_task(process_learning_card_with_agents, learning_id)

        print(f"📚 Created learning card: {learning_id}")
        print(f"   Content: {learning_data.content[:100]}...")

        return learning

    except Exception as e:
        print(f"Error creating learning card: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create learning card: {str(e)}")

async def process_learning_card_with_agents(learning_id: str):
    """Background task to process learning card with AI agents"""
    try:
        learning = learning_cards_storage.get(learning_id)
        if not learning:
            print(f"Learning card {learning_id} not found")
            return

        print(f"🤖 Starting agent processing for learning card: {learning_id}")

        # Process with agent system, passing the role for context
        result = await process_learning_with_agents(learning.content, learning_id, learning.role)

        # Update learning card with results
        learning.resources = result.get("resources", [])
        learning.quiz = result.get("quiz", [])
        learning.processed = True

        # Update in storage
        learning_cards_storage[learning_id] = learning

        print(f"✅ Completed agent processing for learning card: {learning_id}")

    except Exception as e:
        print(f"❌ Error processing learning card {learning_id}: {e}")
        # Mark as processed even if failed, with fallback content
        if learning_id in learning_cards_storage:
            learning = learning_cards_storage[learning_id]
            learning.resources = generate_mock_resources(learning.content)
            learning.quiz = generate_fallback_quiz(learning.content)
            learning.processed = True
            learning_cards_storage[learning_id] = learning

@app.get("/learning", response_model=List[Learning])
async def get_learning_cards(
    session_id: Optional[str] = None,
    limit: int = 50
):
    """Get learning cards, optionally filtered by session"""
    try:
        cards = list(learning_cards_storage.values())

        # Filter by session if provided
        if session_id:
            cards = [card for card in cards if card.session_id == session_id]

        # Sort by creation date (newest first)
        cards.sort(key=lambda x: x.created_at, reverse=True)

        # Limit results
        cards = cards[:limit]

        print(f"📚 Retrieved {len(cards)} learning cards")
        return cards

    except Exception as e:
        print(f"Error retrieving learning cards: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve learning cards: {str(e)}")

@app.get("/learning/{learning_id}", response_model=Learning)
async def get_learning_card(learning_id: str):
    """Get a specific learning card by ID"""
    try:
        learning = learning_cards_storage.get(learning_id)
        if not learning:
            raise HTTPException(status_code=404, detail="Learning card not found")

        return learning

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving learning card {learning_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve learning card: {str(e)}")

@app.delete("/learning/{learning_id}")
async def delete_learning_card(learning_id: str):
    """Delete a learning card"""
    try:
        if learning_id not in learning_cards_storage:
            raise HTTPException(status_code=404, detail="Learning card not found")

        del learning_cards_storage[learning_id]
        print(f"🗑️ Deleted learning card: {learning_id}")

        return {"message": "Learning card deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting learning card {learning_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete learning card: {str(e)}")

@app.post("/learning/{learning_id}/regenerate")
async def regenerate_learning_content(
    learning_id: str,
    background_tasks: BackgroundTasks
):
    """Regenerate resources and quiz for a learning card"""
    try:
        learning = learning_cards_storage.get(learning_id)
        if not learning:
            raise HTTPException(status_code=404, detail="Learning card not found")

        # Reset processing status
        learning.processed = False
        learning.resources = []
        learning.quiz = []

        # Start background processing
        background_tasks.add_task(process_learning_card_with_agents, learning_id)

        print(f"🔄 Regenerating content for learning card: {learning_id}")

        return {"message": "Content regeneration started", "learning_id": learning_id}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error regenerating learning card {learning_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to regenerate learning card: {str(e)}")

# DIGITAL BRIDGE API - COMPREHENSIVE RURAL EDUCATION PLATFORM

# Edge Computing Functions
def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula"""
    import math

    R = 6371  # Earth's radius in kilometers

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)

    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def find_nearest_edge_node(user_location: Dict[str, float]) -> Optional[EdgeNode]:
    """Find the nearest edge node to a user's location"""
    if not user_location or not edge_nodes:
        return None

    nearest_node = None
    min_distance = float('inf')

    for node in edge_nodes.values():
        if node.status == "online":
            distance = calculate_distance(
                user_location["lat"], user_location["lng"],
                node.location["lat"], node.location["lng"]
            )
            if distance < min_distance:
                min_distance = distance
                nearest_node = node

    return nearest_node

async def process_sms_message(phone_number: str, message: str, language: str = "en") -> str:
    """Process incoming SMS message and generate appropriate response"""
    try:
        # Create SMS interaction record
        interaction = SMSInteraction(
            phone_number=phone_number,
            message_type="query",
            content=message,
            language=language
        )
        sms_interactions[interaction.interaction_id] = interaction

        # Simple keyword-based responses (in production, use NLP/AI)
        message_lower = message.lower()

        if any(word in message_lower for word in ["help", "madad", "sahayata"]):
            response = "📚 Learning Help: Reply with MATH, SCIENCE, or ENGLISH for study materials. Reply MENTOR for peer connections."
        elif any(word in message_lower for word in ["math", "ganit", "mathematics"]):
            response = "🔢 Math resources available! Reply GRADE followed by your class (e.g., GRADE 8) for materials."
        elif any(word in message_lower for word in ["science", "vigyan"]):
            response = "🔬 Science content ready! Reply GRADE followed by your class for experiments and lessons."
        elif any(word in message_lower for word in ["english", "angrezi"]):
            response = "📖 English learning materials available! Reply GRADE followed by your class."
        elif any(word in message_lower for word in ["mentor", "teacher", "guru"]):
            response = "👨‍🏫 Connecting you with nearby mentors and study groups. Reply LOCATION with your village name."
        elif "grade" in message_lower:
            grade = "".join(filter(str.isdigit, message))
            if grade:
                response = f"📚 Grade {grade} materials found! Visit your nearest learning hub or reply HUB for locations."
            else:
                response = "Please specify your grade (e.g., GRADE 8)"
        elif any(word in message_lower for word in ["hub", "center", "kendra"]):
            response = "🏫 Nearest learning hubs: Anantapur Center (5km), Salem Hub (12km). Reply SCHEDULE for timings."
        elif any(word in message_lower for word in ["schedule", "time", "samay"]):
            response = "⏰ Hub Schedule: Mon-Fri 9AM-5PM, Sat 10AM-4PM. Mobile unit visits Tuesdays 2-5PM."
        else:
            response = "📱 Welcome to Digital Bridge! Reply HELP for options, MATH/SCIENCE/ENGLISH for subjects, or HUB for locations."

        # Create response interaction
        response_interaction = SMSInteraction(
            phone_number=phone_number,
            message_type="response",
            content=response,
            language=language,
            response_sent=True
        )
        sms_interactions[response_interaction.interaction_id] = response_interaction

        return response

    except Exception as e:
        print(f"Error processing SMS: {e}")
        return "Sorry, there was an error processing your message. Please try again."

# User Profile Management
@app.post("/digital-bridge/users/register")
async def register_user(user_data: dict):
    """Register a new user in the Digital Bridge system"""
    try:
        user_profile = UserProfile(
            user_id=user_data.get("user_id", str(uuid.uuid4())),
            name=user_data["name"],
            grade=user_data["grade"],
            region=user_data["region"],
            languages=user_data["languages"],
            location=user_data.get("location"),
            phone_number=user_data.get("phone_number"),
            device_type=user_data.get("device_type", "mobile"),
            connectivity=user_data.get("connectivity", "low"),
            learning_preferences=user_data.get("learning_preferences", []),
            mentorship_status=user_data.get("mentorship_status", "learner")
        )

        user_profiles[user_profile.user_id] = user_profile

        print(f"👤 Registered new user: {user_profile.name} in {user_profile.region}")

        return {
            "status": "success",
            "user_id": user_profile.user_id,
            "message": "User registered successfully",
            "nearest_hub": find_nearest_hub(user_profile.location) if user_profile.location else None
        }

    except Exception as e:
        print(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to register user: {str(e)}")

def find_nearest_hub(user_location: Dict[str, float]) -> Optional[Dict]:
    """Find the nearest community hub to a user"""
    if not user_location:
        return None

    nearest_hub = None
    min_distance = float('inf')

    for hub in community_hubs.values():
        distance = calculate_distance(
            user_location["lat"], user_location["lng"],
            hub.location["lat"], hub.location["lng"]
        )
        if distance < min_distance:
            min_distance = distance
            nearest_hub = {
                "hub_id": hub.hub_id,
                "name": hub.name,
                "distance_km": round(distance, 2),
                "location": hub.location,
                "contact_info": hub.contact_info
            }

    return nearest_hub

@app.get("/digital-bridge/users/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile information"""
    if user_id not in user_profiles:
        raise HTTPException(status_code=404, detail="User not found")

    return user_profiles[user_id]

# Peer Discovery and Connections
@app.get("/digital-bridge/peers/discover")
async def discover_peers(
    user_id: str,
    radius_km: int = 50,
    grade: Optional[str] = None,
    subject: Optional[str] = None
):
    """Discover nearby peers for learning and mentorship"""
    try:
        if user_id not in user_profiles:
            raise HTTPException(status_code=404, detail="User not found")

        user = user_profiles[user_id]
        if not user.location:
            raise HTTPException(status_code=400, detail="User location not available")

        nearby_peers = []

        for peer_id, peer in user_profiles.items():
            if peer_id == user_id or not peer.location:
                continue

            distance = calculate_distance(
                user.location["lat"], user.location["lng"],
                peer.location["lat"], peer.location["lng"]
            )

            if distance <= radius_km:
                # Filter by grade if specified
                if grade and peer.grade != grade:
                    continue

                # Check for shared subjects
                shared_subjects = []
                if subject:
                    if subject in peer.learning_preferences:
                        shared_subjects.append(subject)
                else:
                    shared_subjects = list(set(user.learning_preferences) & set(peer.learning_preferences))

                peer_info = {
                    "user_id": peer.user_id,
                    "name": peer.name,
                    "grade": peer.grade,
                    "distance_km": round(distance, 2),
                    "shared_subjects": shared_subjects,
                    "mentorship_status": peer.mentorship_status,
                    "languages": peer.languages,
                    "connectivity": peer.connectivity,
                    "last_active": datetime.now().isoformat()  # Mock data
                }

                nearby_peers.append(peer_info)

        # Sort by distance
        nearby_peers.sort(key=lambda x: x["distance_km"])

        print(f"🔍 Found {len(nearby_peers)} peers within {radius_km}km for user {user_id}")

        return {
            "user_location": user.location,
            "search_radius_km": radius_km,
            "peers_found": len(nearby_peers),
            "peers": nearby_peers[:20]  # Limit to 20 results
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error discovering peers: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to discover peers: {str(e)}")

@app.post("/digital-bridge/peers/connect")
async def connect_with_peer(connection_data: dict):
    """Create a peer connection for learning or mentorship"""
    try:
        user1_id = connection_data["user1_id"]
        user2_id = connection_data["user2_id"]
        connection_type = connection_data.get("connection_type", "peer")

        if user1_id not in user_profiles or user2_id not in user_profiles:
            raise HTTPException(status_code=404, detail="One or both users not found")

        user1 = user_profiles[user1_id]
        user2 = user_profiles[user2_id]

        # Calculate distance
        distance = 0.0
        if user1.location and user2.location:
            distance = calculate_distance(
                user1.location["lat"], user1.location["lng"],
                user2.location["lat"], user2.location["lng"]
            )

        # Find shared subjects
        shared_subjects = list(set(user1.learning_preferences) & set(user2.learning_preferences))

        connection = PeerConnection(
            user1_id=user1_id,
            user2_id=user2_id,
            connection_type=connection_type,
            shared_subjects=shared_subjects,
            distance_km=distance
        )

        peer_connections[connection.connection_id] = connection

        print(f"🤝 Created {connection_type} connection between {user1.name} and {user2.name}")

        return {
            "status": "success",
            "connection_id": connection.connection_id,
            "connection_type": connection_type,
            "shared_subjects": shared_subjects,
            "distance_km": round(distance, 2),
            "message": f"Successfully connected with {user2.name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating peer connection: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create connection: {str(e)}")

# SMS Tracking and Communication
@app.post("/digital-bridge/sms/send")
async def send_sms_message(sms_data: dict):
    """Send SMS message to user (mock implementation)"""
    try:
        phone_number = sms_data["phone_number"]
        message = sms_data["message"]
        language = sms_data.get("language", "en")

        # In production, integrate with Twilio or similar SMS service
        interaction = SMSInteraction(
            phone_number=phone_number,
            message_type="notification",
            content=message,
            language=language,
            response_sent=True
        )
        sms_interactions[interaction.interaction_id] = interaction

        print(f"📱 SMS sent to {phone_number}: {message[:50]}...")

        return {
            "status": "success",
            "interaction_id": interaction.interaction_id,
            "message": "SMS sent successfully"
        }

    except Exception as e:
        print(f"Error sending SMS: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")

@app.post("/digital-bridge/sms/receive")
async def receive_sms_message(sms_data: dict):
    """Receive and process incoming SMS message"""
    try:
        phone_number = sms_data["phone_number"]
        message = sms_data["message"]
        language = sms_data.get("language", "en")

        # Process the message and generate response
        response = await process_sms_message(phone_number, message, language)

        print(f"📱 Processed SMS from {phone_number}: {message[:50]}...")

        return {
            "status": "success",
            "response": response,
            "auto_reply": True
        }

    except Exception as e:
        print(f"Error processing SMS: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process SMS: {str(e)}")

@app.get("/digital-bridge/sms/history/{phone_number}")
async def get_sms_history(phone_number: str, limit: int = 50):
    """Get SMS interaction history for a phone number"""
    try:
        history = []
        for interaction in sms_interactions.values():
            if interaction.phone_number == phone_number:
                history.append({
                    "interaction_id": interaction.interaction_id,
                    "message_type": interaction.message_type,
                    "content": interaction.content,
                    "language": interaction.language,
                    "timestamp": interaction.timestamp.isoformat(),
                    "response_sent": interaction.response_sent
                })

        # Sort by timestamp (newest first)
        history.sort(key=lambda x: x["timestamp"], reverse=True)

        return {
            "phone_number": phone_number,
            "total_interactions": len(history),
            "history": history[:limit]
        }

    except Exception as e:
        print(f"Error getting SMS history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get SMS history: {str(e)}")

# Community Learning Hubs
@app.get("/digital-bridge/hubs/nearby")
async def find_nearby_hubs(
    latitude: float,
    longitude: float,
    radius_km: int = 50,
    language: Optional[str] = None
):
    """Find nearby community learning hubs"""
    try:
        user_location = {"lat": latitude, "lng": longitude}
        nearby_hubs = []

        for hub in community_hubs.values():
            distance = calculate_distance(
                latitude, longitude,
                hub.location["lat"], hub.location["lng"]
            )

            if distance <= radius_km:
                # Filter by language if specified
                if language and language not in hub.languages:
                    continue

                hub_info = {
                    "hub_id": hub.hub_id,
                    "name": hub.name,
                    "distance_km": round(distance, 2),
                    "location": hub.location,
                    "region": hub.region,
                    "languages": hub.languages,
                    "capacity": hub.capacity,
                    "current_users": hub.current_users,
                    "availability": f"{hub.capacity - hub.current_users} spots available",
                    "connectivity_type": hub.connectivity_type,
                    "resources": hub.resources,
                    "operating_hours": hub.operating_hours,
                    "contact_info": hub.contact_info,
                    "status": hub.status
                }
                nearby_hubs.append(hub_info)

        # Sort by distance
        nearby_hubs.sort(key=lambda x: x["distance_km"])

        print(f"🏫 Found {len(nearby_hubs)} hubs within {radius_km}km")

        return {
            "search_location": user_location,
            "search_radius_km": radius_km,
            "hubs_found": len(nearby_hubs),
            "hubs": nearby_hubs
        }

    except Exception as e:
        print(f"Error finding nearby hubs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to find nearby hubs: {str(e)}")

@app.post("/digital-bridge/hubs/{hub_id}/checkin")
async def checkin_to_hub(hub_id: str, user_data: dict):
    """Check in to a community hub"""
    try:
        if hub_id not in community_hubs:
            raise HTTPException(status_code=404, detail="Hub not found")

        hub = community_hubs[hub_id]
        user_id = user_data["user_id"]

        if hub.current_users >= hub.capacity:
            raise HTTPException(status_code=400, detail="Hub is at full capacity")

        # Update hub occupancy
        hub.current_users += 1
        community_hubs[hub_id] = hub

        print(f"✅ User {user_id} checked in to {hub.name}")

        return {
            "status": "success",
            "hub_name": hub.name,
            "current_occupancy": f"{hub.current_users}/{hub.capacity}",
            "available_resources": hub.resources,
            "message": f"Successfully checked in to {hub.name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error checking in to hub: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to check in: {str(e)}")

# Mobile Learning Units
@app.get("/digital-bridge/mobile-units/nearby")
async def find_nearby_mobile_units(
    latitude: float,
    longitude: float,
    radius_km: int = 100
):
    """Find nearby mobile learning units"""
    try:
        user_location = {"lat": latitude, "lng": longitude}
        nearby_units = []

        for unit in mobile_units.values():
            distance = calculate_distance(
                latitude, longitude,
                unit.current_location["lat"], unit.current_location["lng"]
            )

            if distance <= radius_km:
                unit_info = {
                    "unit_id": unit.unit_id,
                    "name": unit.name,
                    "distance_km": round(distance, 2),
                    "current_location": unit.current_location,
                    "capacity": unit.capacity,
                    "current_students": unit.current_students,
                    "availability": f"{unit.capacity - unit.current_students} spots available",
                    "subjects": unit.subjects,
                    "languages": unit.languages,
                    "equipment": unit.equipment,
                    "status": unit.status,
                    "schedule": unit.schedule,
                    "next_stops": unit.route[:3]  # Next 3 stops
                }
                nearby_units.append(unit_info)

        # Sort by distance
        nearby_units.sort(key=lambda x: x["distance_km"])

        print(f"🚐 Found {len(nearby_units)} mobile units within {radius_km}km")

        return {
            "search_location": user_location,
            "search_radius_km": radius_km,
            "units_found": len(nearby_units),
            "mobile_units": nearby_units
        }

    except Exception as e:
        print(f"Error finding mobile units: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to find mobile units: {str(e)}")

@app.get("/digital-bridge/mobile-units/{unit_id}/schedule")
async def get_mobile_unit_schedule(unit_id: str):
    """Get schedule for a specific mobile learning unit"""
    try:
        if unit_id not in mobile_units:
            raise HTTPException(status_code=404, detail="Mobile unit not found")

        unit = mobile_units[unit_id]

        return {
            "unit_id": unit.unit_id,
            "name": unit.name,
            "current_location": unit.current_location,
            "schedule": unit.schedule,
            "route": unit.route,
            "subjects": unit.subjects,
            "languages": unit.languages,
            "capacity": unit.capacity,
            "current_students": unit.current_students
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting mobile unit schedule: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get schedule: {str(e)}")

# Content Packages and Offline Learning
@app.get("/digital-bridge/content/packages")
async def get_content_packages(
    grade: Optional[str] = None,
    subject: Optional[str] = None,
    language: Optional[str] = None,
    region: Optional[str] = None,
    offline_only: bool = False
):
    """Get available content packages for offline learning"""
    try:
        filtered_packages = []

        for package in content_packages.values():
            # Apply filters
            if grade and package.grade != grade:
                continue
            if subject and package.subject != subject:
                continue
            if language and package.language != language:
                continue
            if region and package.region != region:
                continue
            if offline_only and not package.offline_capable:
                continue

            package_info = {
                "package_id": package.package_id,
                "title": package.title,
                "subject": package.subject,
                "grade": package.grade,
                "language": package.language,
                "region": package.region,
                "content_type": package.content_type,
                "size_mb": package.size_mb,
                "offline_capable": package.offline_capable,
                "prerequisites": package.prerequisites,
                "learning_objectives": package.learning_objectives,
                "estimated_duration": package.estimated_duration,
                "difficulty_level": package.difficulty_level,
                "created_by": package.created_by,
                "version": package.version,
                "download_count": package.download_count,
                "rating": package.rating
            }
            filtered_packages.append(package_info)

        # Sort by rating and download count
        filtered_packages.sort(key=lambda x: (x["rating"], x["download_count"]), reverse=True)

        print(f"📦 Found {len(filtered_packages)} content packages")

        return {
            "filters_applied": {
                "grade": grade,
                "subject": subject,
                "language": language,
                "region": region,
                "offline_only": offline_only
            },
            "packages_found": len(filtered_packages),
            "packages": filtered_packages
        }

    except Exception as e:
        print(f"Error getting content packages: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get content packages: {str(e)}")

@app.post("/digital-bridge/content/download")
async def download_content_package(download_data: dict):
    """Start downloading a content package"""
    try:
        package_id = download_data["package_id"]
        user_id = download_data["user_id"]

        if package_id not in content_packages:
            raise HTTPException(status_code=404, detail="Content package not found")

        package = content_packages[package_id]

        # Find nearest edge node for optimal download
        user_location = None
        if user_id in user_profiles:
            user_location = user_profiles[user_id].location

        edge_node = find_nearest_edge_node(user_location) if user_location else None

        download_id = f"download_{uuid.uuid4()}"

        # Simulate download process
        download_info = {
            "download_id": download_id,
            "package_id": package_id,
            "package_title": package.title,
            "size_mb": package.size_mb,
            "estimated_time_minutes": round(package.size_mb / 2, 1),  # Assume 2MB/min
            "edge_node": edge_node.node_id if edge_node else None,
            "status": "started",
            "progress": 0
        }

        print(f"📥 Started download: {package.title} ({package.size_mb}MB)")

        return download_info

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting download: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start download: {str(e)}")

# Edge Computing and Caching
@app.get("/digital-bridge/edge/nodes")
async def get_edge_nodes(region: Optional[str] = None):
    """Get information about edge computing nodes"""
    try:
        filtered_nodes = []

        for node in edge_nodes.values():
            if region and node.region != region:
                continue

            node_info = {
                "node_id": node.node_id,
                "location": node.location,
                "region": node.region,
                "capacity_gb": node.capacity_gb,
                "used_storage_gb": node.used_storage_gb,
                "available_storage_gb": node.capacity_gb - node.used_storage_gb,
                "storage_utilization": round((node.used_storage_gb / node.capacity_gb) * 100, 1),
                "bandwidth_mbps": node.bandwidth_mbps,
                "connected_devices": node.connected_devices,
                "max_devices": node.max_devices,
                "device_utilization": round((node.connected_devices / node.max_devices) * 100, 1),
                "status": node.status,
                "last_sync": node.last_sync.isoformat(),
                "cached_content": node.cached_content
            }
            filtered_nodes.append(node_info)

        return {
            "region_filter": region,
            "nodes_found": len(filtered_nodes),
            "edge_nodes": filtered_nodes
        }

    except Exception as e:
        print(f"Error getting edge nodes: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get edge nodes: {str(e)}")

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0-digital-bridge",
        "agent_system": {
            "openai_available": OPENAI_AVAILABLE,
            "tavily_available": bool(TAVILY_API_KEY)
        },
        "digital_bridge": {
            "users_registered": len(user_profiles),
            "community_hubs": len(community_hubs),
            "mobile_units": len(mobile_units),
            "peer_connections": len(peer_connections),
            "content_packages": len(content_packages),
            "edge_nodes": len(edge_nodes),
            "sms_interactions": len(sms_interactions)
        },
        "learning_cards_count": len(learning_cards_storage)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
