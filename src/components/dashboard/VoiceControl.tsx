import React, { useState, useRef, memo } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { pcmToWav } from '../../lib/audioUtils';

interface VoiceControlProps {
  onAction?: (action: string, data: any) => void;
}

const VoiceControl = memo(({ onAction }: VoiceControlProps) => {
  const { t, language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
      setResponseMessage('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(t('mic_access_denied'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const response = await fetch('/voice/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            audioBase64: base64Audio,
            lang: language // Use current language
          })
        });

        if (!response.ok) throw new Error('Voice processing failed');

        const data = await response.json();
        setTranscript(data.transcript);
        setResponseMessage(data.result.message);

        // Play TTS audio
        if (data.audioBase64) {
          try {
            const wavBlob = pcmToWav(data.audioBase64, 24000);
            const audioUrl = URL.createObjectURL(wavBlob);
            const audio = new Audio(audioUrl);
            await audio.play();
          } catch (e) {
            console.error("Audio playback failed:", e);
          }
        }

        // Execute action if any
        if (data.result.action && onAction) {
          onAction(data.result.action, data.result.data);
        }
      };
    } catch (error) {
      console.error('Error processing voice:', error);
      setResponseMessage(t('voice_processing_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-3 rounded-full transition-all shadow-lg flex items-center justify-center ${
          isRecording 
            ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/20' 
            : isProcessing 
              ? 'bg-brand-500/10 text-brand-500 cursor-wait'
              : 'bg-surface-layer/30 hover:bg-surface-layer text-white border border-border-dark'
        }`}
      >
        {isProcessing ? (
          <Loader2 size={20} className="animate-spin" />
        ) : isRecording ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}
      </motion.button>

      <AnimatePresence>
        {(transcript || responseMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-14 right-0 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-surface-layer border border-border-dark rounded-xl shadow-xl p-4 z-50 backdrop-blur-md enterprise-card"
          >
            <div className="flex flex-col gap-2">
              {transcript && (
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-brand-500/10 rounded-lg text-brand-500 mt-0.5">
                    <Mic size={14} />
                  </div>
                  <p className="text-base text-text-muted italic font-bold">"{transcript}"</p>
                </div>
              )}
              
              {responseMessage && (
                <div className="flex items-start gap-2 border-t border-border-dark pt-2 mt-1">
                  <div className="p-1.5 bg-brand-500/10 rounded-lg text-brand-500 mt-0.5">
                    <Volume2 size={14} />
                  </div>
                  <p className="text-base text-white font-bold">{responseMessage}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

VoiceControl.displayName = 'VoiceControl';

export default VoiceControl;
