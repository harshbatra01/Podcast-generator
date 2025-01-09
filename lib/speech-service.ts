declare global {
  interface Window {
    responsiveVoice: {
      speak: (text: string, voice: string, options?: any) => void;
      cancel: () => void;
      isPlaying: () => boolean;
      pause: () => void;
      resume: () => void;
      enableWindowClickHook: () => void;
    };
  }
}

let isInitialized = false;

export const speechService = {
  init: () => {
    if (typeof window !== 'undefined' && window.responsiveVoice) {
      try {
        window.responsiveVoice.enableWindowClickHook();
        console.log('ResponsiveVoice initialized successfully');
      } catch (error) {
        console.error('Error initializing ResponsiveVoice:', error);
      }
    } else {
      console.warn('ResponsiveVoice not available');
    }
  },

  generateAudio: (text: string, voiceStyle: string) => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.responsiveVoice) {
        console.error('ResponsiveVoice not available for speech generation');
        reject('ResponsiveVoice not available');
        return;
      }

      try {
        console.log(`Attempting to speak: "${text}" with voice: ${voiceStyle}`);
        
        window.responsiveVoice.speak(text, voiceStyle, {
          pitch: 1,
          rate: 0.9,
          volume: 1,
          onstart: () => {
            console.log('Started speaking:', text, 'with voice:', voiceStyle);
          },
          onend: () => {
            console.log('Finished speaking:', text);
            resolve();
          },
          onerror: (error) => {
            console.error('Speech error:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Error in generateAudio:', error);
        reject(error);
      }
    });
  },

  stopAudio: () => {
    if (typeof window !== 'undefined' && window.responsiveVoice) {
      try {
        window.responsiveVoice.cancel();
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  },

  isPlaying: () => {
    try {
      return typeof window !== 'undefined' && 
             window.responsiveVoice && 
             window.responsiveVoice.isPlaying();
    } catch (error) {
      console.error('Error checking play status:', error);
      return false;
    }
  }
}; 