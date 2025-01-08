import React, { useEffect, useState } from 'react';
import { getAvailableVoices } from '../services/textToSpeech';

// Define the supported voices explicitly
const SUPPORTED_VOICES = [
  'UK English Female',
  'UK English Male',
  'US English Female',
  'US English Male',
  'Australian Female',
  'Australian Male',
  'Indian Female',
  'Indian Male',
  'Irish Female',
  'Irish Male',
  'South African Female',
  'South African Male'
];

function VoiceSelector({ onSelect, disabled }) {
  const [voices, setVoices] = useState(SUPPORTED_VOICES);

  return (
    <div className="voice-selector">
      <h2>Select Voice</h2>
      <div className="voice-options">
        {voices.map((voice) => (
          <button
            key={voice}
            onClick={() => onSelect(voice)}
            disabled={disabled}
            className="voice-option"
          >
            <h3>{voice}</h3>
          </button>
        ))}
      </div>
    </div>
  );
}

export default VoiceSelector; 