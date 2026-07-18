from typing import Dict, Any
import json
import uuid
from backend.intelligence.ai_service import AIService
from backend.intelligence.schemas import ActionIntent, ExecutionResult, PostExecutionReport
from backend.intelligence.prompts import EXECUTION_AGENT_PROMPT, RESULT_ANALYSIS_PROMPT

class ExecutionEngine:
    def __init__(self):
        pass

    def detect_intent(self, user_command: str, context: Dict[str, Any]) -> ActionIntent:
        prompt = EXECUTION_AGENT_PROMPT.format(
            user_command=user_command,
            context=json.dumps(context)
        )
        response_text = AIService.generate_structured_response(prompt)
        
        # Clean JSON
        cleaned = response_text.strip()
        if cleaned.startswith("```json"): cleaned = cleaned[7:]
        if cleaned.endswith("```"): cleaned = cleaned[:-3]
        
        try:
            data = json.loads(cleaned)
            return ActionIntent(**data)
        except Exception as e:
            print(f"Error parsing intent JSON: {e}")
            print(f"Raw response: {cleaned}")
            # Fallback intent
            return ActionIntent(
                action_type="unknown",
                module="unknown",
                risk_level="high",
                expected_impact="Unknown",
                requires_confirmation=True
            )

    def validate_permission(self, intent: ActionIntent, user_role: str) -> bool:
        if intent.requires_confirmation and user_role != "admin":
            return False
        return True

    def execute_action(self, intent: ActionIntent, user_command: str = "") -> ExecutionResult:
        # Mock Business Logic Engine
        action_id = f"ACT-{str(uuid.uuid4())[:8].upper()}"
        
        if intent.action_type.upper() in ["READ", "PROPOSE"]:
            # Generate a contextual response using AI
            prompt = f"As an AI-BOS Core agent, provide a realistic {intent.action_type} response for the module '{intent.module}'. The user asked: '{user_command}'. Provide a concise, professional business response."
            ai_response = AIService.generate_fast_response(prompt)
            
            return ExecutionResult(
                success=True,
                action_id=action_id,
                message="Data retrieved successfully." if intent.action_type.upper() == "READ" else "Proposal generated successfully.",
                data={"info": ai_response} if intent.action_type.upper() == "READ" else {"proposal": ai_response}
            )
        
        # Example: Marketing Budget Reallocation
        if intent.module == "marketing" and intent.action_type in ["budget_reallocation", "reallocate_budget", "EXECUTE"]:
            # Simulate DB update
            return ExecutionResult(
                success=True,
                action_id=action_id,
                message="Budget reallocated successfully.",
                data={"paused_campaigns": 3, "reallocated_amount": 5000},
                old_state={"roas": 2.0},
                new_state={"expected_roas": 3.8}
            )
            
        return ExecutionResult(
            success=False,
            action_id=action_id,
            message=f"Action type '{intent.action_type}' for module '{intent.module}' not supported yet."
        )

    def analyze_result(self, intent: ActionIntent, result: ExecutionResult) -> PostExecutionReport:
        prompt = RESULT_ANALYSIS_PROMPT.format(
            action_intent=intent.json(),
            execution_result=result.json()
        )
        response_text = AIService.generate_structured_response(prompt)
        
        cleaned = response_text.strip()
        if cleaned.startswith("```json"): cleaned = cleaned[7:]
        if cleaned.endswith("```"): cleaned = cleaned[:-3]
        
        try:
            data = json.loads(cleaned)
            return PostExecutionReport(**data)
        except Exception as e:
            print(f"Error parsing report JSON: {e}")
            return PostExecutionReport(
                action_performed="Unknown",
                objects_affected="Unknown",
                kpi_change="Unknown",
                financial_impact="Unknown",
                risk_impact="Unknown",
                stability_check="Unknown",
                confidence_level="Low"
            )
        
    def run_pipeline(self, user_command: str, context: Dict[str, Any], user_role: str = "admin"):
        # 1. Intent Detection
        intent = self.detect_intent(user_command, context)
        
        # 2. Permission Validation
        if not self.validate_permission(intent, user_role):
            return {
                "status": "blocked", 
                "reason": "Requires admin confirmation", 
                "intent": intent.dict()
            }
            
        # 3. Execute
        result = self.execute_action(intent, user_command)
        
        if not result.success:
            return {
                "status": "failed", 
                "reason": result.message, 
                "intent": intent.dict(),
                "result": result.dict()
            }
            
        # 4. Analyze
        report = self.analyze_result(intent, result)
        
        # 5. Log (Mocking DB log)
        print(f"LOG: Action {result.action_id} executed. Intent: {intent.action_type}")
        
        return {
            "status": "success",
            "intent": intent.dict(),
            "result": result.dict(),
            "report": report.dict()
        }
