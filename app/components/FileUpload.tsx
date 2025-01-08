'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "../components/ui/button"
import { Upload, File as FileIcon, Loader2 } from 'lucide-react'

interface FileUploadProps {
  onUpload: (text: string) => void;
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onUpload, onFileSelect, isProcessing }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (selectedFile) {
        setSelectedFile(null)
        setFileName(null)
      }
    }
  }, [])

  const processFile = async (file: File) => {
    setIsUploading(true)
    try {
      if (file.type === 'text/plain') {
        const text = await file.text()
        onUpload(text)
      } else {
        onFileSelect(file)
      }
      setFileName(file.name)
      setSelectedFile(file)
    } catch (error) {
      console.error('Error processing file:', error)
      clearFile()
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      await processFile(file)
    }
  }, [onUpload, onFileSelect])

  const clearFile = () => {
    setFileName(null)
    setSelectedFile(null)
    onUpload('')
    onFileSelect(null as any)
  }

  const handleGeneratePodcast = () => {
    if (selectedFile?.type === 'application/pdf') {
      onUpload('pdf-processing')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isUploading || isProcessing
  })

  return (
    <div className="w-full p-4">
      <div
        {...getRootProps()}
        className={`
          relative rounded-lg border-2 border-dashed p-12
          flex flex-col items-center justify-center
          transition-colors duration-200 ease-in-out
          ${(isUploading || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} className="sr-only" />
        {fileName ? (
          <div className="flex items-center space-x-3">
            <FileIcon className="h-8 w-8 text-purple-500" />
            <span className="text-sm font-medium text-gray-900">{fileName}</span>
            {(isUploading || isProcessing) && (
              <div className="flex items-center space-x-2 text-purple-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {isProcessing ? "Generating podcast..." : "Processing..."}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="mb-2 text-xl font-medium text-gray-900">
              {isDragActive ? "Drop the file here" : "Drag & Drop"}
            </p>
            <p className="text-sm text-gray-500">
              or click to select a file
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: TXT, PDF, DOCX
            </p>
          </>
        )}
      </div>

      {fileName && !isUploading && !isProcessing && (
        <div className="mt-4 flex gap-4">
          <Button 
            onClick={clearFile}
            variant="outline"
            className="flex-1"
          >
            Clear File
          </Button>
          {selectedFile?.type === 'application/pdf' && (
            <Button 
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleGeneratePodcast}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Podcast"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 