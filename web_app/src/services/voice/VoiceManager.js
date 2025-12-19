import { NativeVoiceProvider } from './NativeVoiceProvider';
import { OpenAIVoiceProvider } from './OpenAIVoiceProvider';
import { ElevenLabsVoiceProvider } from './ElevenLabsVoiceProvider';
import { LocalVoiceProvider } from './LocalVoiceProvider';

class VoiceManager {
    constructor() {
        this.providers = {
            native: new NativeVoiceProvider(),
            openai: new OpenAIVoiceProvider(null),
            elevenlabs: new ElevenLabsVoiceProvider(null),
            local: new LocalVoiceProvider((progress) => this._onProgress(progress))
        };

        this.activeProviderId = 'native';
        this.progressListeners = [];

        // Load saved keys
        this._loadKeys();
    }

    _loadKeys() {
        const keys = JSON.parse(localStorage.getItem('voice_api_keys') || '{}');
        if (keys.openai) this.providers.openai.apiKey = keys.openai;
        if (keys.elevenlabs) this.providers.elevenlabs.apiKey = keys.elevenlabs;
    }

    saveKeys(keys) {
        localStorage.setItem('voice_api_keys', JSON.stringify(keys));
        if (keys.openai) this.providers.openai.apiKey = keys.openai;
        if (keys.elevenlabs) this.providers.elevenlabs.apiKey = keys.elevenlabs;
    }

    setProvider(id) {
        if (this.providers[id]) {
            this.activeProviderId = id;
        }
    }

    get activeProvider() {
        return this.providers[this.activeProviderId];
    }

    async getVoices() {
        return await this.activeProvider.getVoices();
    }

    async speak(text, voiceId, options) {
        return await this.activeProvider.speak(text, voiceId, options);
    }

    onProgress(callback) {
        this.progressListeners.push(callback);
    }

    _onProgress(data) {
        this.progressListeners.forEach(cb => cb(data));
    }
}

export const voiceManager = new VoiceManager();
