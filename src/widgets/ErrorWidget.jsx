import React from 'react';

const ErrorWidget = ({ message = 'Widget not found or inactive' }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto p-8 bg-yellow-50 rounded-lg border border-yellow-400">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-400 mx-auto mb-4 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-yellow-800" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Widget Error</h2>
          <p className="text-yellow-800">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorWidget;
