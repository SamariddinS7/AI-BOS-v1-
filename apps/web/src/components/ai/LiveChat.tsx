import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Bot, X, Sparkles } from 'lucide-react';
import { getAi } from '../../lib/gemini';
import { LiveServerMessage, Modality, Type } from '@google/genai';
import { useLanguage } from '../../contexts/LanguageContext';

const BUSINESS_TOOLS = [
  {
    name: "getRevenueAnalytics",
    description: "Get revenue analytics data.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        time_range: { type: Type.STRING, description: "Time range (e.g., '7d', '30d')" }
      }
    }
  },
  {
    name: "getMarketingPerformance",
    description: "Get marketing performance metrics.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "getCrmCustomers",
    description: "Get list of CRM customers.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "startWorkflow",
    description: "Start an automation workflow.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        workflow_id: { type: Type.STRING, description: "ID of the workflow to start" }
      }
    }
  }
];

const SUGGESTED_COMMANDS = [
  "Show revenue analysis",
  "Generate financial report",
  "Analyze marketing ROI"
];

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChat({ isOpen, onClose }: LiveChatProps) {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const sessionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      connectLive();
    } else {
      disconnectLive();
    }
    return () => disconnectLive();
  }, [isOpen]);

  const connectLive = async () => {
    try {
      const sessionPromise = getAi().live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setupVisualizer();
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Message received:", message);
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              playAudio(base64Audio);
            }
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              setAiResponse(message.serverContent.modelTurn.parts[0].text);
            }
            if (message.serverContent?.inputTranscription?.text) {
              setTranscript(message.serverContent.inputTranscription.text);
            }
            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                console.log("Tool call received:", call);
                
                // Simple Role-based Security Check
                const userRole = 'executive'; // This should come from auth context
                if (call.name.includes('Financial') && userRole !== 'executive') {
                   sessionRef.current.sendToolResponse({
                    functionResponses: [{
                      name: call.name,
                      id: call.id,
                      response: { result: "Error: Unauthorized access to financial data." }
                    }]
                  });
                  continue;
                }

                // Execute command
                let result = "Command executed";
                try {
                  if (call.name === 'getRevenueAnalytics') {
                    const res = await fetch('/api/analytics/revenue/summary');
                    result = await res.json();
                  } else if (call.name === 'getMarketingPerformance') {
                    const res = await fetch('/api/analytics/marketing/summary');
                    result = await res.json();
                  } else if (call.name === 'getCrmCustomers') {
                    const res = await fetch('/api/crm/customers');
                    result = await res.json();
                  } else if (call.name === 'startWorkflow') {
                    const res = await fetch(`/api/workflows/${call.args.workflow_id}/execute`, {
                      method: 'POST',
                      body: JSON.stringify({}),
                      headers: { 'Content-Type': 'application/json' }
                    });
                    result = await res.json();
                  }
                } catch (e) {
                  result = "Error executing command";
                }

                sessionRef.current.sendToolResponse({
                  functionResponses: [{
                    name: call.name,
                    id: call.id,
                    response: { result: JSON.stringify(result) }
                  }]
                });
              }
            }
          },
          onerror: (error) => console.error("Live error:", error),
          onclose: () => setIsConnected(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful business advisor for AI-BOS. You can execute business commands. If the user asks for data, use the provided tools.",
          tools: [{ functionDeclarations: BUSINESS_TOOLS }],
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to connect to Live API:", error);
    }
  };

  const setupVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      drawWaveform();
    } catch (e) {
      console.error("Error setting up live visualizer:", e);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      animationFrameIdRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);
      ctx.fillStyle = 'rgb(10, 15, 25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(50, 150, 255)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const disconnectLive = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      setIsConnected(false);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    analyserRef.current = null;
  };

  const playAudio = (base64Audio: string) => {
    const binaryData = atob(base64Audio);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/pcm' });
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    
    const cleanUpUrl = () => {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (e) {
        // Safe ignore
      }
    };
    
    audio.onended = cleanUpUrl;
    audio.onerror = cleanUpUrl;
    
    audio.play().catch((err) => {
      console.warn("Audio play interrupted or failed:", err);
      cleanUpUrl();
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 glass-panel shadow-2xl z-50 rounded-2xl p-6 bg-surface-card border border-border-dark">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2 text-text-primary">
          <Bot className="w-5 h-5 text-brand-500" /> AI Business Advisor
        </h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
      </div>

      <canvas ref={canvasRef} width="320" height="60" className="w-full bg-surface-ground rounded-lg mb-4" />

      <div className="bg-surface-ground p-3 rounded-lg text-base text-text-secondary mb-4 h-20 overflow-y-auto">
        <p className="font-bold text-brand-500 mb-1">Transcript:</p>
        {transcript || "Listening..."}
        <p className="font-bold text-green-500 mt-2 mb-1">AI Response:</p>
        {aiResponse || "Waiting for input..."}
      </div>

      <div className="flex justify-center items-center mb-4">
        <button
          onClick={toggleRecording}
          className={`p-6 rounded-full ${isRecording ? 'bg-red-500' : 'bg-brand-600'} text-white shadow-lg transition-all hover:scale-105`}
        >
          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-base font-bold text-text-muted uppercase">Suggested Commands</p>
        {SUGGESTED_COMMANDS.map(cmd => (
          <button key={cmd} className="w-full text-left text-base p-2 bg-surface-ground hover:bg-surface-dark rounded text-text-secondary transition-colors">
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
