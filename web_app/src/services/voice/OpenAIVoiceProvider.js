import { VoiceProvider } from './VoiceProvider';

export class OpenAIVoiceProvider extends VoiceProvider {
    constructor(apiKey) {
        super();
        this.id = 'openai';
        this.name = 'OpenAI TTS';
        this.apiKey = apiKey;
    }

    async getVoices() {
        // OpenAI has a fixed set of voices
        return [
            { id: 'alloy', name: 'Alloy', lang: 'en' },
            { id: 'echo', name: 'Echo', lang: 'en' },
            { id: 'fable', name: 'Fable', lang: 'en' },
            { id: 'onyx', name: 'Onyx', lang: 'en' },
            { id: 'nova', name: 'Nova', lang: 'en' },
            { id: 'shimmer', name: 'Shimmer', lang: 'en' }
        ];
    }

    async speak(text, voiceId, options = {}) {
        if (!this.apiKey) {
            throw new Error('OpenAI API Key is missing');
        }

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: voiceId,
                speed: options.speed || 1.0
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate speech');
        }

        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    }
}
