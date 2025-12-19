import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Loader2, Save, RefreshCw } from 'lucide-react';
import { voiceManager } from '../../services/voice/VoiceManager';

export default function VoiceControlPanel({ settings, onUpdate, disabled }) {
    const [activeProvider, setActiveProvider] = useState(settings.voiceProvider || 'native');
    const [apiKeys, setApiKeys] = useState({ openai: '', elevenlabs: '' });
    const [voices, setVoices] = useState([]);
    const [loadingVoices, setLoadingVoices] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [error, setError] = useState(null);

    // Load initial state
    useEffect(() => {
        const savedKeys = JSON.parse(localStorage.getItem('voice_api_keys') || '{}');
        setApiKeys({
            openai: savedKeys.openai || '',
            elevenlabs: savedKeys.elevenlabs || ''
        });

        // If we have a provider in settings, ensure manager matches
        if (settings.voiceProvider && settings.voiceProvider !== voiceManager.activeProviderId) {
            voiceManager.setProvider(settings.voiceProvider);
        }
        setActiveProvider(voiceManager.activeProviderId);

        if (!disabled) {
            loadVoices(voiceManager.activeProviderId);
        }
    }, [disabled]); // Reload when enabled

    // Listen for local model download progress
    useEffect(() => {
        const handleProgress = (data) => {
            setDownloadProgress(data);
        };
        voiceManager.onProgress(handleProgress);
    }, []);

    const loadVoices = async (providerId) => {
        setLoadingVoices(true);
        setError(null);
        try {
            voiceManager.setProvider(providerId);

            // If cloud provider and no key, don't fetch yet
            if ((providerId === 'openai' && !apiKeys.openai) ||
                (providerId === 'elevenlabs' && !apiKeys.elevenlabs)) {
                setVoices([]);
                setLoadingVoices(false);
                return;
            }

            // Update keys before fetching
            voiceManager.saveKeys(apiKeys);

            const fetchedVoices = await voiceManager.getVoices();
            setVoices(fetchedVoices);

            // If current selected voice is not in list, select first
            if (fetchedVoices.length > 0) {
                if (!settings.voiceId || !fetchedVoices.find(v => v.id === settings.voiceId)) {
                    onUpdate('voiceId', fetchedVoices[0].id);
                }
            }
        } catch (err) {
            console.error("Failed to load voices", err);
            setError(err.message);
            setVoices([]);
        } finally {
            setLoadingVoices(false);
        }
    };

    const handleProviderChange = (id) => {
        setActiveProvider(id);
        onUpdate('voiceProvider', id);
        loadVoices(id);
    };

    const handleKeyChange = (provider, value) => {
        const newKeys = { ...apiKeys, [provider]: value };
        setApiKeys(newKeys);
    };

    const saveKeys = () => {
        voiceManager.saveKeys(apiKeys);
        loadVoices(activeProvider);
    };

    return (
        <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>

            {/* Provider Selector */}
            <div className="space-y-2">
                <label className="text-xs text-gray-500 block">Voice Engine</label>
                <select
                    value={activeProvider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                >
                    <option value="native">Browser Native (Free)</option>
                    <option value="openai">OpenAI (High Quality)</option>
                    <option value="elevenlabs">ElevenLabs (Premium)</option>
                    <option value="local">Local AI (Offline)</option>
                </select>
            </div>

            {/* API Key Input */}
            {(activeProvider === 'openai' || activeProvider === 'elevenlabs') && (
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 block">
                        {activeProvider === 'openai' ? 'OpenAI API Key' : 'ElevenLabs API Key'}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={apiKeys[activeProvider]}
                            onChange={(e) => handleKeyChange(activeProvider, e.target.value)}
                            placeholder="Enter API Key"
                            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                        />
                        <button
                            onClick={saveKeys}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                            title="Save Key"
                        >
                            <Save size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Local AI Progress */}
            {activeProvider === 'local' && downloadProgress && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Downloading model...</span>
                        <span>{Math.round(downloadProgress.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${downloadProgress.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-2 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Voice Selector */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-500 block">Voice</label>
                    <button
                        onClick={() => loadVoices(activeProvider)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Refresh Voices"
                    >
                        <RefreshCw size={12} />
                    </button>
                </div>

                {loadingVoices ? (
                    <div className="flex items-center justify-center py-2 bg-gray-700 rounded border border-gray-600">
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    <select
                        value={settings.voiceId || ''}
                        onChange={(e) => onUpdate('voiceId', e.target.value)}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                        disabled={voices.length === 0}
                    >
                        {voices.length === 0 ? (
                            <option value="">No voices available</option>
                        ) : (
                            voices.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.name}
                                </option>
                            ))
                        )}
                    </select>
                )}
            </div>
        </div>
    );
}
