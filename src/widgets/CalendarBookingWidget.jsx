import React from 'react';

const CalendarBookingWidget = ({ widget }) => {
  const accentColor = widget?.accent_color || '#8B5CF6';

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto text-center py-12">
        <div 
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: accentColor }}
        >
          <svg 
            className="w-10 h-10 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {widget?.widget_title || 'Book from Calendar'}
        </h2>
        <p className="text-lg text-gray-600">
          Calendar booking widget - Coming Soon
        </p>
        <p className="mt-4 text-sm text-gray-500">
          This widget will allow students to book sessions directly from a calendar view.
        </p>
      </div>
    </div>
  );
};

export default CalendarBookingWidget;
