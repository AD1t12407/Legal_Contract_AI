"""
Base Agent Class for the Agentic Learning System
Provides common functionality for all specialized agents
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """Abstract base class for all learning agents"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.agent_id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.status = "initialized"
        self.metrics = {
            'tasks_completed': 0,
            'tasks_failed': 0,
            'average_processing_time': 0.0,
            'last_activity': None
        }
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input data and return results"""
        pass
    
    async def execute_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task with error handling and metrics tracking"""
        start_time = datetime.now()
        task_id = str(uuid.uuid4())
        
        try:
            self.status = "processing"
            logger.info(f"Agent {self.name} starting task {task_id}")
            
            # Process the task
            result = await self.process(task_data)
            
            # Update metrics
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            
            self.metrics['tasks_completed'] += 1
            self.metrics['last_activity'] = end_time.isoformat()
            
            # Update average processing time
            total_tasks = self.metrics['tasks_completed'] + self.metrics['tasks_failed']
            if total_tasks > 1:
                current_avg = self.metrics['average_processing_time']
                self.metrics['average_processing_time'] = (
                    (current_avg * (total_tasks - 1) + processing_time) / total_tasks
                )
            else:
                self.metrics['average_processing_time'] = processing_time
            
            self.status = "idle"
            
            return {
                'success': True,
                'task_id': task_id,
                'agent_name': self.name,
                'result': result,
                'processing_time': processing_time,
                'timestamp': end_time.isoformat()
            }
            
        except Exception as e:
            self.metrics['tasks_failed'] += 1
            self.status = "error"
            
            logger.error(f"Agent {self.name} task {task_id} failed: {e}")
            
            return {
                'success': False,
                'task_id': task_id,
                'agent_name': self.name,
                'error': str(e),
                'processing_time': (datetime.now() - start_time).total_seconds(),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status and metrics"""
        return {
            'agent_id': self.agent_id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'metrics': self.metrics.copy()
        }
    
    def reset_metrics(self):
        """Reset agent metrics"""
        self.metrics = {
            'tasks_completed': 0,
            'tasks_failed': 0,
            'average_processing_time': 0.0,
            'last_activity': None
        }

class AgentOrchestrator:
    """Orchestrates multiple agents and manages their interactions"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.task_queue = asyncio.Queue()
        self.results_cache: Dict[str, Dict] = {}
        self.running = False
    
    def register_agent(self, agent: BaseAgent):
        """Register an agent with the orchestrator"""
        self.agents[agent.name] = agent
        logger.info(f"Registered agent: {agent.name}")
    
    def unregister_agent(self, agent_name: str):
        """Unregister an agent"""
        if agent_name in self.agents:
            del self.agents[agent_name]
            logger.info(f"Unregistered agent: {agent_name}")
    
    async def execute_agent_task(self, agent_name: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task on a specific agent"""
        if agent_name not in self.agents:
            return {
                'success': False,
                'error': f"Agent {agent_name} not found",
                'timestamp': datetime.now().isoformat()
            }
        
        agent = self.agents[agent_name]
        result = await agent.execute_task(task_data)
        
        # Cache result
        if result['success']:
            self.results_cache[result['task_id']] = result
        
        return result
    
    async def execute_workflow(self, workflow: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute a workflow of agent tasks"""
        results = []
        context = {}
        
        for step in workflow:
            agent_name = step.get('agent')
            task_data = step.get('data', {})
            
            # Add context from previous steps
            task_data['context'] = context
            
            # Execute the task
            result = await self.execute_agent_task(agent_name, task_data)
            results.append(result)
            
            # Update context with result
            if result['success']:
                context[f"{agent_name}_result"] = result['result']
            else:
                # If a step fails, decide whether to continue or stop
                if step.get('required', True):
                    logger.error(f"Required step failed: {agent_name}")
                    break
        
        return results
    
    def get_all_agent_status(self) -> Dict[str, Dict]:
        """Get status of all registered agents"""
        return {name: agent.get_status() for name, agent in self.agents.items()}
    
    def get_agent_by_capability(self, capability: str) -> Optional[BaseAgent]:
        """Find an agent by capability (simplified implementation)"""
        # This could be enhanced with a more sophisticated capability matching system
        capability_map = {
            'translation': 'LanguageSelectorAgent',
            'speech': 'SpeechAgent',
            'quiz': 'QuizAgent',
            'focus': 'FocusAgent',
            'offline': 'OfflineSyncAgent'
        }
        
        agent_name = capability_map.get(capability)
        return self.agents.get(agent_name) if agent_name else None
    
    async def start_background_processing(self):
        """Start background task processing"""
        self.running = True
        while self.running:
            try:
                # Process queued tasks
                if not self.task_queue.empty():
                    task = await self.task_queue.get()
                    agent_name = task.get('agent')
                    task_data = task.get('data')
                    
                    if agent_name in self.agents:
                        await self.execute_agent_task(agent_name, task_data)
                
                # Clean up old results cache
                await self.cleanup_results_cache()
                
                # Wait before next iteration
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Background processing error: {e}")
                await asyncio.sleep(5)
    
    async def cleanup_results_cache(self, max_age_hours: int = 24):
        """Clean up old results from cache"""
        try:
            current_time = datetime.now()
            to_remove = []
            
            for task_id, result in self.results_cache.items():
                result_time = datetime.fromisoformat(result['timestamp'])
                age_hours = (current_time - result_time).total_seconds() / 3600
                
                if age_hours > max_age_hours:
                    to_remove.append(task_id)
            
            for task_id in to_remove:
                del self.results_cache[task_id]
                
        except Exception as e:
            logger.error(f"Cache cleanup error: {e}")
    
    def stop_background_processing(self):
        """Stop background task processing"""
        self.running = False

# Global orchestrator instance
orchestrator = AgentOrchestrator()
