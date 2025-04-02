import React from 'react';
import { Construction, Clock } from 'lucide-react';

const WorkInProgress = ({ title = "Page Under Construction", message = "We're working hard to bring you something amazing. Please check back later." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-2 sm:p-4 md:p-6">
      <div className="text-center max-w-md mx-auto space-y-4 sm:space-y-6 bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full">
        {/* Icon and Animation */}
        <div className="relative">
          <Construction className="w-16 h-16 sm:w-20 sm:h-20 text-primary animate-bounce" />
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-secondary absolute -right-1 sm:-right-2 bottom-0 animate-pulse" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-2 sm:mt-4">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 mt-2 px-2 sm:px-4">
          {message}
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mt-4 sm:mt-6">
          <div className="bg-primary h-2 sm:h-2.5 rounded-full w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgress;