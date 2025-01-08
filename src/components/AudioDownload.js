import React from 'react';

function AudioDownload({ audioBlob }) {
  const handleDownload = () => {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'podcast.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleDownload} className="download-button">
      Download Podcast
    </button>
  );
}

export default AudioDownload; 