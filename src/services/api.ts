import { generateScript } from './cohere';
import { generateSpeech, cancelSpeech } from './textToSpeech';

export const podcastService = {
  async generatePodcastScript(text: string) {
    try {
      return await generateScript(text);
    } catch (error) {
      console.error('Error generating script:', error);
      throw error;
    }
  },

  async generateAudio(text: string, voice: string, options = {}) {
    try {
      return await generateSpeech(text, voice, options);
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  },

  stopAudio() {
    return cancelSpeech();
  }
}; 