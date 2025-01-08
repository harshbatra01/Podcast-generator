'use client'

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface VoiceSelectorProps {
  onSelect: (voice: string) => void;
  disabled?: boolean;
  speaker?: string;
}

export function VoiceSelector({ onSelect, disabled, speaker = "speaker1" }: VoiceSelectorProps) {
  const handleVoiceStyleChange = (style: string) => {
    const voiceMap = {
      casual: 'US English Female',
      formal: 'UK English Male',
      neutral: 'UK English Female'
    };
    onSelect(voiceMap[style as keyof typeof voiceMap]);
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow">
      <h3 className="text-lg font-medium mb-2 text-purple-700">
        {speaker === "speaker1" ? "Speaker 1" : "Speaker 2"} Voice Style
      </h3>
      <RadioGroup 
        defaultValue="neutral" 
        onValueChange={handleVoiceStyleChange}
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="casual" id={`${speaker}-casual`} />
          <Label htmlFor={`${speaker}-casual`} className="text-pink-600">
            Casual
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="formal" id={`${speaker}-formal`} />
          <Label htmlFor={`${speaker}-formal`} className="text-pink-600">
            Formal
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="neutral" id={`${speaker}-neutral`} />
          <Label htmlFor={`${speaker}-neutral`} className="text-pink-600">
            Neutral
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
} 