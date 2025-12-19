/**
 * Base class for all Voice Providers.
 * Defines the interface that must be implemented.
 */
export class VoiceProvider {
    constructor() {
        this.id = 'base';
        this.name = 'Base Provider';
    }

    /**
     * Returns a list of available voices.
     * @returns {Promise<Array<{id: string, name: string, lang?: string}>>}
     */
    async getVoices() {
        throw new Error('getVoices() must be implemented');
    }

    /**
     * Synthesizes speech from text.
     * @param {string} text - The text to speak.
     * @param {string} voiceId - The ID of the voice to use.
     * @param {object} options - Additional options (speed, pitch, etc.)
     * @returns {Promise<AudioBuffer|string>} - Returns AudioBuffer or URL to audio file.
     */
    async speak(text, voiceId, _options = {}) {
        throw new Error('speak() must be implemented');
    }
}
