'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { FileUpload } from '@/components/FileUpload'
import { TextDisplay } from '@/components/TextDisplay'
import { Loader2 } from 'lucide-react'
import { CohereClient } from 'cohere-ai'
import { config } from '@/lib/config'
import { speechService } from '@/lib/speech-service'

// Initialize Cohere client
const cohere = new CohereClient({
  token: config.cohereKey
})

export default function PodcastGenerator() {
  const [uploadedText, setUploadedText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcriptData, setTranscriptData] = useState<{ 
    text: string, 
    speaker: string, 
    start: number, 
    end: number,
    isActive?: boolean 
  }[]>([])

  const handleTextUpload = async (text: string) => {
    setIsProcessing(true)
    setError(null)
    try {
      if (text === 'pdf-processing' && selectedFile?.type === 'application/pdf') {
        await processPDFContent(selectedFile)
      } else {
        setUploadedText(text)
      }
    } catch (err) {
      setError('Error processing the file')
    } finally {
      setIsProcessing(false)
    }
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processPDFContent = async (file: File) => {
    try {
      setIsProcessing(true);
      
      const pdfText = await extractPDFText(file);
      console.log('Extracted PDF text:', pdfText);
      
      const script = await generatePodcastScript(pdfText);
      console.log('Generated podcast script:', script);
      
      const lines = script.split('\n').filter(line => line.trim());
      
      const newTranscriptData = lines.map((line, index) => ({
        text: line,
        speaker: line.toLowerCase().includes('speaker 1') ? 'speaker1' : 'speaker2',
        start: index * 2,
        end: (index + 1) * 2
      }));
      setTranscriptData(newTranscriptData);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isSpeaker1 = line.toLowerCase().includes('speaker 1');
        const voice = isSpeaker1 ? 'US English Female' : 'UK English Male';
        const textToSpeak = line.replace(/Speaker [12]:/, '').trim();

        console.log(`Speaking line ${i + 1}:`, textToSpeak);
        
        setTranscriptData(prev => prev.map((item, idx) => ({
          ...item,
          isActive: idx === i
        })));

        await speechService.generateAudio(textToSpeak, voice);
        await delay(500);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Failed to process PDF file');
    } finally {
      setIsProcessing(false);
    }
  }

  const extractPDFText = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry')
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false
      })

      const pdf = await loadingTask.promise
      let fullText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ')
        fullText += pageText + '\n\n'
      }

      return fullText.trim()
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  const generatePodcastScript = async (text: string): Promise<string> => {
    try {
      console.log('Generating script with text:', text.substring(0, 100) + '...');
      
      const response = await cohere.generate({
        model: 'command',
        prompt: `Create a natural podcast conversation between two hosts discussing this text.
                Format EXACTLY as follows, with each line starting with the speaker label only:
                Speaker 1: Hey, let's talk about [main theme]. [Ask engaging opening question]
                Speaker 2: [Natural response without announcing 'response']
                Speaker 1: [Follow-up question or comment]
                Speaker 2: [Natural continuation of discussion]
                Speaker 1: [Deeper insight or observation]
                Speaker 2: [Concluding thoughts]
                
                Important:
                - Don't use words like "Question:" or "Response:"
                - Keep dialogue natural and conversational
                - Each line should start with only "Speaker 1:" or "Speaker 2:"
                
                Text to discuss: ${text.substring(0, 1000)}`,
        maxTokens: 500,
        temperature: 0.8,
      });

      const script = response.generations[0].text;
      console.log('Generated script:', script);
      
      const formattedScript = script
        .split('\n')
        .filter(line => line.trim())
        .filter(line => line.toLowerCase().includes('speaker'))
        .map(line => line.trim())
        .join('\n');

      return formattedScript;
    } catch (error) {
      console.error('Cohere API error:', error);
      throw error;
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  useEffect(() => {
    speechService.init();
    return () => {
      speechService.stopAudio();
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="text-center pb-6 md:pb-8 border-b px-4 sm:px-6 md:px-8">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Podcast Generator
            </CardTitle>
            <CardDescription className="text-base sm:text-lg mt-2 text-gray-600">
              Transform your text into an engaging podcast
            </CardDescription>
            <p className="mt-4 text-sm text-gray-500">
              Upload a PDF file and we'll convert it into a natural conversation between two hosts
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8 relative">
            <div className="space-y-6">
              <FileUpload 
                onUpload={handleTextUpload}
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
              />

              {transcriptData.length > 0 && (
                <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg border border-gray-100">
                  <TextDisplay transcriptData={transcriptData} />
                </div>
              )}

              {error && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm sm:text-base">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 