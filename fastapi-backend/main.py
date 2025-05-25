from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime, timedelta
import json
import asyncio
import uuid
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer, ForeignKey, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.documents import Document
import redis

# Load environment variables
load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/autopom")
# Fallback to SQLite if PostgreSQL is not available
try:
    import psycopg2
    # Test PostgreSQL connection
    conn = psycopg2.connect(DATABASE_URL)
    conn.close()
except Exception as e:
    print(f"PostgreSQL connection failed: {e}")
    print("Falling back to SQLite database")
    DATABASE_URL = "sqlite:///./autopom.db"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174,*").split(",")

# Database setup
Base = declarative_base()

class DBSession(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    events = relationship("DBEvent", back_populates="session", cascade="all, delete-orphan")
    learnings = relationship("DBLearning", back_populates="session", cascade="all, delete-orphan")

class DBEvent(Base):
    __tablename__ = "events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    type = Column(String, nullable=False)  # start, stop, tabSwitch, idle, active
    time = Column(DateTime, nullable=False)
    details = Column(Text, nullable=True)
    session = relationship("DBSession", back_populates="events")

class DBLearning(Base):
    __tablename__ = "learnings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    role = Column(String, nullable=False, default="student")
    resources = Column(JSON, nullable=True)
    quiz = Column(JSON, nullable=True)
    processed = Column(Boolean, nullable=False, default=False)
    session = relationship("DBSession", back_populates="learnings")

# Create database tables
engine = create_engine(DATABASE_URL)
try:
    Base.metadata.create_all(engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Error creating database tables: {e}")

# Create database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Redis for pub/sub
try:
    redis_client = redis.from_url(REDIS_URL)
    redis_client.ping()  # Test connection
    pubsub = redis_client.pubsub()
    print("Redis connection established")
except Exception as e:
    print(f"Error connecting to Redis: {e}")
    # Create in-memory fallback for Redis
    print("Using in-memory fallback for Redis")
    class InMemoryRedis:
        def __init__(self):
            self.data = {}
            self.subscribers = {}
        
        def set(self, key, value):
            self.data[key] = value
            return True
        
        def get(self, key):
            return self.data.get(key)
        
        def ping(self):
            return True
            
        def publish(self, channel, message):
            if channel in self.subscribers:
                for callback in self.subscribers[channel]:
                    callback({"type": "message", "data": message, "channel": channel})
            return 0
        
        def pubsub(self):
            return InMemoryPubSub(self)
    
    class InMemoryPubSub:
        def __init__(self, redis):
            self.redis = redis
            self.channels = set()
            self.subscribed = False
        
        def subscribe(self, *channels):
            self.subscribed = True
            for channel in channels:
                self.channels.add(channel)
                if channel not in self.redis.subscribers:
                    self.redis.subscribers[channel] = []
        
        def unsubscribe(self, *channels):
            self.subscribed = False
            if not channels:
                self.channels = set()
            else:
                for channel in channels:
                    self.channels.discard(channel)
        
        def get_message(self, timeout=None):
            return None  # Non-blocking, just check in the WebSocket loop
            
        def execute_command(self, *args, **kwargs):
            # Mock method to handle Redis commands
            return None
    
    redis_client = InMemoryRedis()
    pubsub = redis_client.pubsub()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app
app = FastAPI(title="AutoPom API")

# Add CORS middleware with configurable origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]  # Expose all headers
)

# WebSocket connections
active_connections: List[WebSocket] = []

# Models
class Event(BaseModel):
    type: str  # start, stop, tabSwitch, idle, active
    session_id: str
    time: datetime
    details: Optional[str] = None

class EventCreate(BaseModel):
    type: str
    session_id: str
    time: str
    details: Optional[str] = None

class Session(BaseModel):
    id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None  # in seconds
    interruptions: List[Dict[str, Any]] = []

class Learning(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    role: str = "student"
    resources: Optional[List[Dict[str, str]]] = None
    quiz: Optional[List[Dict[str, Any]]] = None

class LearningCreate(BaseModel):
    session_id: str
    content: str
    role: Optional[str] = "student"  # student, researcher, professional

class AnalyticsResponse(BaseModel):
    total_sessions: int
    total_focus_time: int  # in seconds
    avg_session_length: float  # in seconds
    avg_interruptions: float
    peak_focus_hours: List[int]
    interruption_heatmap: Dict[str, int]

class LearningResource(BaseModel):
    title: str
    url: str
    type: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str

# Helper functions
async def process_learning(learning_id: str, db: Session):
    """Process learning with LangChain, Tavily, and OpenAI"""
    try:
        learning = db.query(DBLearning).filter(DBLearning.id == learning_id).first()
        if not learning or learning.processed:
            return
        
        # Initialize Tavily search tool
        search_tool = TavilySearchResults(max_results=5)
        
        # Customize search based on role
        role_modifiers = {
            "student": "educational resources for students",
            "researcher": "academic papers and research materials",
            "professional": "professional resources and practical applications"
        }
        role_modifier = role_modifiers.get(learning.role, role_modifiers["student"])
        
        # Search for relevant content
        search_results = await asyncio.to_thread(
            search_tool.invoke,
            f"{learning.content} {role_modifier}"
        )
        
        # Convert search results to resources
        resources = []
        for result in search_results:
            resource_type = "article"
            if "youtube.com" in result.get("url", ""):
                resource_type = "video"
            elif ".pdf" in result.get("url", ""):
                resource_type = "pdf"
                
            resources.append({
                "title": result.get("title", "Untitled"),
                "url": result.get("url", ""),
                "type": resource_type,
                "snippet": result.get("content", "")[:200] + "..."
            })
        
        # Update learning with resources
        learning.resources = resources
        
        # Generate quiz - improved fallback mechanism when OpenAI isn't available
        try:
            # Try to use OpenAI if API key is available
            if OPENAI_API_KEY:
                try:
                    llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
                    
                    # Create documents from learning content and resources
                    docs = [
                        Document(
                            page_content=learning.content,
                            metadata={"source": "user_learning"}
                        )
                    ]
                    
                    for resource in resources:
                        docs.append(
                            Document(
                                page_content=resource.get("snippet", ""),
                                metadata={"source": resource.get("url", "")}
                            )
                        )
                    
                    # Quiz generation prompt
                    prompt = ChatPromptTemplate.from_template(
                        """You are an expert educator creating quiz questions for learning assessment.

Based on the following learning content, create 3 multiple-choice quiz questions:

Learning content: {context}

Each question should:
1. Be clear and directly related to the content
2. Have 4 possible answers (labeled as options)
3. Have only one correct answer
4. Include a brief explanation for the correct answer

Format your response as a valid JSON array with no additional text. Each object should have these exact keys: "question", "options", "answer", and "explanation".

Example format:
[
  {{
    "question": "What is the main advantage of Python?",
    "options": ["Complex syntax", "Machine-level execution", "Readability and simplicity", "Limited library support"],
    "answer": "Readability and simplicity",
    "explanation": "Python is known for its clean, readable syntax that makes it accessible to beginners."
  }}
]
"""
                    )
                    
                    # Create document chain
                    document_chain = create_stuff_documents_chain(llm, prompt)
                    
                    # Generate quiz
                    quiz_response = await asyncio.to_thread(
                        document_chain.invoke,
                        {"context": docs}
                    )
                    
                    try:
                        quiz = json.loads(quiz_response)
                        learning.quiz = quiz
                        print("Successfully generated quiz with OpenAI")
                    except Exception as e:
                        print(f"Failed to parse OpenAI quiz response: {e}")
                        raise
                except Exception as e:
                    print(f"Error generating quiz with OpenAI: {e}")
                    raise
            else:
                print("No OpenAI API key available, using fallback quiz generation")
                raise ValueError("OpenAI API key not configured")
        except Exception as e:
            print(f"Using fallback quiz generation: {e}")
            # Generate meaningful fallback quiz based on content
            content = learning.content
            words = content.split()
            
            # Extract key terms for quiz questions
            key_terms = []
            for word in words:
                # Consider words longer than 5 characters that aren't common words
                if len(word) > 5 and word.lower() not in ["should", "would", "could", "about", "there", "their", "these", "those"]:
                    key_terms.append(word.strip(",.?!\"'()[]{}"))
            
            # Use the most interesting terms (avoid duplicates)
            unique_terms = list(set(key_terms))[:3]
            
            # If we don't have enough terms, add generic ones
            while len(unique_terms) < 3:
                unique_terms.append("concept")
            
            # Generate quiz questions based on the content
            quiz = []
            
            for i, term in enumerate(unique_terms[:3]):
                # Create a question related to the term
                question = f"What is the significance of '{term}' in this content?"
                
                # Create plausible but distinct options
                options = [
                    f"It's a fundamental principle related to {unique_terms[(i+1) % len(unique_terms)]}", 
                    f"It represents a key challenge in this domain",
                    f"It's an important concept mentioned in the content",
                    f"It's not particularly relevant to the main topic"
                ]
                
                # Add the question to our quiz
                quiz.append({
                    "question": question,
                    "options": options,
                    "answer": options[2],  # Always use the third option as the correct one
                    "explanation": f"The term '{term}' is explicitly mentioned in the learning content and represents an important concept."
                })
            
            learning.quiz = quiz
        
        # Mark as processed and save
        learning.processed = True
        db.commit()
        
        # Publish to Redis and WebSocket
        learning_data = {
            "id": learning.id,
            "session_id": learning.session_id,
            "content": learning.content,
            "created_at": learning.created_at.isoformat(),
            "role": learning.role,
            "resources": learning.resources,
            "quiz": learning.quiz,
            "processed": learning.processed
        }
        
        if redis_client:
            redis_client.publish("learning-updates", json.dumps({
                "type": "learning_processed", 
                "data": learning_data
            }))
        
        await broadcast_learning_update(learning_data)
        
    except Exception as e:
        print(f"Error processing learning {learning_id}: {e}")
        db.rollback()

# Routes
@app.post("/events", status_code=201)
async def create_events(events: List[EventCreate], db: Session = Depends(get_db)):
    """Record batch of events from the client"""
    processed_events = []
    session_cache = {}
    
    try:
        for event_data in events:
            # Parse datetime
            event_time = datetime.fromisoformat(event_data.time.replace('Z', '+00:00'))
            
            # Create event model
            event = Event(
                type=event_data.type,
                session_id=event_data.session_id,
                time=event_time,
                details=event_data.details
            )
            
            # Store in database
            db_event = DBEvent(
                id=str(uuid.uuid4()),
                session_id=event.session_id,
                type=event.type,
                time=event.time,
                details=event.details
            )
            db.add(db_event)
            
            # Create or update session
            if event.type == "start":
                # Check if session exists
                session = db.query(DBSession).filter(DBSession.id == event.session_id).first()
                if not session:
                    session = DBSession(
                        id=event.session_id,
                        start_time=event.time
                    )
                    db.add(session)
                session_cache[event.session_id] = session
                
            elif event.type == "stop":
                # Find and update session
                session = session_cache.get(event.session_id)
                if not session:
                    session = db.query(DBSession).filter(DBSession.id == event.session_id).first()
                
                if session:
                    session.end_time = event.time
                    if session.start_time:
                        duration = (session.end_time - session.start_time).total_seconds()
                        session.duration = int(duration)
            
            processed_events.append(event)
            
            # Publish to Redis if available
            try:
                if redis_client and hasattr(redis_client, 'publish'):
                    redis_client.publish("events", json.dumps({
                        "type": event.type,
                        "session_id": event.session_id,
                        "time": event.time.isoformat(),
                        "details": event.details
                    }))
            except Exception as e:
                print(f"Failed to publish to Redis: {e}")
                # Continue processing - Redis is optional
        
        # Commit to database
        db.commit()
        
        # Broadcast events to WebSocket clients
        for event in processed_events:
            await broadcast_event(event)
    
        return {"status": "success", "count": len(processed_events)}
    except Exception as e:
        db.rollback()
        print(f"Error processing events: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing events: {str(e)}")

@app.post("/learning", response_model=Learning)
async def create_learning(
    learning_data: LearningCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new learning card with AI enrichment"""
    
    # Create learning object
    learning_id = str(uuid.uuid4())
    db_learning = DBLearning(
        id=learning_id,
        session_id=learning_data.session_id,
        content=learning_data.content,
        role=learning_data.role,
        created_at=datetime.now()
    )
    
    # Add to database
    db.add(db_learning)
    db.commit()
    db.refresh(db_learning)
    
    # Start background processing
    background_tasks.add_task(process_learning, learning_id, db)
    
    # Create response model with default values for quiz and resources
    learning = Learning(
        id=db_learning.id,
        session_id=db_learning.session_id,
        content=db_learning.content,
        created_at=db_learning.created_at,
        role=db_learning.role,
        resources=[{
            "title": "Processing your learning...",
            "url": "#",
            "type": "article"
        }],
        quiz=[{
            "question": "What is a key concept in your learning?",
            "options": [
                "Understanding core principles",
                "Exploring new ideas",
                "Building practical knowledge",
                "Developing learning strategies"
            ],
            "answer": "Exploring new ideas",
            "explanation": "Learning involves exploring new ideas to expand knowledge."
        }]
    )
    
    # Broadcast new learning to WebSocket clients
    await broadcast_learning(learning)
    
    return learning

@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    """Get analytics data for the dashboard"""
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get completed sessions in date range
    sessions = db.query(DBSession).filter(
        DBSession.start_time >= start_date,
        DBSession.start_time <= end_date,
        DBSession.end_time.isnot(None)
    ).all()
    
    if not sessions:
        return AnalyticsResponse(
            total_sessions=0,
            total_focus_time=0,
            avg_session_length=0,
            avg_interruptions=0,
            peak_focus_hours=[],
            interruption_heatmap={}
        )
    
    # Calculate analytics
    total_sessions = len(sessions)
    total_focus_time = sum(s.duration or 0 for s in sessions)
    avg_session_length = total_focus_time / total_sessions if total_sessions > 0 else 0
    
    # Calculate interruptions
    interruption_count = 0
    hour_counts = {}
    interruption_hours = {}
    
    for session in sessions:
        # Get interruptions (tab switches and idle events)
        interruptions = db.query(DBEvent).filter(
            DBEvent.session_id == session.id,
            DBEvent.type.in_(["tabSwitch", "idle", "navigation"])
        ).all()
        
        interruption_count += len(interruptions)
        
        # Count session hours
        if session.start_time:
            hour = session.start_time.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        # Count interruption hours
        for interruption in interruptions:
            hour = interruption.time.hour
            interruption_hours[hour] = interruption_hours.get(hour, 0) + 1
    
    avg_interruptions = interruption_count / total_sessions if total_sessions > 0 else 0
    
    # Find peak focus hours (hours with most sessions and least interruptions)
    hours_score = {}
    for hour in range(24):
        session_count = hour_counts.get(hour, 0)
        interruption_count = interruption_hours.get(hour, 0)
        
        if session_count > 0:
            # Calculate a focus score: more sessions and fewer interruptions = higher score
            interruption_ratio = interruption_count / session_count if session_count > 0 else 0
            focus_score = session_count * (1 - min(interruption_ratio, 1))
            hours_score[hour] = focus_score
    
    # Get top 5 hours by focus score
    peak_focus_hours = sorted(hours_score.items(), key=lambda x: x[1], reverse=True)[:5]
    peak_focus_hours = [hour for hour, _ in peak_focus_hours]
    
    # Create interruption heatmap
    interruption_heatmap = {str(hour): interruption_hours.get(hour, 0) for hour in range(24)}
    
    return AnalyticsResponse(
        total_sessions=total_sessions,
        total_focus_time=total_focus_time,
        avg_session_length=avg_session_length,
        avg_interruptions=avg_interruptions,
        peak_focus_hours=peak_focus_hours,
        interruption_heatmap=interruption_heatmap
    )

@app.get("/sessions", response_model=List[Session])
async def get_sessions(
    limit: int = Query(10, ge=1, le=100), 
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get the user's focus sessions"""
    db_sessions = db.query(DBSession).order_by(DBSession.start_time.desc()).offset(offset).limit(limit).all()
    
    sessions = []
    for db_session in db_sessions:
        # Get interruptions
        interruptions = db.query(DBEvent).filter(
            DBEvent.session_id == db_session.id,
            DBEvent.type.in_(["tabSwitch", "idle", "navigation"])
        ).all()
        
        interruptions_list = []
        for interruption in interruptions:
            interruptions_list.append({
                "type": interruption.type,
                "time": interruption.time,
                "details": interruption.details
            })
        
        sessions.append(Session(
            id=db_session.id,
            start_time=db_session.start_time,
            end_time=db_session.end_time,
            duration=db_session.duration,
            interruptions=interruptions_list
        ))
    
    return sessions

@app.get("/learnings", response_model=List[Learning])
async def get_learnings(
    limit: int = Query(20, ge=1, le=100), 
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get the user's learning cards"""
    db_learnings = db.query(DBLearning).order_by(DBLearning.created_at.desc()).offset(offset).limit(limit).all()
    
    learnings = []
    for db_learning in db_learnings:
        learnings.append(Learning(
            id=db_learning.id,
            session_id=db_learning.session_id,
            content=db_learning.content,
            created_at=db_learning.created_at,
            role=db_learning.role,
            resources=db_learning.resources,
            quiz=db_learning.quiz
        ))
    
    return learnings

# WebSocket endpoint
@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    redis_connected = False
    try:
        await websocket.accept()
        print("WebSocket client connected")
        active_connections.append(websocket)
        
        # Send welcome message
        await websocket.send_text(json.dumps({"type": "connection", "data": "Connected to AutoPom API"}))
        
        # Try to subscribe to Redis channels if available
        try:
            if redis_client and pubsub and hasattr(pubsub, 'subscribe'):
                pubsub.subscribe('events', 'learning-updates')
                redis_connected = True
                print("Subscribed to Redis channels")
        except Exception as e:
            print(f"Error subscribing to Redis: {e}")
            redis_connected = False
        
        # Keep connection alive
        while True:
            # Check Redis messages if connected
            if redis_connected:
                try:
                    message = pubsub.get_message()
                    if message and message['type'] == 'message':
                        try:
                            await websocket.send_text(message['data'].decode('utf-8'))
                        except Exception as e:
                            print(f"Error sending redis message to websocket: {e}")
                except Exception as e:
                    print(f"Error getting Redis message: {e}")
            
            # Check for incoming messages from client
            try:
                # Use wait_for_message with a short timeout to make it non-blocking
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                print(f"Received message from client: {data}")
                # Process client message if needed
            except asyncio.TimeoutError:
                # This is expected, just continue the loop
                pass
            except WebSocketDisconnect:
                print("WebSocket disconnected")
                break
            except Exception as e:
                print(f"Error receiving message: {e}")
                break
            
            # Send ping every 30 seconds to keep connection alive
            try:
                await websocket.send_text(json.dumps({"type": "ping", "time": datetime.now().isoformat()}))
            except Exception as e:
                print(f"Error sending ping: {e}")
                break
            
            # Wait before next iteration
            await asyncio.sleep(30)
            
    except WebSocketDisconnect:
        print("WebSocket disconnected during connection")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Clean up on disconnect
        if websocket in active_connections:
            active_connections.remove(websocket)
        try:
            if pubsub and hasattr(pubsub, 'unsubscribe'):
                pubsub.unsubscribe('events', 'learning-updates')
        except Exception as e:
            print(f"Error unsubscribing from Redis: {e}")
        print("WebSocket connection closed")

# WebSocket broadcast functions
async def broadcast_event(event: Event):
    """Broadcast event to all connected WebSocket clients"""
    if not active_connections:
        return
        
    message = json.dumps({
        "type": "event",
        "data": {
            "type": event.type,
            "session_id": event.session_id,
            "time": event.time.isoformat(),
            "details": event.details
        }
    })
    
    for connection in active_connections[:]:  # Create a copy of the list
        try:
            await connection.send_text(message)
        except Exception as e:
            print(f"Error broadcasting event: {e}")
            try:
                if connection in active_connections:
                    active_connections.remove(connection)
            except ValueError:
                pass

async def broadcast_learning(learning: Learning):
    """Broadcast new learning to all connected WebSocket clients"""
    for connection in active_connections[:]:  # Create a copy of the list
        try:
            await connection.send_text(json.dumps({
                "type": "learning",
                "data": learning.model_dump()
            }))
        except Exception as e:
            print(f"Error broadcasting learning: {e}")
            try:
                active_connections.remove(connection)
            except ValueError:
                pass

async def broadcast_learning_update(learning_data: Dict):
    """Broadcast learning update to all connected WebSocket clients"""
    for connection in active_connections[:]:  # Create a copy of the list
        try:
            await connection.send_text(json.dumps({
                "type": "learning_processed",
                "data": learning_data
            }))
        except Exception as e:
            print(f"Error broadcasting learning update: {e}")
            try:
                active_connections.remove(connection)
            except ValueError:
                pass

# Startup event
@app.on_event("startup")
async def startup_event():
    print("AutoPom API starting up...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)