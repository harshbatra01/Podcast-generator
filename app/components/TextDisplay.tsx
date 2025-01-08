'use client'

interface TextDisplayProps {
  transcriptData: {
    text: string;
    speaker: string;
    start: number;
    end: number;
    isActive?: boolean;
  }[];
}

export function TextDisplay({ transcriptData }: TextDisplayProps) {
  return (
    <div className="space-y-2 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
      {transcriptData.map((item, index) => (
        <div
          key={index}
          className={`p-2 rounded ${
            item.isActive
              ? 'bg-purple-100 border-l-4 border-purple-500'
              : 'hover:bg-gray-50'
          }`}
        >
          <p className={`text-sm ${item.speaker === 'speaker1' ? 'text-purple-700' : 'text-pink-600'}`}>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
} 