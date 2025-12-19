import { VoiceProvider } from './VoiceProvider';

export class NativeVoiceProvider extends VoiceProvider {
    constructor() {
        super();
        this.id = 'native';
        this.name = 'Browser Native';
    }

    async getVoices() {
        return new Promise((resolve) => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                resolve(this._formatVoices(voices));
                return;
            }

            // Voices might load asynchronously
            window.speechSynthesis.onvoiceschanged = () => {
                const updatedVoices = window.speechSynthesis.getVoices();
                resolve(this._formatVoices(updatedVoices));
            };
        });
    }

    _formatVoices(voices) {
        return voices.map(v => ({
            id: v.name, // Native uses name as ID often, or we can use a combination
            name: v.name,
            lang: v.lang,
            original: v
        }));
    }

    async speak(text, voiceId, _options = {}) {
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);

            if (voiceId) {
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(v => v.name === voiceId);
                if (selectedVoice) utterance.voice = selectedVoice;
            }

            // Native TTS plays immediately, it doesn't return a buffer easily.
            // However, for our app, we might want to just play it.
            // But the interface expects a return. 
            // If we want to visualize it or export it, we have a problem with Native TTS:
            // It does NOT support exporting to AudioBuffer/File natively in browsers.

            // CRITICAL LIMITATION: Native TTS cannot be easily exported to video.
            // For now, we will just play it for preview. 
            // If the user wants to EXPORT, they might need to record system audio (hard) 
            // or we warn them that Native TTS is for preview only.

            // Actually, for the purpose of this app (Lyrics Video), we probably want to generate a video file.
            // Native TTS is useless for generating the final MP4/WebM file unless we record it in real-time.
            // We will resolve this by returning a "mock" buffer or handling it differently in the UI.
            // OR we just say "Native TTS (Preview Only)".

            // For now, let's just make it speak.

            utterance.onend = () => resolve(null); // Resolve when done speaking
            utterance.onerror = (e) => reject(e);

            window.speechSynthesis.speak(utterance);
        });
    }
}
