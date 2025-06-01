import React from 'react';

const FocusHeatmap: React.FC = () => {
  // Dummy data for the heatmap
  // In a real app, this would come from the focus session data
  // with proper aggregation by hour and day
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9AM to 8PM

  // Generate random focus intensity data for demonstration
  const data = days.map(day => {
    return hours.map(hour => {
      // Random focus intensity between 0 and 4
      return Math.floor(Math.random() * 5);
    });
  });

  // Color scale for the heatmap cells using CSS variables
  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0: return { background: 'var(--border)' };
      case 1: return { background: 'rgba(102, 126, 234, 0.2)' };
      case 2: return { background: 'rgba(102, 126, 234, 0.4)' };
      case 3: return { background: 'rgba(102, 126, 234, 0.6)' };
      case 4: return { background: 'rgba(102, 126, 234, 0.8)' };
      default: return { background: 'var(--border)' };
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[auto_repeat(12,1fr)] gap-1 mb-2">
          <div className=""></div>
          {hours.map(hour => (
            <div key={hour} className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div key={day} className="grid grid-cols-[auto_repeat(12,1fr)] gap-1 mb-1">
            <div className="text-xs font-medium pr-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              {day}
            </div>
            {hours.map((hour, hourIndex) => (
              <div
                key={`${day}-${hour}`}
                className="h-6 rounded transition-all duration-200 hover:scale-110 cursor-pointer"
                style={getColor(data[dayIndex][hourIndex])}
                title={`${day} at ${hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}: ${data[dayIndex][hourIndex]} focus sessions`}
              ></div>
            ))}
          </div>
        ))}

        <div className="mt-4 flex items-center justify-end space-x-2">
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Less</div>
          <div className="h-3 w-3 rounded" style={{ background: 'var(--border)' }}></div>
          <div className="h-3 w-3 rounded" style={{ background: 'rgba(102, 126, 234, 0.2)' }}></div>
          <div className="h-3 w-3 rounded" style={{ background: 'rgba(102, 126, 234, 0.4)' }}></div>
          <div className="h-3 w-3 rounded" style={{ background: 'rgba(102, 126, 234, 0.6)' }}></div>
          <div className="h-3 w-3 rounded" style={{ background: 'rgba(102, 126, 234, 0.8)' }}></div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>More</div>
        </div>
      </div>
    </div>
  );
};

export default FocusHeatmap;