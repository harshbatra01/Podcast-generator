import { config } from '../config';

const initializeVoice = () => {
  return new Promise((resolve, reject) => {
    if (!window.responsiveVoice) {
      reject(new Error('ResponsiveVoice not loaded'));
      return;
    }

    if (window.responsiveVoice.voiceSupport()) {
      window.responsiveVoice.init();
      resolve();
    } else {
      const initTimeout = setTimeout(() => {
        reject(new Error('ResponsiveVoice initialization timed out'));
      }, 5000);

      window.responsiveVoice.OnLoad = () => {
        clearTimeout(initTimeout);
        window.responsiveVoice.init();
        resolve();
      };
    }
  });
};

export const generateSpeech = async (text, voice, options = {}) => {
  try {
    await initializeVoice();

    const chunks = splitTextIntoChunks(text, 300);
    let currentChunkIndex = 0;
    let isCancelled = false;

    return new Promise((resolve, reject) => {
      const chunkTimeout = setTimeout(() => {
        isCancelled = true;
        window.responsiveVoice.cancel();
        reject(new Error('Speech generation timed out. Text might be too long.'));
      }, 30000);

      const speakNextChunk = () => {
        if (isCancelled) return;

        if (currentChunkIndex >= chunks.length) {
          clearTimeout(chunkTimeout);
          resolve();
          return;
        }

        const defaultOptions = {
          pitch: 1,
          rate: 0.9,
          volume: 1,
          onend: () => {
            if (!isCancelled) {
              setTimeout(() => {
                currentChunkIndex++;
                speakNextChunk();
              }, 100);
            }
          },
          onerror: (error) => {
            isCancelled = true;
            clearTimeout(chunkTimeout);
            const errorMessage = error.error || error.message || 'Unknown speech error';
            reject(new Error(`Speech generation failed: ${errorMessage}`));
          }
        };

        const speechOptions = { ...defaultOptions, ...options };

        try {
          if (!window.responsiveVoice.isPlaying()) {
            window.responsiveVoice.speak(
              chunks[currentChunkIndex],
              voice,
              speechOptions
            );
          } else {
            setTimeout(speakNextChunk, 100);
          }
        } catch (error) {
          isCancelled = true;
          clearTimeout(chunkTimeout);
          reject(new Error(`Speech generation error: ${error.message || 'Unknown error'}`));
        }
      };

      speakNextChunk();
    });
  } catch (error) {
    console.error('Speech generation error:', error);
    throw error;
  }
};

const splitTextIntoChunks = (text, chunkSize) => {
  const chunks = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  sentences.forEach(sentence => {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) return;

    if (currentChunk.length + trimmedSentence.length + 2 <= chunkSize) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) chunks.push(currentChunk + '.');
      currentChunk = trimmedSentence;
    }
  });

  if (currentChunk) chunks.push(currentChunk + '.');
  return chunks;
};

export const cancelSpeech = () => {
  if (window.responsiveVoice && window.responsiveVoice.isPlaying()) {
    window.responsiveVoice.cancel();
  }
  // Always return a resolved promise
  return Promise.resolve();
};

export const isPlaying = () => {
  return window.responsiveVoice && window.responsiveVoice.isPlaying();
};

export const getAvailableVoices = () => {
  if (!window.responsiveVoice) {
    return [];
  }
  return window.responsiveVoice.getVoices();
}; 