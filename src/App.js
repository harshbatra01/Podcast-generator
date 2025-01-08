import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import VoiceSelector from './components/VoiceSelector';
import { generateSpeech, cancelSpeech, isPlaying } from './services/textToSpeech';
import { generateScript } from './services/cohere';
import LoadingSpinner from './components/LoadingSpinner';
import { TEST_SCRIPT } from './constants/testData';

const DEFAULT_VOICE = 'UK English Female';

function App() {
  const [uploadedText, setUploadedText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useScriptGeneration, setUseScriptGeneration] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'script', 'voice', 'audio'

  useEffect(() => {
    if (window.responsiveVoice) {
      window.responsiveVoice.enableWindowClickHook();
    }
  }, []);

  const handleTextUpload = async (text) => {
    setIsProcessing(true);
    setError(null);
    try {
      setUploadedText(text);
      setGeneratedScript(''); // Reset generated script when new text is uploaded
    } catch (err) {
      setError('Error processing the uploaded file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice);
  };

  const handleGenerateScript = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Generating script from text:', uploadedText.substring(0, 100) + '...');
      const script = await generateScript(uploadedText);
      console.log('Script generated successfully');
      setGeneratedScript(script);
      setUseScriptGeneration(true);
    } catch (err) {
      console.error('Error generating script:', err);
      setError('Error generating script: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (isProcessing || isPlaying) return;

    setIsProcessing(true);
    setError(null);

    try {
      let textToSpeak = uploadedText;
      
      // If script generation is enabled, generate script first
      if (useScriptGeneration && !generatedScript) {
        console.log('Generating script first...');
        const script = await generateScript(uploadedText);
        setGeneratedScript(script);
        textToSpeak = script;
      } else if (useScriptGeneration) {
        textToSpeak = generatedScript;
      }

      // Validate text
      if (!textToSpeak || textToSpeak.trim().length === 0) {
        throw new Error('Please provide some text to convert to speech');
      }

      const voiceToUse = selectedVoice || DEFAULT_VOICE;

      console.log('Starting audio generation...');
      setIsPlaying(true);
      
      await generateSpeech(textToSpeak, voiceToUse, {
        pitch: 1,
        rate: 1,
        volume: 1,
        onstart: () => {
          console.log('Speech started');
          setIsProcessing(false);
        },
        onend: () => {
          console.log('Speech completed successfully');
          setIsPlaying(false);
          setIsProcessing(false);
        },
        onerror: (error) => {
          console.error('Speech error:', error);
          setError(`Error generating audio: ${error}`);
          setIsPlaying(false);
          setIsProcessing(false);
        }
      });
    } catch (err) {
      console.error('Error in handleGenerateAudio:', err);
      setError(`Error generating audio: ${err.message}`);
      setIsPlaying(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = () => {
    try {
      cancelSpeech();
      setIsPlaying(false);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error stopping speech:', err);
      setError('Failed to stop speech playback');
    }
  };

  const handleReset = () => {
    setIsProcessing(false);
    setIsPlaying(false);
    setError(null);
    cancelSpeech();
  };

  const moveToNextStep = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className="app">
      <header>
        <h1>Podcast Generator</h1>
      </header>
      
      <main>
        <div className="steps">
          <div className={`step ${currentStep === 'upload' ? 'active' : ''}`}>1. Upload PDF</div>
          <div className={`step ${currentStep === 'script' ? 'active' : ''}`}>2. Generate Script</div>
          <div className={`step ${currentStep === 'voice' ? 'active' : ''}`}>3. Select Voice</div>
          <div className={`step ${currentStep === 'audio' ? 'active' : ''}`}>4. Generate Audio</div>
        </div>

        {currentStep === 'upload' && (
          <FileUpload 
            onUpload={(text) => {
              handleTextUpload(text);
              moveToNextStep('script');
            }} 
          />
        )}

        {currentStep === 'script' && uploadedText && (
          <div className="script-section">
            <div className="script-options">
              <h3>Step 2: Generate Podcast Script</h3>
              <p>Would you like to convert your text into a podcast script format?</p>
              
              <div className="script-actions">
                <button
                  onClick={handleGenerateScript}
                  disabled={isProcessing}
                  className="generate-script-button"
                >
                  {isProcessing ? 'Generating Script...' : 'Generate Podcast Script'}
                </button>
              </div>
            </div>

            {isProcessing && <LoadingSpinner />}

            {generatedScript && (
              <div className="generated-script">
                <h3>Generated Podcast Script:</h3>
                <div className="script-content">
                  {generatedScript}
                </div>
                <div className="script-actions">
                  <button
                    onClick={handleGenerateScript}
                    disabled={isProcessing}
                    className="regenerate-button"
                  >
                    Regenerate Script
                  </button>
                  <button
                    onClick={() => moveToNextStep('voice')}
                    className="next-step-button"
                  >
                    Use This Script
                  </button>
                </div>
              </div>
            )}

            <div className="script-actions">
              <button
                onClick={() => moveToNextStep('voice')}
                className="skip-button"
              >
                Skip Script Generation
              </button>
            </div>
          </div>
        )}

        {currentStep === 'voice' && (
          <div className="voice-section">
            <VoiceSelector 
              onSelect={(voice) => {
                handleVoiceSelect(voice);
                moveToNextStep('audio');
              }}
              disabled={isProcessing}
            />
          </div>
        )}

        {currentStep === 'audio' && (
          <div className="audio-section">
            <div className="preview-text">
              <h3>Text to be converted:</h3>
              <div className="script-content">
                {useScriptGeneration ? generatedScript : uploadedText}
              </div>
            </div>

            <div className="controls">
              <button 
                onClick={handleGenerateAudio}
                disabled={isProcessing || isPlaying}
                className="generate-button"
              >
                {isPlaying ? 'Playing...' : 'Generate Audio'}
              </button>
              {isPlaying && (
                <button onClick={handleStop} className="stop-button">
                  Stop
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
            <button onClick={handleReset} className="reset-button">
              Reset
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 