import { VoiceProvider } from './VoiceProvider';
import { pipeline, env } from '@xenova/transformers';

// Skip local model checks since we are in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

export class LocalVoiceProvider extends VoiceProvider {
    constructor(onProgress) {
        super();
        this.id = 'local';
        this.name = 'Local AI (Transformers.js)';
        this.onProgress = onProgress || (() => { });
        this.synthesizer = null;
        this.modelId = 'Xenova/speecht5_tts';
        this.speakerEmbeddings = 'Xenova/speecht5_tts'; // Default embeddings
    }

    async init() {
        if (!this.synthesizer) {
            this.synthesizer = await pipeline('text-to-speech', this.modelId, {
                progress_callback: (data) => {
                    // data: { status: 'progress', name: 'file.onnx', file: 'file.onnx', progress: 0-100, loaded: 123, total: 123 }
                    if (data.status === 'progress') {
                        this.onProgress(data);
                    }
                }
            });
        }
    }

    async getVoices() {
        // SpeechT5 supports speaker embeddings, but for simplicity we'll start with one default
        // or we could load the CMU Arctic embeddings if we want multiple voices.
        // For this MVP, let's offer a single "Standard" voice.
        return [
            { id: 'default', name: 'Standard (SpeechT5)', lang: 'en' }
        ];
    }

    async speak(text, voiceId, _options = {}) {
        await this.init();

        // Generate speech
        // The synthesizer returns a Tensor or similar object containing audio data
        const out = await this.synthesizer(text, {
            speaker_embeddings: 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin'
        });

        // out is { audio: Float32Array, sampling_rate: number }

        // Convert Float32Array to AudioBuffer (or WAV ArrayBuffer)
        return this._encodeWAV(out.audio, out.sampling_rate);
    }

    _encodeWAV(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, samples.length * 2, true);

        const floatTo16BitPCM = (output, offset, input) => {
            for (let i = 0; i < input.length; i++, offset += 2) {
                const s = Math.max(-1, Math.min(1, input[i]));
                output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        };

        floatTo16BitPCM(view, 44, samples);

        return buffer;
    }
}
