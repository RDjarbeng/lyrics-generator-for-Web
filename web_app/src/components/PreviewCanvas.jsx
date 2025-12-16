import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Download, RefreshCw, Monitor, Smartphone, Square } from 'lucide-react';
import { wrapText } from '../utils/lyricUtils';

const PreviewCanvas = ({ lyrics, settings, onUpdateSettings }) => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const requestRef = useRef();
    const startTimeRef = useRef();
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    // Calculate dimensions based on Aspect Ratio
    const getDimensions = () => {
        switch (settings.aspectRatio) {
            case '9:16': return { width: 1080, height: 1920 };
            case '1:1': return { width: 1080, height: 1080 };
            case '16:9': default: return { width: 1920, height: 1080 };
        }
    };

    const { width, height } = getDimensions();

    // Calculate total duration
    const totalDuration = lyrics.reduce((acc, line) => acc + line.duration, 0);

    const draw = (time) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // 1. Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Background
        if (settings.bgMode === 'solid') {
            ctx.fillStyle = settings.bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (settings.bgMode === 'image' && settings.bgImage) {
            const img = new Image();
            img.src = settings.bgImage;
            if (img.complete) {
                // Draw image to cover
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
        }

        // 3. Find current lyric
        let elapsed = 0;
        let currentLine = null;

        for (const line of lyrics) {
            if (time >= elapsed && time < elapsed + line.duration) {
                currentLine = line;
                break;
            }
            elapsed += line.duration;
        }

        // 4. Draw Text
        if (currentLine) {
            const fontStyle = settings.fontStyle || 'normal';
            const fontWeight = settings.fontWeight || 'bold';
            const fontFamily = settings.fontFamily || 'Arial';

            ctx.font = `${fontStyle} ${fontWeight} ${settings.fontSize}px "${fontFamily}"`;
            ctx.fillStyle = settings.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Calculate Y position based on percentage
            const yPos = (canvas.height * (settings.textY || 50)) / 100;

            wrapText(ctx, currentLine.text, canvas.width / 2, yPos, canvas.width - 100, settings.fontSize * 1.5);
        }
    };

    // Animation Loop
    const animate = (time) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const progress = (time - startTimeRef.current) / 1000; // seconds

        let newTime = progress;
        if (newTime >= totalDuration) {
            newTime = totalDuration;
            setIsPlaying(false);
            if (isRecording) stopRecording();
        }

        setCurrentTime(newTime);
        draw(newTime);

        if (isPlaying && newTime < totalDuration) {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            startTimeRef.current = performance.now() - (currentTime * 1000);
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
            draw(currentTime); // Draw static frame
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, lyrics, settings, width, height]);

    // Redraw when settings/time change manually
    useEffect(() => {
        if (!isPlaying) {
            draw(currentTime);
        }
    }, [currentTime, lyrics, settings, width, height]);

    // Preload image if needed
    useEffect(() => {
        if (settings.bgMode === 'image' && settings.bgImage) {
            const img = new Image();
            img.src = settings.bgImage;
            img.onload = () => {
                if (!isPlaying) draw(currentTime);
            };
        }
    }, [settings.bgImage]);

    // TTS Logic
    const lastSpokenIndex = useRef(-1);

    useEffect(() => {
        if (!isPlaying) {
            lastSpokenIndex.current = -1;
            window.speechSynthesis.cancel();
            return;
        }

        if (!settings.enableTTS) return;

        let elapsed = 0;
        let currentLineIndex = -1;

        for (let i = 0; i < lyrics.length; i++) {
            if (currentTime >= elapsed && currentTime < elapsed + lyrics[i].duration) {
                currentLineIndex = i;
                break;
            }
            elapsed += lyrics[i].duration;
        }

        if (currentLineIndex !== -1 && currentLineIndex !== lastSpokenIndex.current) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(lyrics[currentLineIndex].text);
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
            lastSpokenIndex.current = currentLineIndex;
        }
    }, [currentTime, isPlaying, settings.enableTTS, lyrics]);


    const handlePlayPause = () => {
        if (currentTime >= totalDuration) {
            setCurrentTime(0);
        }
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const startRecording = () => {
        const canvas = canvasRef.current;
        const stream = canvas.captureStream(30); // 30 FPS

        let bitsPerSecond = 2500000;
        if (settings.exportQuality === 'high') bitsPerSecond = 5000000;
        if (settings.exportQuality === 'low') bitsPerSecond = 1000000;

        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            bitsPerSecond: bitsPerSecond
        });

        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lyric_video_${settings.aspectRatio.replace(':', '-')}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            setIsRecording(false);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setCurrentTime(0);
        setIsPlaying(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const updateSetting = (key, value) => {
        onUpdateSettings({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-4">
            {/* Aspect Ratio Selector */}
            <div className="flex justify-center gap-4 mb-2">
                <button
                    onClick={() => updateSetting('aspectRatio', '16:9')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${settings.aspectRatio === '16:9' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Monitor size={18} /> Landscape (16:9)
                </button>
                <button
                    onClick={() => updateSetting('aspectRatio', '9:16')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${settings.aspectRatio === '9:16' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Smartphone size={18} /> Mobile (9:16)
                </button>
                <button
                    onClick={() => updateSetting('aspectRatio', '1:1')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${settings.aspectRatio === '1:1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Square size={18} /> Square (1:1)
                </button>
            </div>

            <div className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 shadow-2xl flex justify-center bg-black">
                {/* Checkerboard background */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                </div>

                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="relative z-10 shadow-2xl"
                    style={{
                        maxHeight: '400px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        aspectRatio: `${width}/${height}`
                    }}
                />

                {/* Overlays */}
                {isRecording && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse z-20 font-bold flex items-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        Recording: {Math.round((currentTime / totalDuration) * 100)}%
                    </div>
                )}

                {isRecording && (
                    <div className="absolute bottom-0 left-0 h-2 bg-red-600 z-20 transition-all duration-100 ease-linear"
                        style={{ width: `${(currentTime / totalDuration) * 100}%` }}>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between bg-gray-800 p-4 rounded-lg gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <span className="text-mono text-white font-medium">
                        {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={settings.exportQuality}
                        onChange={(e) => updateSetting('exportQuality', e.target.value)}
                        className="bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                    >
                        <option value="high">High Quality (5 Mbps)</option>
                        <option value="medium">Medium Quality (2.5 Mbps)</option>
                        <option value="low">Low Quality (1 Mbps)</option>
                    </select>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={lyrics.length === 0 || isRecording}
                        className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors ${isRecording
                            ? 'bg-red-600 hover:bg-red-700 text-white cursor-default'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            } ${lyrics.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Download size={20} />
                        {isRecording ? 'Recording...' : 'Export Video'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewCanvas;
