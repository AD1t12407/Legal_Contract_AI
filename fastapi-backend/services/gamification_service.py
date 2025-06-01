"""
Gamification Service for AutoPom
Handles achievements, streaks, XP, badges, and leaderboards
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

class GamificationService:
    """Service for handling gamification features"""
    
    def __init__(self):
        # Achievement definitions
        self.achievements = {
            'first_session': {
                'name': 'First Steps',
                'description': 'Complete your first focus session',
                'icon': '🎯',
                'xp_reward': 50,
                'type': 'milestone'
            },
            'focus_streak_3': {
                'name': 'Getting Started',
                'description': 'Maintain a 3-day focus streak',
                'icon': '🔥',
                'xp_reward': 100,
                'type': 'streak'
            },
            'focus_streak_7': {
                'name': 'Week Warrior',
                'description': 'Maintain a 7-day focus streak',
                'icon': '⚡',
                'xp_reward': 250,
                'type': 'streak'
            },
            'focus_streak_30': {
                'name': 'Monthly Master',
                'description': 'Maintain a 30-day focus streak',
                'icon': '👑',
                'xp_reward': 1000,
                'type': 'streak'
            },
            'learning_collector': {
                'name': 'Knowledge Collector',
                'description': 'Create 10 learning cards',
                'icon': '📚',
                'xp_reward': 200,
                'type': 'collection'
            },
            'quiz_master': {
                'name': 'Quiz Master',
                'description': 'Complete 25 quiz questions correctly',
                'icon': '🧠',
                'xp_reward': 300,
                'type': 'skill'
            },
            'focus_marathon': {
                'name': 'Focus Marathon',
                'description': 'Complete a 2-hour focus session',
                'icon': '🏃‍♂️',
                'xp_reward': 400,
                'type': 'endurance'
            },
            'multilingual_learner': {
                'name': 'Multilingual Learner',
                'description': 'Create learning content in 3 different languages',
                'icon': '🌍',
                'xp_reward': 350,
                'type': 'diversity'
            },
            'early_bird': {
                'name': 'Early Bird',
                'description': 'Complete 5 focus sessions before 8 AM',
                'icon': '🌅',
                'xp_reward': 200,
                'type': 'timing'
            },
            'night_owl': {
                'name': 'Night Owl',
                'description': 'Complete 5 focus sessions after 10 PM',
                'icon': '🦉',
                'xp_reward': 200,
                'type': 'timing'
            },
            'distraction_fighter': {
                'name': 'Distraction Fighter',
                'description': 'Complete 10 sessions with zero interruptions',
                'icon': '🛡️',
                'xp_reward': 500,
                'type': 'skill'
            },
            'resource_explorer': {
                'name': 'Resource Explorer',
                'description': 'Access 50 learning resources',
                'icon': '🔍',
                'xp_reward': 250,
                'type': 'exploration'
            }
        }
        
        # XP levels and requirements
        self.level_requirements = {
            1: 0, 2: 100, 3: 250, 4: 500, 5: 1000,
            6: 1750, 7: 2750, 8: 4000, 9: 5500, 10: 7500,
            11: 10000, 12: 13000, 13: 16500, 14: 20500, 15: 25000,
            16: 30000, 17: 35500, 18: 41500, 19: 48000, 20: 55000
        }
        
        # Badge categories
        self.badge_categories = {
            'focus': {'color': '#4F46E5', 'icon': '🎯'},
            'learning': {'color': '#059669', 'icon': '📚'},
            'streak': {'color': '#DC2626', 'icon': '🔥'},
            'skill': {'color': '#7C3AED', 'icon': '🧠'},
            'social': {'color': '#EA580C', 'icon': '👥'},
            'special': {'color': '#F59E0B', 'icon': '⭐'}
        }
    
    async def get_user_profile(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Get complete gamification profile for user"""
        try:
            # Calculate current stats
            stats = await self._calculate_user_stats(db, user_id)
            
            # Get achievements
            achievements = await self._get_user_achievements(db, user_id)
            
            # Calculate level and XP
            level_info = self._calculate_level(stats['total_xp'])
            
            # Get current streaks
            streaks = await self._calculate_streaks(db, user_id)
            
            # Get recent activities
            recent_activities = await self._get_recent_activities(db, user_id)
            
            return {
                'user_id': user_id,
                'level': level_info['level'],
                'xp': {
                    'total': stats['total_xp'],
                    'current_level': level_info['current_level_xp'],
                    'next_level': level_info['next_level_xp'],
                    'progress_percentage': level_info['progress_percentage']
                },
                'achievements': achievements,
                'streaks': streaks,
                'stats': stats,
                'recent_activities': recent_activities,
                'next_achievements': await self._get_next_achievements(db, user_id, stats)
            }
            
        except Exception as e:
            logger.error(f"User profile generation failed: {e}")
            return self._empty_user_profile(user_id)
    
    async def award_xp(self, db: Session, user_id: str, xp_amount: int, reason: str) -> Dict[str, Any]:
        """Award XP to user and check for level ups"""
        try:
            # Get current XP
            current_stats = await self._calculate_user_stats(db, user_id)
            old_level = self._calculate_level(current_stats['total_xp'])['level']
            
            # Award XP (in production, store in database)
            new_total_xp = current_stats['total_xp'] + xp_amount
            new_level_info = self._calculate_level(new_total_xp)
            
            # Check for level up
            level_up = new_level_info['level'] > old_level
            
            # Log XP award (in production, store in database)
            xp_award = {
                'user_id': user_id,
                'xp_amount': xp_amount,
                'reason': reason,
                'timestamp': datetime.now().isoformat(),
                'total_xp_after': new_total_xp,
                'level_after': new_level_info['level']
            }
            
            result = {
                'xp_awarded': xp_amount,
                'total_xp': new_total_xp,
                'level': new_level_info['level'],
                'level_up': level_up,
                'reason': reason
            }
            
            if level_up:
                result['level_up_rewards'] = await self._get_level_up_rewards(new_level_info['level'])
            
            return result
            
        except Exception as e:
            logger.error(f"XP award failed: {e}")
            return {
                'xp_awarded': 0,
                'total_xp': 0,
                'level': 1,
                'level_up': False,
                'reason': reason,
                'error': str(e)
            }
    
    async def check_achievements(self, db: Session, user_id: str) -> List[Dict[str, Any]]:
        """Check and award new achievements for user"""
        try:
            # Get current user stats
            stats = await self._calculate_user_stats(db, user_id)
            
            # Get already earned achievements (in production, from database)
            earned_achievements = await self._get_user_achievements(db, user_id)
            earned_ids = set(a['id'] for a in earned_achievements)
            
            # Check each achievement
            new_achievements = []
            
            for achievement_id, achievement in self.achievements.items():
                if achievement_id in earned_ids:
                    continue  # Already earned
                
                # Check if achievement is earned
                if await self._check_achievement_condition(db, user_id, achievement_id, stats):
                    # Award achievement
                    new_achievement = {
                        'id': achievement_id,
                        'name': achievement['name'],
                        'description': achievement['description'],
                        'icon': achievement['icon'],
                        'xp_reward': achievement['xp_reward'],
                        'type': achievement['type'],
                        'earned_at': datetime.now().isoformat()
                    }
                    
                    new_achievements.append(new_achievement)
                    
                    # Award XP for achievement
                    await self.award_xp(db, user_id, achievement['xp_reward'], f"Achievement: {achievement['name']}")
            
            return new_achievements
            
        except Exception as e:
            logger.error(f"Achievement check failed: {e}")
            return []
    
    async def get_leaderboard(self, db: Session, category: str = 'xp', limit: int = 10) -> List[Dict[str, Any]]:
        """Get leaderboard for specified category"""
        try:
            # In production, this would query the database
            # For now, return mock data
            
            leaderboard_data = []
            
            if category == 'xp':
                # Mock XP leaderboard
                mock_users = [
                    {'user_id': 'user1', 'name': 'Priya Sharma', 'xp': 5500, 'level': 9},
                    {'user_id': 'user2', 'name': 'Arjun Patel', 'xp': 4200, 'level': 8},
                    {'user_id': 'user3', 'name': 'Sneha Reddy', 'xp': 3800, 'level': 7},
                    {'user_id': 'user4', 'name': 'Rahul Kumar', 'xp': 3200, 'level': 7},
                    {'user_id': 'user5', 'name': 'Anita Singh', 'xp': 2900, 'level': 6}
                ]
                
                for i, user in enumerate(mock_users[:limit]):
                    leaderboard_data.append({
                        'rank': i + 1,
                        'user_id': user['user_id'],
                        'name': user['name'],
                        'value': user['xp'],
                        'level': user['level'],
                        'category': 'xp'
                    })
            
            elif category == 'streak':
                # Mock streak leaderboard
                mock_streaks = [
                    {'user_id': 'user1', 'name': 'Priya Sharma', 'streak': 45},
                    {'user_id': 'user3', 'name': 'Sneha Reddy', 'streak': 32},
                    {'user_id': 'user2', 'name': 'Arjun Patel', 'streak': 28},
                    {'user_id': 'user5', 'name': 'Anita Singh', 'streak': 21},
                    {'user_id': 'user4', 'name': 'Rahul Kumar', 'streak': 15}
                ]
                
                for i, user in enumerate(mock_streaks[:limit]):
                    leaderboard_data.append({
                        'rank': i + 1,
                        'user_id': user['user_id'],
                        'name': user['name'],
                        'value': user['streak'],
                        'category': 'streak'
                    })
            
            return leaderboard_data
            
        except Exception as e:
            logger.error(f"Leaderboard generation failed: {e}")
            return []
    
    async def create_challenge(self, db: Session, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new challenge"""
        try:
            challenge = {
                'id': f"challenge_{datetime.now().timestamp()}",
                'name': challenge_data['name'],
                'description': challenge_data['description'],
                'type': challenge_data['type'],  # daily, weekly, monthly, custom
                'goal': challenge_data['goal'],
                'reward_xp': challenge_data.get('reward_xp', 100),
                'start_date': challenge_data.get('start_date', datetime.now().isoformat()),
                'end_date': challenge_data.get('end_date'),
                'participants': [],
                'created_at': datetime.now().isoformat(),
                'status': 'active'
            }
            
            # In production, save to database
            
            return challenge
            
        except Exception as e:
            logger.error(f"Challenge creation failed: {e}")
            return {}
    
    def _calculate_level(self, total_xp: int) -> Dict[str, Any]:
        """Calculate level based on total XP"""
        level = 1
        for lvl, required_xp in self.level_requirements.items():
            if total_xp >= required_xp:
                level = lvl
            else:
                break
        
        current_level_xp = total_xp - self.level_requirements[level]
        next_level = min(level + 1, max(self.level_requirements.keys()))
        next_level_xp = self.level_requirements[next_level] - self.level_requirements[level]
        
        progress_percentage = (current_level_xp / next_level_xp * 100) if next_level_xp > 0 else 100
        
        return {
            'level': level,
            'current_level_xp': current_level_xp,
            'next_level_xp': next_level_xp,
            'progress_percentage': round(progress_percentage, 1)
        }
    
    async def _calculate_user_stats(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Calculate comprehensive user statistics"""
        try:
            from main import DBSession, DBLearning, DBEvent
            
            # Get sessions
            sessions = db.query(DBSession).filter(DBSession.user_id == user_id).all()
            
            # Get learnings
            learnings = db.query(DBLearning).filter(DBLearning.user_id == user_id).all()
            
            # Calculate basic stats
            total_sessions = len(sessions)
            completed_sessions = len([s for s in sessions if s.end_time])
            total_focus_time = sum(s.duration or 0 for s in sessions) / 60  # minutes
            total_learnings = len(learnings)
            
            # Calculate XP (simplified calculation)
            base_xp = completed_sessions * 10  # 10 XP per completed session
            learning_xp = total_learnings * 25  # 25 XP per learning
            time_bonus = int(total_focus_time / 30) * 5  # 5 XP per 30 minutes
            
            total_xp = base_xp + learning_xp + time_bonus
            
            return {
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'total_focus_time_minutes': round(total_focus_time, 2),
                'total_learnings': total_learnings,
                'total_xp': total_xp,
                'completion_rate': completed_sessions / total_sessions if total_sessions > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"User stats calculation failed: {e}")
            return {
                'total_sessions': 0,
                'completed_sessions': 0,
                'total_focus_time_minutes': 0,
                'total_learnings': 0,
                'total_xp': 0,
                'completion_rate': 0
            }
    
    async def _get_user_achievements(self, db: Session, user_id: str) -> List[Dict[str, Any]]:
        """Get user's earned achievements"""
        # In production, query from database
        # For now, return mock data
        return [
            {
                'id': 'first_session',
                'name': 'First Steps',
                'description': 'Complete your first focus session',
                'icon': '🎯',
                'earned_at': '2024-01-15T10:30:00Z'
            }
        ]
    
    async def _calculate_streaks(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Calculate user's current streaks"""
        try:
            from main import DBSession
            
            # Get recent sessions
            sessions = db.query(DBSession).filter(
                DBSession.user_id == user_id,
                DBSession.end_time.isnot(None)
            ).order_by(DBSession.start_time.desc()).limit(100).all()
            
            if not sessions:
                return {'current_streak': 0, 'longest_streak': 0, 'last_session_date': None}
            
            # Calculate current streak
            current_streak = 0
            session_dates = set()
            
            for session in sessions:
                session_date = session.start_time.date()
                session_dates.add(session_date)
            
            # Sort dates in descending order
            sorted_dates = sorted(session_dates, reverse=True)
            
            # Calculate current streak
            today = datetime.now().date()
            current_date = today
            
            for date in sorted_dates:
                if date == current_date or date == current_date - timedelta(days=1):
                    current_streak += 1
                    current_date = date - timedelta(days=1)
                else:
                    break
            
            # Calculate longest streak (simplified)
            longest_streak = current_streak  # In production, calculate properly
            
            return {
                'current_streak': current_streak,
                'longest_streak': longest_streak,
                'last_session_date': sorted_dates[0].isoformat() if sorted_dates else None
            }
            
        except Exception as e:
            logger.error(f"Streak calculation failed: {e}")
            return {'current_streak': 0, 'longest_streak': 0, 'last_session_date': None}
    
    async def _check_achievement_condition(self, db: Session, user_id: str, achievement_id: str, stats: Dict[str, Any]) -> bool:
        """Check if user meets achievement condition"""
        try:
            achievement = self.achievements[achievement_id]
            
            if achievement_id == 'first_session':
                return stats['completed_sessions'] >= 1
            elif achievement_id == 'learning_collector':
                return stats['total_learnings'] >= 10
            elif achievement_id == 'focus_marathon':
                # Check if user has any session >= 2 hours
                from main import DBSession
                long_sessions = db.query(DBSession).filter(
                    DBSession.user_id == user_id,
                    DBSession.duration >= 7200  # 2 hours in seconds
                ).count()
                return long_sessions >= 1
            # Add more achievement conditions as needed
            
            return False
            
        except Exception as e:
            logger.error(f"Achievement condition check failed: {e}")
            return False
    
    def _empty_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Return empty user profile"""
        return {
            'user_id': user_id,
            'level': 1,
            'xp': {'total': 0, 'current_level': 0, 'next_level': 100, 'progress_percentage': 0},
            'achievements': [],
            'streaks': {'current_streak': 0, 'longest_streak': 0, 'last_session_date': None},
            'stats': {
                'total_sessions': 0,
                'completed_sessions': 0,
                'total_focus_time_minutes': 0,
                'total_learnings': 0,
                'total_xp': 0,
                'completion_rate': 0
            },
            'recent_activities': [],
            'next_achievements': []
        }

# Global instance
gamification_service = GamificationService()
