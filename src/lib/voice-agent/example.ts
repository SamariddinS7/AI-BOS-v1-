import { VoicePipeline } from './VoicePipeline.ts';
import { VoiceCommand } from './types.ts';

// Mock User Context
const mockUser = {
  id: 'user_123',
  name: 'Admin User',
  permissions: ['read:finance', 'write:marketing', 'execute:workflow']
};

// Initialize Voice Pipeline
const pipeline = new VoicePipeline(mockUser.id);

// Simulate Voice Input (Mock Audio Blob)
const mockAudioBlob = new Blob(['mock_audio_data'], { type: 'audio/wav' });

console.log('--- Starting Voice Interaction ---');

pipeline.processAudio(mockAudioBlob)
  .then(({ result, audioResponse }) => {
    console.log('--- Interaction Complete ---');
    console.log('Result:', result);
    console.log('Audio Response Size:', audioResponse.size, 'bytes');
  })
  .catch(err => {
    console.error('--- Interaction Failed ---', err);
  });
