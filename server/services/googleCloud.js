const textToSpeech = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const client = new textToSpeech.TextToSpeechClient();
const storage = new Storage();

const BUCKET_NAME = 'your-bucket-name';

async function generateSpeech(text, voice) {
  try {
    // Split text into chunks if it's too long
    const chunks = splitTextIntoChunks(text, 5000); // Google's API limit is 5000 characters
    
    const audioChunks = await Promise.all(
      chunks.map(chunk => synthesizeSpeech(chunk, voice))
    );
    
    // Combine audio chunks (you'll need to implement this)
    const finalAudio = await combineAudioChunks(audioChunks);
    
    // Upload to Google Cloud Storage
    const fileName = `podcast_${Date.now()}.mp3`;
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);
    
    await file.save(finalAudio);
    
    // Generate signed URL for temporary access
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 3600000, // URL expires in 1 hour
    });
    
    return url;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

async function synthesizeSpeech(text, voiceStyle) {
  const request = {
    input: { text },
    voice: getVoiceConfig(voiceStyle),
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0,
    },
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
}

function getVoiceConfig(style) {
  const voices = {
    casual: { languageCode: 'en-US', name: 'en-US-Neural2-F' },
    formal: { languageCode: 'en-US', name: 'en-US-Neural2-D' },
    neutral: { languageCode: 'en-US', name: 'en-US-Neural2-A' },
  };
  
  return voices[style] || voices.neutral;
}

function splitTextIntoChunks(text, maxLength) {
  const chunks = [];
  let currentChunk = '';
  
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

module.exports = {
  generateSpeech,
}; 