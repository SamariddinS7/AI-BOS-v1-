import os
from google import genai
from google.genai import types
from typing import Optional, List, Dict, Any
import base64

# Initialize the client
# Ensure GEMINI_API_KEY is set in your environment variables
try:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
except Exception as e:
    print(f"Warning: Failed to initialize Gemini Client. AI features will not work. {e}")
    client = None

class AIService:
    
    @staticmethod
    def generate_chat_response(message: str, history: List[Dict[str, str]] = None) -> str:
        """
        AI powered chatbot using gemini-3.1-pro-preview.
        """
        if not client:
            return "AI Service Unavailable"

        model = "gemini-3.1-pro-preview"
        
        # Convert history to format expected by SDK if necessary, 
        # or just append to contents if stateless. 
        # For simplicity in this wrapper, we'll treat it as a single turn or managed externally.
        # In a real chat, you'd maintain a ChatSession.
        
        try:
            response = client.models.generate_content(
                model=model,
                contents=message
            )
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"

    @staticmethod
    def generate_fast_response(prompt: str) -> str:
        """
        Fast AI responses using gemini-3.1-flash-lite-preview.
        """
        if not client:
            return "AI Service Unavailable"

        model = "gemini-3.1-flash-lite-preview"
        
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"Error generating fast response: {str(e)}"

    @staticmethod
    def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/mp3") -> str:
        """
        Transcribe audio using gemini-3.1-pro-preview.
        """
        if not client:
            return "AI Service Unavailable"

        model = "gemini-3.1-pro-preview"
        
        try:
            response = client.models.generate_content(
                model=model,
                contents=[
                    types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                    "Transcribe this audio file."
                ]
            )
            return response.text
        except Exception as e:
            return f"Error transcribing audio: {str(e)}"

    @staticmethod
    def generate_thinking_response(prompt: str) -> str:
        """
        Complex queries using Thinking Mode (gemini-3.1-pro-preview).
        """
        if not client:
            return "AI Service Unavailable"

        model = "gemini-3.1-pro-preview"
        
        try:
            # Configure thinking mode
            config = types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(include_thoughts=True),
                thinking_level="HIGH" # Maps to ThinkingLevel.HIGH logic
            )
            
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config
            )
            # The response might contain thoughts and text. 
            # Depending on SDK version, thoughts might be in a separate field or part of candidates.
            # We return the text.
            return response.text
        except Exception as e:
            return f"Error generating thinking response: {str(e)}"

    @staticmethod
    def generate_structured_response(prompt: str, schema: Dict[str, Any] = None) -> str:
        """
        Generates a response, optionally enforcing a JSON schema.
        Used by Marketing Agents.
        """
        if not client:
            return "{}"

        model = "gemini-3.1-pro-preview" # Default to strong model for structured tasks
        
        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json"
            )
            
            if schema:
                # In a real implementation, convert dict schema to types.Schema
                # For now, we rely on the prompt + mime_type
                pass

            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            return f"{{\"error\": \"{str(e)}\"}}"
