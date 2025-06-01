import React from 'react';
import { Clock, AlertCircle, Brain, Target } from 'lucide-react';

interface StatsPanelProps {
  stats: {
    totalSessions: number;
    totalFocusTime: number; // in minutes
    avgSessionLength: number; // in minutes
    avgInterruptions: number;
  };
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      unit: '',
      icon: Target,
      gradient: 'var(--primary-gradient)',
      color: 'var(--text-accent)'
    },
    {
      title: 'Total Focus Time',
      value: stats.totalFocusTime,
      unit: 'min',
      icon: Clock,
      gradient: 'var(--secondary-gradient)',
      color: 'var(--text-accent)'
    },
    {
      title: 'Avg. Session Length',
      value: stats.avgSessionLength,
      unit: 'min',
      icon: Brain,
      gradient: 'var(--accent-gradient)',
      color: 'var(--text-accent)'
    },
    {
      title: 'Avg. Interruptions',
      value: stats.avgInterruptions,
      unit: '',
      icon: AlertCircle,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: '#ef4444'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="card p-6 text-center">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto"
              style={{ background: stat.gradient }}
            >
              <IconComponent className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
              {stat.unit && <span className="text-lg ml-1" style={{ color: 'var(--text-secondary)' }}>{stat.unit}</span>}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {stat.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsPanel;