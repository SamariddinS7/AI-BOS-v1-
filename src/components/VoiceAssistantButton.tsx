import React, { useState, useRef, useEffect } from 'react';
import { Mic, Loader2, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoicePipeline } from '../lib/voice-agent/VoicePipeline';

export default function VoiceAssistantButton() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pipelineRef = useRef(new VoicePipeline(process.env.GEMINI_API_KEY || ''));

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);
        
        // Process audio
        const { result, audioResponse, transcript: t } = await pipelineRef.current.processAudio(audioBlob);
        setTranscript(t);
        
        // Play audio response only if valid
        if (audioResponse && audioResponse.size > 0) {
          const audioUrl = URL.createObjectURL(audioResponse);
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.error("Error playing audio:", e));
        } else {
          console.warn("No valid audio response to play");
        }
        
        setIsProcessing(false);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access is required for voice commands.');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  };

  return (
    <>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-600 hover:bg-brand-500'} text-white shadow-lg`}
      >
        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-8 bg-surface-card p-6 rounded-2xl shadow-2xl border border-border-dark w-80 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-text-primary flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-brand-500" /> Voice Assistant
              </h4>
              <button onClick={stopListening} className="text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-20 bg-surface-dark rounded-lg p-3 text-base text-text-secondary overflow-y-auto">
              {isProcessing ? 'Processing...' : 'Listening...'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
