import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { FocusSession } from '../../contexts/FocusSessionContext';
import { Clock, AlertCircle } from 'lucide-react';

interface FocusSessionCardProps {
  session: FocusSession;
}

const FocusSessionCard: React.FC<FocusSessionCardProps> = ({ session }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  // Safely format date with stronger validation
  const safeFormatDate = (dateString: string, formatString: string) => {
    try {
      if (!dateString || typeof dateString !== 'string') {
        console.warn('Invalid date string provided:', dateString);
        return 'Invalid date';
      }

      // Try to parse the ISO string
      const date = parseISO(dateString);

      // Perform multiple validations
      if (!isValid(date)) {
        console.warn('Date is invalid after parsing:', dateString);
        return 'Invalid date';
      }

      // Additional validation to ensure date is not NaN
      if (isNaN(date.getTime())) {
        console.warn('Date getTime is NaN:', dateString);
        return 'Invalid date';
      }

      // Return the formatted date
      return format(date, formatString);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-3" style={{ color: 'var(--text-accent)' }} />
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {session && session.startTime ?
              `${safeFormatDate(session.startTime, 'MMM dd, yyyy')} at ${safeFormatDate(session.startTime, 'h:mm a')}` :
              'Unknown time'}
          </span>
        </div>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-secondary)'
          }}
        >
          {session && typeof session.duration === 'number' ? formatDuration(session.duration) : 'N/A'}
        </span>
      </div>

      {session.interruptions && session.interruptions.length > 0 ? (
        <div>
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 mr-2" style={{ color: '#ef4444' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {session.interruptions.length} Interruption{session.interruptions.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2">
            {session.interruptions.slice(0, 3).map((interruption, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded-lg"
                style={{ background: 'var(--surface)' }}
              >
                <div
                  className="h-2 w-2 rounded-full mr-3"
                  style={{
                    background: interruption.type === 'tabSwitch' ? '#f59e0b' : '#ef4444'
                  }}
                ></div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>{interruption.type === 'tabSwitch' ? 'Tab Switch' : 'Idle'}:</strong>{' '}
                  {interruption.details || 'No details'}
                </span>
              </div>
            ))}

            {session.interruptions.length > 3 && (
              <div className="text-sm text-center pt-2" style={{ color: 'var(--text-accent)' }}>
                +{session.interruptions.length - 3} more interruptions
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center p-3 rounded-lg"
          style={{ background: 'rgba(34, 197, 94, 0.1)' }}
        >
          <div className="h-2 w-2 rounded-full mr-3" style={{ background: '#22c55e' }}></div>
          <span className="font-medium" style={{ color: '#22c55e' }}>
            Perfect focus session with no interruptions! 🎉
          </span>
        </div>
      )}
    </div>
  );
};

export default FocusSessionCard;