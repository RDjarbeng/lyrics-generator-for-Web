import React from 'react';
import { Settings, Image, Type, Palette, Clock, Mic } from 'lucide-react';

const ConfigPanel = ({ settings, onUpdate }) => {
    const handleChange = (key, value) => {
        onUpdate({ ...settings, [key]: value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('bgImage', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Settings size={20} /> Configuration
            </h2>

            {/* Background Settings */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Image size={16} /> Background Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {['solid', 'image', 'transparent'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => handleChange('bgMode', mode)}
                            className={`px-3 py-2 rounded text-sm capitalize transition-colors ${settings.bgMode === mode
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {settings.bgMode === 'solid' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={settings.bgColor}
                            onChange={(e) => handleChange('bgColor', e.target.value)}
                            className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-sm text-gray-400">Background Color</span>
                    </div>
                )}

                {settings.bgMode === 'image' && (
                    <div className="space-y-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                cursor-pointer"
                        />
                        {settings.bgImage && (
                            <div className="relative h-20 w-full rounded overflow-hidden border border-gray-600">
                                <img src={settings.bgImage} alt="Background Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Text Settings */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Type size={16} /> Text Style
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Font Size (px)</label>
                        <input
                            type="number"
                            value={settings.fontSize}
                            onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Color</label>
                        <div className="flex items-center gap-2 h-[38px]">
                            <input
                                type="color"
                                value={settings.textColor}
                                onChange={(e) => handleChange('textColor', e.target.value)}
                                className="h-full w-12 rounded cursor-pointer bg-transparent border-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Font Family</label>
                        <select
                            value={settings.fontFamily}
                            onChange={(e) => handleChange('fontFamily', e.target.value)}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Style</label>
                        <div className="flex gap-2">
                            <select
                                value={settings.fontWeight}
                                onChange={(e) => handleChange('fontWeight', e.target.value)}
                                className="w-1/2 bg-gray-700 text-white px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                            </select>
                            <select
                                value={settings.fontStyle}
                                onChange={(e) => handleChange('fontStyle', e.target.value)}
                                className="w-1/2 bg-gray-700 text-white px-2 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="normal">Normal</option>
                                <option value="italic">Italic</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500 block mb-1">Vertical Position ({settings.textY}%)</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.textY}
                            onChange={(e) => handleChange('textY', Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Timing Settings */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Clock size={16} /> Timing Logic
                </label>
                <p className="text-xs text-gray-400">
                    Duration = Base Time + (Chars * Multiplier)
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Base Time (s)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={settings.baseTime}
                            onChange={(e) => handleChange('baseTime', Number(e.target.value))}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Per Char (s)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={settings.charMultiplier}
                            onChange={(e) => handleChange('charMultiplier', Number(e.target.value))}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>
            {/* Audio Settings */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mic size={16} /> Audio
                </label>
                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="checkbox"
                        id="tts-toggle"
                        checked={settings.enableTTS}
                        onChange={(e) => handleChange('enableTTS', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <label htmlFor="tts-toggle" className="text-sm text-gray-400 select-none">
                        Enable Text-to-Speech (Browser Native)
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ConfigPanel;
