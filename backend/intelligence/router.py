from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from backend.intelligence.ai_service import AIService
from backend.intelligence.execution_engine import ExecutionEngine

router = APIRouter(prefix="/intelligence", tags=["General Intelligence"])

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str

class FastRequest(BaseModel):
    prompt: str

class FastResponse(BaseModel):
    response: str

class ThinkingRequest(BaseModel):
    prompt: str

class ThinkingResponse(BaseModel):
    response: str

class ExecutionRequest(BaseModel):
    command: str
    context: Optional[Dict[str, Any]] = None
    user_role: Optional[str] = "admin"

@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    """
    General purpose AI chatbot using gemini-3.1-pro-preview.
    """
    response = AIService.generate_chat_response(request.message, request.history)
    return ChatResponse(response=response)

@router.post("/fast", response_model=FastResponse)
def fast_ai_response(request: FastRequest):
    """
    Low-latency AI response using gemini-3.1-flash-lite-preview.
    """
    response = AIService.generate_fast_response(request.prompt)
    return FastResponse(response=response)

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe uploaded audio file using gemini-3.1-pro-preview.
    """
    try:
        contents = await file.read()
        response = AIService.transcribe_audio(contents, file.content_type or "audio/mp3")
        return {"transcription": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@router.post("/think", response_model=ThinkingResponse)
def thinking_ai_response(request: ThinkingRequest):
    """
    Complex reasoning using Thinking Mode (gemini-3.1-pro-preview).
    """
    response = AIService.generate_thinking_response(request.prompt)
    return ThinkingResponse(response=response)

@router.post("/execute")
def execute_business_action(request: ExecutionRequest):
    """
    Execute a business action via the AI Execution Pipeline.
    """
    engine = ExecutionEngine()
    context = request.context or {}
    result = engine.run_pipeline(request.command, context, request.user_role)
    return result
