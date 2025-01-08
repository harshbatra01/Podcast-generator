import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './FileUpload.css';

// Set up PDF.js worker
const pdfjsWorker = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function FileUpload({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromPDF = async (file) => {
    try {
      // Load the PDF file
      const arrayBuffer = await file.arrayBuffer();
      
      // Create a new worker instance for each PDF
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: true,
        useSystemFonts: true
      });

      const pdf = await loadingTask.promise;
      let fullText = '';

      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      // Clean up
      await pdf.destroy();
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    setIsProcessing(true);

    try {
      let text;
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in file');
      }

      console.log('Extracted text:', text.substring(0, 200) + '...');
      await onUpload(text);
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div 
      className={`file-upload ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-input"
        onChange={handleFileInput}
        accept=".txt,.doc,.docx,.pdf"
        disabled={isProcessing}
      />
      <label htmlFor="file-input">
        {isProcessing ? (
          <div className="processing-message">
            <h2>Processing File...</h2>
            <p>Please wait while we extract the text</p>
          </div>
        ) : (
          <>
            <h2>Upload Text</h2>
            <p>Drag and drop a file here or click to select</p>
            <p className="file-types">Supported files: TXT, DOC, DOCX, PDF</p>
          </>
        )}
      </label>
    </div>
  );
}

export default FileUpload; 