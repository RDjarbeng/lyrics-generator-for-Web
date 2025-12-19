import { VoiceProvider } from './VoiceProvider';

export class ElevenLabsVoiceProvider extends VoiceProvider {
    constructor(apiKey) {
        super();
        this.id = 'elevenlabs';
        this.name = 'ElevenLabs';
        this.apiKey = apiKey;
    }

    async getVoices() {
        if (!this.apiKey) return [];

        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });

            if (!response.ok) throw new Error('Failed to fetch voices');

            const data = await response.json();
            return data.voices.map(v => ({
                id: v.voice_id,
                name: v.name,
                lang: 'en', // ElevenLabs is mostly multilingual now, but we can default to en or check labels
                previewUrl: v.preview_url
            }));
        } catch (error) {
            console.error('ElevenLabs getVoices error:', error);
            return [];
        }
    }

    async speak(text, voiceId, _options = {}) {
        if (!this.apiKey) {
            throw new Error('ElevenLabs API Key is missing');
        }

        // Default model
        const modelId = 'eleven_monolingual_v1';

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': this.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: modelId,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail?.message || 'Failed to generate speech');
        }

        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    }
}
