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
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-primary-600 mr-2" />
          <span className="text-sm font-medium text-gray-800">
            {session && session.startTime ? 
              `${safeFormatDate(session.startTime, 'MMM dd, yyyy')} at ${safeFormatDate(session.startTime, 'h:mm a')}` : 
              'Unknown time'}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {session && typeof session.duration === 'number' ? formatDuration(session.duration) : 'N/A'}
        </span>
      </div>
      
      {session.interruptions && session.interruptions.length > 0 ? (
        <div>
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-error-500 mr-1" />
            <span className="text-sm font-medium text-gray-700">
              {session.interruptions.length} Interruption{session.interruptions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="pl-5 space-y-1">
            {session.interruptions.slice(0, 3).map((interruption, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center">
                <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                  interruption.type === 'tabSwitch' ? 'bg-warning-500' : 'bg-error-500'
                }`}></div>
                <span>
                  {interruption.type === 'tabSwitch' ? 'Tab Switch: ' : 'Idle: '}
                  {interruption.details || 'No details'}
                </span>
              </div>
            ))}
            
            {session.interruptions.length > 3 && (
              <div className="text-xs text-primary-600">
                +{session.interruptions.length - 3} more interruptions
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-success-600 flex items-center">
          <div className="h-2 w-2 bg-success-500 rounded-full mr-2"></div>
          <span>Perfect focus session with no interruptions!</span>
        </div>
      )}
    </div>
  );
};

export default FocusSessionCard;