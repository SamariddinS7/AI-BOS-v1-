import { VoiceCommand, ExecutionResult, VoiceSession } from './types.ts';
import { IntentClassifier } from './IntentClassifier.ts';
import { ActionExecutor } from './ActionExecutor.ts';
import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav } from '../audioUtils';

// Mock STT/TTS Services (Replace with real API calls)
const MockSTTService = {
  transcribe: async (audioBlob: Blob): Promise<string> => {
    // Simulate minimal processing time (e.g., 50ms)
    await new Promise(resolve => setTimeout(resolve, 50));
    return "Marketing byudjetini 10% ga oshir"; // Mock result
  }
};

// Helper to generate a valid WAV Blob (Sine wave beep)
const generateBeepWav = (durationMs: number = 500, frequency: number = 440): Blob => {
  const sampleRate = 44100;
  const numSamples = (durationMs / 1000) * sampleRate;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Write samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t);
    view.setInt16(44 + i * 2, sample * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const MockTTSService = {
  synthesize: async (text: string, lang: string): Promise<Blob> => {
    // Simulate minimal synthesis time (e.g., 50ms)
    await new Promise(resolve => setTimeout(resolve, 50));
    // Return a valid WAV blob (beep) so the browser can play it
    return generateBeepWav(300, 550); // Shorter beep for faster feedback
  }
};

export class VoicePipeline {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async processAudio(audioBlob: Blob): Promise<{ result: ExecutionResult, audioResponse: Blob, transcript: string }> {
    try {
      // 1. Convert Blob to Base64 for transcription
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(audioBlob);
      });

      // 2. Transcribe audio using Gemini
      const transcriptionResponse = await this.ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "audio/webm",
                  data: base64Audio,
                },
              },
              { text: "Transcribe this audio." },
            ],
          },
        ],
      });
      const transcript = transcriptionResponse.text || "";

      // 3. Get AI response text
      const responseTextResponse = await this.ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: transcript }] }],
      });
      const responseText = responseTextResponse.text || "";

      // 4. Generate speech
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: responseText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      console.log('[VoicePipeline] Response:', JSON.stringify(response, null, 2));

      const audioPart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      const audioBase64 = audioPart?.inlineData?.data;
      
      let audioResponse = new Blob();
      if (audioBase64) {
        // Convert base64 PCM to WAV Blob
        audioResponse = pcmToWav(audioBase64, 24000);
      } else {
        console.warn('[VoicePipeline] No audio data found in response');
      }

      return {
        result: { success: true, message: "Javob tayyor." },
        audioResponse,
        transcript
      };
    } catch (error: any) {
      console.error('[VoicePipeline] Error:', error);
      return { 
        result: { success: false, message: "Kechirasiz, tizimda xatolik yuz berdi." }, 
        audioResponse: new Blob(),
        transcript: ""
      };
    }
  }
}
