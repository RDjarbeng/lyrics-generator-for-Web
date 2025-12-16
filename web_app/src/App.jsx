import React, { useState, useEffect, useMemo } from 'react';
import LyricInput from './components/LyricInput';
import ConfigPanel from './components/ConfigPanel';
import PreviewCanvas from './components/PreviewCanvas';
import { parseLyrics } from './utils/lyricUtils';

function App() {
  const [lyricsText, setLyricsText] = useState("Hello world\nThis is a lyric video\nGenerated in the browser");

  const [settings, setSettings] = useState({
    bgMode: 'solid', // solid, image, transparent
    bgColor: '#111827', // gray-900
    bgImage: null,
    textColor: '#ffffff',
    fontSize: 60,
    textY: 50, // % from top
    fontFamily: 'Arial',
    fontWeight: 'bold', // normal, bold
    fontStyle: 'normal', // normal, italic
    exportQuality: 'medium', // high (5Mbps), medium (2.5Mbps), low (1Mbps)
    aspectRatio: '16:9', // 16:9, 9:16, 1:1
    baseTime: 2.0,
    charMultiplier: 0.1,
    enableTTS: false
  });

  const parsedLyrics = useMemo(() => {
    return parseLyrics(lyricsText, settings.baseTime, settings.charMultiplier);
  }, [lyricsText, settings.baseTime, settings.charMultiplier]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Lyric Video Generator
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <LyricInput value={lyricsText} onChange={setLyricsText} />
          <ConfigPanel settings={settings} onUpdate={setSettings} />
        </div>

        {/* Right Panel: Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Preview & Export</h2>
            <PreviewCanvas lyrics={parsedLyrics} settings={settings} onUpdateSettings={setSettings} />
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-white">Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
              <div>Lines: {parsedLyrics.length}</div>
              <div>Total Duration: {parsedLyrics.reduce((acc, l) => acc + l.duration, 0).toFixed(1)}s</div>
              <div>
                Est. File Size: ~{(() => {
                  const duration = parsedLyrics.reduce((acc, l) => acc + l.duration, 0);
                  let bitrate = 2500000; // Medium
                  if (settings.exportQuality === 'high') bitrate = 5000000;
                  if (settings.exportQuality === 'low') bitrate = 1000000;
                  const sizeMB = (duration * bitrate) / 8 / 1024 / 1024;
                  return sizeMB.toFixed(1);
                })()} MB
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
