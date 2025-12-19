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
    enableTTS: false,
    voiceProvider: 'native',
    voiceId: null
  });

  const [filename, setFilename] = useState("lyric_video");

  const parsedLyrics = useMemo(() => {
    return parseLyrics(lyricsText, settings.baseTime, settings.charMultiplier);
  }, [lyricsText, settings.baseTime, settings.charMultiplier]);

  const StatsDisplay = () => (
    <div className="bg-gray-800 p-3 lg:p-6 rounded-lg shadow-lg">
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

            // Optimize for Square (1:1) - ~44% fewer pixels than 16:9
            if (settings.aspectRatio === '1:1') {
              bitrate = bitrate * 0.6;
            }

            const sizeMB = (duration * bitrate) / 8 / 1024 / 1024;
            return sizeMB.toFixed(1);
          })()} MB
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 font-sans">
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center gap-3 mb-2">
          <img src="/icon.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-lg" />
          Lyric Video Generator
        </h1>
        <p className="text-gray-400 text-lg">Turn your poems into videos and customize it to your liking</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">
        {/* Left Panel: Controls (4 cols) - Order 2 on mobile */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-6 order-2 lg:order-1">
          <LyricInput value={lyricsText} onChange={setLyricsText} />

          {/* Stats on Mobile (placed after Lyrics) */}
          <div className="block lg:hidden">
            <StatsDisplay />
          </div>

          <div className="bg-gray-800 p-3 lg:p-4 rounded-lg shadow-lg">
            <label className="block text-sm font-medium text-gray-400 mb-1">Output Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
              placeholder="lyric_video"
            />
          </div>
          <ConfigPanel
            settings={settings}
            onUpdate={setSettings}
          />
        </div>

        {/* Right Panel: Preview (8 cols) - Order 1 on mobile */}
        <div className="lg:col-span-8 space-y-4 lg:space-y-6 lg:sticky lg:top-8 h-fit order-1 lg:order-2">
          <div className="bg-gray-800 p-3 lg:p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2 lg:mb-4 text-white">Preview & Export</h2>
            <PreviewCanvas lyrics={parsedLyrics} settings={settings} onUpdateSettings={setSettings} filename={filename} />
          </div>

          {/* Stats on Desktop (placed under Preview) */}
          <div className="hidden lg:block">
            <StatsDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;
