import React from 'react';

function VoiceControls({ onPitchChange, onRateChange, onVolumeChange }) {
  return (
    <div className="voice-controls">
      <div className="control">
        <label>Pitch:</label>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="0.1" 
          defaultValue="1"
          onChange={(e) => onPitchChange(e.target.value)} 
        />
      </div>
      <div className="control">
        <label>Speed:</label>
        <input 
          type="range" 
          min="0.5" 
          max="1.5" 
          step="0.1" 
          defaultValue="1"
          onChange={(e) => onRateChange(e.target.value)} 
        />
      </div>
      <div className="control">
        <label>Volume:</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          defaultValue="1"
          onChange={(e) => onVolumeChange(e.target.value)} 
        />
      </div>
    </div>
  );
}

export default VoiceControls; 