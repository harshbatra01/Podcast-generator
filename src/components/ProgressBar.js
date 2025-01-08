import React from 'react';

function ProgressBar({ progress }) {
  return (
    <div className="progress-container">
      <div 
        className="progress-bar" 
        style={{ width: `${progress}%` }}
      />
      <span>{progress}%</span>
    </div>
  );
}

export default ProgressBar; 