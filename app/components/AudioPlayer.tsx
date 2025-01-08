'use client'

import { Button } from "@/components/ui/button"
import { Play, Pause, StopCircle } from 'lucide-react'

interface AudioPlayerProps {
  script: string;
  voices: { [key: string]: string };
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

export function AudioPlayer({ script, voices, isPlaying, onPlayPause, onStop }: AudioPlayerProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <Button
        onClick={onPlayPause}
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full"
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </Button>
      <Button
        onClick={onStop}
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full"
      >
        <StopCircle className="h-6 w-6" />
      </Button>
    </div>
  );
} 