'use client'

import { Button } from "@/components/ui/button"

interface AudioPreviewProps {
  audioUrl: string
}

export default function AudioPreview({ audioUrl }: AudioPreviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Audio Preview</h3>
      <audio controls className="w-full">
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <div className="flex justify-between">
        <Button onClick={() => window.open(audioUrl, '_blank')}>
          Download MP3
        </Button>
        <Button onClick={() => window.open(audioUrl.replace('.mp3', '.wav'), '_blank')}>
          Download WAV
        </Button>
      </div>
    </div>
  )
}

