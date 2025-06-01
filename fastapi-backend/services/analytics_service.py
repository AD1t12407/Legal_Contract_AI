"""
Analytics Service for AutoPom
Provides comprehensive analytics and insights for learning and productivity
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyticsService:
    """Service for generating analytics and insights"""
    
    def __init__(self):
        self.cache = {}  # Simple cache for expensive calculations
        self.cache_ttl = 300  # 5 minutes cache TTL
    
    async def get_focus_analytics(self, 
                                 db: Session, 
                                 user_id: str = None,
                                 days: int = 7) -> Dict[str, Any]:
        """Get comprehensive focus session analytics"""
        try:
            from main import DBSession, DBEvent  # Import here to avoid circular imports
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Base query
            query = db.query(DBSession).filter(
                DBSession.start_time >= start_date,
                DBSession.start_time <= end_date
            )
            
            # Add user filter if provided
            if user_id:
                query = query.filter(DBSession.user_id == user_id)
            
            sessions = query.all()
            
            if not sessions:
                return self._empty_focus_analytics()
            
            # Calculate basic metrics
            total_sessions = len(sessions)
            completed_sessions = [s for s in sessions if s.end_time is not None]
            total_focus_time = sum(s.duration or 0 for s in completed_sessions) / 60  # Convert to minutes
            avg_session_length = total_focus_time / len(completed_sessions) if completed_sessions else 0
            
            # Calculate interruption metrics
            interruption_data = await self._analyze_interruptions(db, sessions)
            
            # Calculate productivity trends
            productivity_trends = await self._calculate_productivity_trends(sessions, days)
            
            # Calculate focus patterns
            focus_patterns = await self._analyze_focus_patterns(sessions)
            
            # Calculate learning correlation
            learning_correlation = await self._analyze_learning_correlation(db, sessions)
            
            return {
                'period': {
                    'days': days,
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'basic_metrics': {
                    'total_sessions': total_sessions,
                    'completed_sessions': len(completed_sessions),
                    'total_focus_time_minutes': round(total_focus_time, 2),
                    'avg_session_length_minutes': round(avg_session_length, 2),
                    'completion_rate': len(completed_sessions) / total_sessions if total_sessions > 0 else 0
                },
                'interruption_analysis': interruption_data,
                'productivity_trends': productivity_trends,
                'focus_patterns': focus_patterns,
                'learning_correlation': learning_correlation,
                'insights': await self._generate_focus_insights(sessions, interruption_data, productivity_trends)
            }
            
        except Exception as e:
            logger.error(f"Focus analytics generation failed: {e}")
            return self._empty_focus_analytics()
    
    async def get_learning_analytics(self, 
                                   db: Session, 
                                   user_id: str = None,
                                   days: int = 7) -> Dict[str, Any]:
        """Get comprehensive learning analytics"""
        try:
            from main import DBLearning  # Import here to avoid circular imports
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Base query
            query = db.query(DBLearning).filter(
                DBLearning.created_at >= start_date,
                DBLearning.created_at <= end_date
            )
            
            # Add user filter if provided
            if user_id:
                query = query.filter(DBLearning.user_id == user_id)
            
            learnings = query.all()
            
            if not learnings:
                return self._empty_learning_analytics()
            
            # Analyze learning content
            content_analysis = await self._analyze_learning_content(learnings)
            
            # Calculate learning velocity
            learning_velocity = await self._calculate_learning_velocity(learnings, days)
            
            # Analyze learning quality
            quality_metrics = await self._analyze_learning_quality(learnings)
            
            # Topic analysis
            topic_analysis = await self._analyze_learning_topics(learnings)
            
            # Language distribution
            language_distribution = await self._analyze_language_distribution(learnings)
            
            return {
                'period': {
                    'days': days,
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'basic_metrics': {
                    'total_learnings': len(learnings),
                    'avg_learnings_per_day': len(learnings) / days,
                    'total_content_length': sum(len(l.content or '') for l in learnings),
                    'avg_content_length': sum(len(l.content or '') for l in learnings) / len(learnings)
                },
                'content_analysis': content_analysis,
                'learning_velocity': learning_velocity,
                'quality_metrics': quality_metrics,
                'topic_analysis': topic_analysis,
                'language_distribution': language_distribution,
                'insights': await self._generate_learning_insights(learnings, content_analysis, quality_metrics)
            }
            
        except Exception as e:
            logger.error(f"Learning analytics generation failed: {e}")
            return self._empty_learning_analytics()
    
    async def get_engagement_analytics(self, 
                                     db: Session, 
                                     user_id: str = None,
                                     days: int = 7) -> Dict[str, Any]:
        """Get user engagement analytics"""
        try:
            # This would analyze user engagement patterns
            # For now, return basic structure
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Calculate daily activity
            daily_activity = await self._calculate_daily_activity(db, user_id, start_date, end_date)
            
            # Calculate streak information
            streak_info = await self._calculate_streaks(db, user_id)
            
            # Calculate feature usage
            feature_usage = await self._analyze_feature_usage(db, user_id, start_date, end_date)
            
            return {
                'period': {
                    'days': days,
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'daily_activity': daily_activity,
                'streak_info': streak_info,
                'feature_usage': feature_usage,
                'engagement_score': await self._calculate_engagement_score(daily_activity, streak_info, feature_usage)
            }
            
        except Exception as e:
            logger.error(f"Engagement analytics generation failed: {e}")
            return {
                'period': {'days': days},
                'daily_activity': [],
                'streak_info': {'current_streak': 0, 'longest_streak': 0},
                'feature_usage': {},
                'engagement_score': 0
            }
    
    async def _analyze_interruptions(self, db: Session, sessions: List) -> Dict[str, Any]:
        """Analyze interruption patterns"""
        try:
            from main import DBEvent
            
            # Get all interruption events for these sessions
            session_ids = [s.id for s in sessions]
            interruption_events = db.query(DBEvent).filter(
                DBEvent.session_id.in_(session_ids),
                DBEvent.type.in_(['tabSwitch', 'idle'])
            ).all()
            
            # Analyze interruption types
            interruption_types = {}
            hourly_interruptions = {}
            
            for event in interruption_events:
                # Count by type
                event_type = event.type
                interruption_types[event_type] = interruption_types.get(event_type, 0) + 1
                
                # Count by hour
                hour = event.time.hour
                hourly_interruptions[hour] = hourly_interruptions.get(hour, 0) + 1
            
            # Calculate interruption rate
            total_interruptions = len(interruption_events)
            total_session_time = sum(s.duration or 0 for s in sessions if s.duration) / 3600  # Convert to hours
            interruption_rate = total_interruptions / total_session_time if total_session_time > 0 else 0
            
            return {
                'total_interruptions': total_interruptions,
                'interruption_rate_per_hour': round(interruption_rate, 2),
                'interruption_types': interruption_types,
                'hourly_distribution': hourly_interruptions,
                'avg_interruptions_per_session': total_interruptions / len(sessions) if sessions else 0
            }
            
        except Exception as e:
            logger.error(f"Interruption analysis failed: {e}")
            return {
                'total_interruptions': 0,
                'interruption_rate_per_hour': 0,
                'interruption_types': {},
                'hourly_distribution': {},
                'avg_interruptions_per_session': 0
            }
    
    async def _calculate_productivity_trends(self, sessions: List, days: int) -> Dict[str, Any]:
        """Calculate productivity trends over time"""
        try:
            # Group sessions by day
            daily_productivity = {}
            
            for session in sessions:
                if not session.start_time:
                    continue
                    
                day_key = session.start_time.date().isoformat()
                
                if day_key not in daily_productivity:
                    daily_productivity[day_key] = {
                        'sessions': 0,
                        'total_time': 0,
                        'interruptions': 0,
                        'completed_sessions': 0
                    }
                
                daily_productivity[day_key]['sessions'] += 1
                daily_productivity[day_key]['total_time'] += session.duration or 0
                
                if session.end_time:
                    daily_productivity[day_key]['completed_sessions'] += 1
                
                # Count interruptions (simplified)
                if hasattr(session, 'events'):
                    interruption_count = len([e for e in session.events if e.type in ['tabSwitch', 'idle']])
                    daily_productivity[day_key]['interruptions'] += interruption_count
            
            # Calculate trend
            productivity_scores = []
            for day_data in daily_productivity.values():
                # Simple productivity score calculation
                completion_rate = day_data['completed_sessions'] / day_data['sessions'] if day_data['sessions'] > 0 else 0
                focus_time = day_data['total_time'] / 60  # Convert to minutes
                interruption_penalty = max(0, 1 - (day_data['interruptions'] * 0.1))
                
                score = (completion_rate * 0.4 + min(focus_time / 120, 1) * 0.4 + interruption_penalty * 0.2) * 100
                productivity_scores.append(score)
            
            # Calculate trend direction
            if len(productivity_scores) >= 2:
                recent_avg = sum(productivity_scores[-3:]) / len(productivity_scores[-3:])
                earlier_avg = sum(productivity_scores[:-3]) / len(productivity_scores[:-3]) if len(productivity_scores) > 3 else productivity_scores[0]
                trend = 'improving' if recent_avg > earlier_avg else 'declining' if recent_avg < earlier_avg else 'stable'
            else:
                trend = 'insufficient_data'
            
            return {
                'daily_productivity': daily_productivity,
                'productivity_scores': productivity_scores,
                'trend': trend,
                'avg_productivity_score': sum(productivity_scores) / len(productivity_scores) if productivity_scores else 0
            }
            
        except Exception as e:
            logger.error(f"Productivity trend calculation failed: {e}")
            return {
                'daily_productivity': {},
                'productivity_scores': [],
                'trend': 'insufficient_data',
                'avg_productivity_score': 0
            }
    
    async def _analyze_focus_patterns(self, sessions: List) -> Dict[str, Any]:
        """Analyze focus patterns by time of day and day of week"""
        try:
            hourly_focus = {}
            daily_focus = {}
            
            for session in sessions:
                if not session.start_time:
                    continue
                
                # Hour analysis
                hour = session.start_time.hour
                hourly_focus[hour] = hourly_focus.get(hour, 0) + (session.duration or 0)
                
                # Day of week analysis
                day_of_week = session.start_time.strftime('%A')
                daily_focus[day_of_week] = daily_focus.get(day_of_week, 0) + (session.duration or 0)
            
            # Find peak hours and days
            peak_hour = max(hourly_focus.items(), key=lambda x: x[1])[0] if hourly_focus else None
            peak_day = max(daily_focus.items(), key=lambda x: x[1])[0] if daily_focus else None
            
            return {
                'hourly_focus_distribution': hourly_focus,
                'daily_focus_distribution': daily_focus,
                'peak_focus_hour': peak_hour,
                'peak_focus_day': peak_day,
                'focus_consistency': self._calculate_consistency_score(list(hourly_focus.values()))
            }
            
        except Exception as e:
            logger.error(f"Focus pattern analysis failed: {e}")
            return {
                'hourly_focus_distribution': {},
                'daily_focus_distribution': {},
                'peak_focus_hour': None,
                'peak_focus_day': None,
                'focus_consistency': 0
            }
    
    def _calculate_consistency_score(self, values: List[float]) -> float:
        """Calculate consistency score based on variance"""
        if not values or len(values) < 2:
            return 0
        
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        
        # Convert to 0-1 score (lower variance = higher consistency)
        consistency = max(0, 1 - (variance / (mean_val ** 2)) if mean_val > 0 else 0)
        return round(consistency, 3)
    
    async def _analyze_learning_correlation(self, db: Session, sessions: List) -> Dict[str, Any]:
        """Analyze correlation between focus sessions and learning outcomes"""
        try:
            from main import DBLearning
            
            session_ids = [s.id for s in sessions]
            learnings = db.query(DBLearning).filter(
                DBLearning.session_id.in_(session_ids)
            ).all()
            
            # Calculate correlation metrics
            sessions_with_learning = len(set(l.session_id for l in learnings))
            learning_rate = sessions_with_learning / len(sessions) if sessions else 0
            
            # Average learning per session
            avg_learnings_per_session = len(learnings) / len(sessions) if sessions else 0
            
            return {
                'sessions_with_learning': sessions_with_learning,
                'total_learnings': len(learnings),
                'learning_rate': round(learning_rate, 3),
                'avg_learnings_per_session': round(avg_learnings_per_session, 2)
            }
            
        except Exception as e:
            logger.error(f"Learning correlation analysis failed: {e}")
            return {
                'sessions_with_learning': 0,
                'total_learnings': 0,
                'learning_rate': 0,
                'avg_learnings_per_session': 0
            }
    
    def _empty_focus_analytics(self) -> Dict[str, Any]:
        """Return empty focus analytics structure"""
        return {
            'period': {'days': 0},
            'basic_metrics': {
                'total_sessions': 0,
                'completed_sessions': 0,
                'total_focus_time_minutes': 0,
                'avg_session_length_minutes': 0,
                'completion_rate': 0
            },
            'interruption_analysis': {
                'total_interruptions': 0,
                'interruption_rate_per_hour': 0,
                'interruption_types': {},
                'hourly_distribution': {},
                'avg_interruptions_per_session': 0
            },
            'productivity_trends': {
                'daily_productivity': {},
                'productivity_scores': [],
                'trend': 'insufficient_data',
                'avg_productivity_score': 0
            },
            'focus_patterns': {
                'hourly_focus_distribution': {},
                'daily_focus_distribution': {},
                'peak_focus_hour': None,
                'peak_focus_day': None,
                'focus_consistency': 0
            },
            'learning_correlation': {
                'sessions_with_learning': 0,
                'total_learnings': 0,
                'learning_rate': 0,
                'avg_learnings_per_session': 0
            },
            'insights': []
        }
    
    def _empty_learning_analytics(self) -> Dict[str, Any]:
        """Return empty learning analytics structure"""
        return {
            'period': {'days': 0},
            'basic_metrics': {
                'total_learnings': 0,
                'avg_learnings_per_day': 0,
                'total_content_length': 0,
                'avg_content_length': 0
            },
            'content_analysis': {},
            'learning_velocity': {},
            'quality_metrics': {},
            'topic_analysis': {},
            'language_distribution': {},
            'insights': []
        }

# Global instance
analytics_service = AnalyticsService()
