export const env = {
  COHERE_KEY: process.env.REACT_APP_COHERE_KEY,
  RESPONSIVE_VOICE_KEY: process.env.REACT_APP_RESPONSIVE_VOICE_KEY
};

// Validate environment variables
if (!env.COHERE_KEY) {
  throw new Error('REACT_APP_COHERE_KEY is not defined in environment variables');
}

if (!env.RESPONSIVE_VOICE_KEY) {
  throw new Error('REACT_APP_RESPONSIVE_VOICE_KEY is not defined in environment variables');
} 