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
    if (typeof window !== 'undefined' && window.responsiveVoice && !isInitialized) {
      window.responsiveVoice.enableWindowClickHook();
      isInitialized = true;
    }
  },

  generateAudio: (text: string, voiceStyle: string) => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.responsiveVoice) {
        reject('ResponsiveVoice not available');
        return;
      }

      try {
        const voice = voiceStyle === 'casual' ? 'US English Female' :
                     voiceStyle === 'formal' ? 'UK English Male' : 'UK English Female';

        window.responsiveVoice.speak(text, voice, {
          pitch: 1,
          rate: 1,
          volume: 1,
          onstart: () => {
            console.log('Started speaking:', text);
          },
          onend: () => {
            console.log('Finished speaking:', text);
            setTimeout(resolve, 100); // Add small delay before resolving
          },
          onerror: (error) => {
            console.error('Speech error:', error);
            reject(error);
          }
        });
      } catch (error) {
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