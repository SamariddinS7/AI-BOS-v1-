from fastapi import FastAPI, Depends, HTTPException, Query, Body, Response, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncio

from backend.database.session import get_db, init_db
from backend.modules.finance.pnl import PnLService
from backend.modules.finance.cashflow import CashflowService
from backend.modules.hr.kpi import KPIService
from backend.modules.crm.revenue import RevenueService
from backend.modules.analytics.forecasting import DemandForecastService
from backend.modules.analytics.optimization import OptimizationService

from backend.intelligence.aggregator import DataAggregator
from backend.intelligence.executive_summary import ExecutiveInsightsEngine
from backend.workflows.cost_optimization import CostOptimizationWorkflow
from backend.workflows.revenue_growth import RevenueGrowthWorkflow
from backend.workflows.workforce_analysis import WorkforceAnalysisWorkflow
from backend.workflows.risk_assessment import RiskAssessmentWorkflow

from backend.admin.ai_control import AIControlService, AIMode
from backend.admin.model_registry import ModelRegistryService, ModelType
from backend.admin.policy_config import PolicyConfigService
from backend.admin.audit_viewer import AuditViewerService
from backend.admin.system_health import SystemHealthMonitor
from backend.admin.approval_workflow import ApprovalWorkflowService

from backend.observability.metrics import MetricsService
from backend.observability.logging import StructuredLogger
from backend.observability.model_benchmark import BenchmarkService
from backend.observability.optimization_engine import OptimizationEngine
from backend.middleware.metrics_middleware import MetricsMiddleware

from backend.lifecycle.model_registry import ModelRegistryService as LifecycleRegistry
from backend.lifecycle.version_manager import VersionManager
from backend.lifecycle.rollback import RollbackService
from backend.lifecycle.ab_testing import ABTestingService
from backend.lifecycle.health_monitor import ModelHealthMonitor
from backend.database.model_versions import ModelType as LifecycleModelType

from backend.resilience.health_registry import HealthRegistry
from backend.resilience.degraded_mode import DegradedMode
from backend.resilience.failover_manager import FailoverManager
from backend.resilience.self_healing import SelfHealingService
from backend.resilience.circuit_breaker import CircuitBreaker

from backend.modules.marketing.router import router as marketing_router
from backend.intelligence.router import router as intelligence_router

app = FastAPI(title="AI-BOS Backend", version="1.0.0")

# Add Middleware
app.add_middleware(MetricsMiddleware)

# Initialize Self-Healing Service
self_healing_service = SelfHealingService()

# Initialize DB on startup
@app.on_event("startup")
async def on_startup():
    init_db()
    # Start Self-Healing Background Task
    asyncio.create_task(self_healing_service.run_background_task())

# Include Routers
app.include_router(marketing_router)
app.include_router(intelligence_router)

# --- Observability Endpoints ---

@app.get("/metrics", tags=["Observability"])
def get_metrics():
    data, content_type = MetricsService.get_metrics()
    return Response(content=data, media_type=content_type)

@app.get("/health", tags=["Observability"])
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/readiness", tags=["Observability"])
def readiness_check(db: Session = Depends(get_db)):
    try:
        # Check DB connection
        db.execute("SELECT 1")
        return {"status": "ready", "db": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@app.get("/liveness", tags=["Observability"])
def liveness_check():
    return {"status": "alive"}

@app.get("/admin/performance-report", tags=["Observability"])
def get_performance_report(db: Session = Depends(get_db)):
    benchmark_service = BenchmarkService(db)
    engine = OptimizationEngine(benchmark_service)
    return engine.analyze_performance()

# --- Finance Endpoints ---

@app.get("/finance/pnl", tags=["Finance"])
def get_pnl(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    service = PnLService(db)
    return service.generate_pnl(start_date, end_date)

@app.get("/finance/cashflow", tags=["Finance"])
def get_cashflow(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    service = CashflowService(db)
    return service.generate_cashflow(start_date, end_date)

# --- HR Endpoints ---

@app.get("/hr/kpi/{employee_id}", tags=["HR"])
def get_employee_kpi(employee_id: int, period: str, db: Session = Depends(get_db)):
    service = KPIService(db)
    score = service.calculate_kpi_score(employee_id, period)
    return {"employee_id": employee_id, "period": period, "kpi_score": score}

# --- CRM Endpoints ---

@app.get("/crm/revenue", tags=["CRM"])
def get_revenue(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    service = RevenueService(db)
    revenue = service.calculate_revenue(start_date, end_date)
    return {"period_start": start_date, "period_end": end_date, "revenue": revenue}

# --- Analytics Endpoints ---

@app.get("/analytics/forecast", tags=["Analytics"])
def get_forecast(product_id: int, months: int, db: Session = Depends(get_db)):
    service = DemandForecastService(db)
    return service.demand_forecast(product_id, months)

@app.get("/analytics/optimization/pricing/{product_id}", tags=["Analytics"])
def get_pricing_optimization(product_id: int, db: Session = Depends(get_db)):
    service = OptimizationService(db)
    return service.optimize_pricing(product_id)

@app.get("/analytics/optimization/loss_products", tags=["Analytics"])
def get_loss_products(db: Session = Depends(get_db)):
    service = OptimizationService(db)
    return service.detect_loss_products()

# --- Intelligence Layer Endpoints ---

@app.get("/intelligence/summary", tags=["Intelligence"])
def get_executive_summary(
    start_date: datetime = Query(default=datetime.utcnow() - timedelta(days=30)),
    end_date: datetime = Query(default=datetime.utcnow()),
    db: Session = Depends(get_db)
):
    aggregator = DataAggregator(db)
    context = aggregator.build_business_context(start_date, end_date)
    engine = ExecutiveInsightsEngine(context)
    return engine.generate_executive_summary()

@app.get("/intelligence/risk", tags=["Intelligence"])
def get_risk_analysis(
    start_date: datetime = Query(default=datetime.utcnow() - timedelta(days=30)),
    end_date: datetime = Query(default=datetime.utcnow()),
    db: Session = Depends(get_db)
):
    aggregator = DataAggregator(db)
    context = aggregator.build_business_context(start_date, end_date)
    engine = ExecutiveInsightsEngine(context)
    return {
        "risk_score": engine.generate_risk_score(),
        "risk_indicators": context.risk,
        "risks": engine.analyzer.detect_cashflow_risk()
    }

@app.get("/intelligence/growth", tags=["Intelligence"])
def get_growth_analysis(
    start_date: datetime = Query(default=datetime.utcnow() - timedelta(days=30)),
    end_date: datetime = Query(default=datetime.utcnow()),
    db: Session = Depends(get_db)
):
    aggregator = DataAggregator(db)
    context = aggregator.build_business_context(start_date, end_date)
    engine = ExecutiveInsightsEngine(context)
    return {
        "growth_score": engine.generate_growth_score(),
        "sales_summary": context.sales,
        "opportunities": engine.analyzer.identify_growth_opportunities()
    }

@app.get("/intelligence/workflow/{workflow_type}", tags=["Intelligence"])
def run_business_workflow(
    workflow_type: str,
    start_date: datetime = Query(default=datetime.utcnow() - timedelta(days=30)),
    end_date: datetime = Query(default=datetime.utcnow()),
    db: Session = Depends(get_db)
):
    aggregator = DataAggregator(db)
    context = aggregator.build_business_context(start_date, end_date)
    
    if workflow_type == "cost_optimization":
        workflow = CostOptimizationWorkflow(context)
    elif workflow_type == "revenue_growth":
        workflow = RevenueGrowthWorkflow(context)
    elif workflow_type == "workforce_analysis":
        workflow = WorkforceAnalysisWorkflow(context)
    elif workflow_type == "risk_assessment":
        workflow = RiskAssessmentWorkflow(context)
    else:
        raise HTTPException(status_code=400, detail="Invalid workflow type")
        
    return workflow.execute()

# --- Admin Panel Endpoints ---

@app.get("/admin/mode", tags=["Admin"])
def get_ai_mode(db: Session = Depends(get_db)):
    service = AIControlService(db)
    return {"current_mode": service.get_current_mode()}

@app.post("/admin/mode", tags=["Admin"])
def set_ai_mode(mode: AIMode, user_id: str = "admin", db: Session = Depends(get_db)):
    service = AIControlService(db)
    return service.set_mode(mode, user_id)

@app.post("/admin/models", tags=["Admin"])
def register_model(
    name: str, 
    type: ModelType, 
    version: str, 
    priority: int = 0, 
    db: Session = Depends(get_db)
):
    service = ModelRegistryService(db)
    return service.register_model(name, type, version, priority)

@app.get("/admin/models", tags=["Admin"])
def get_active_models(db: Session = Depends(get_db)):
    control_service = AIControlService(db)
    registry_service = ModelRegistryService(db)
    mode = control_service.get_current_mode()
    return registry_service.get_active_models(mode)

@app.get("/admin/policies", tags=["Admin"])
def get_policies(module: Optional[str] = None, db: Session = Depends(get_db)):
    service = PolicyConfigService(db)
    return service.get_policies(module)

@app.post("/admin/policies", tags=["Admin"])
def create_policy(
    module: str, 
    rule: str, 
    value: str, 
    requires_approval: bool = False, 
    db: Session = Depends(get_db)
):
    service = PolicyConfigService(db)
    return service.create_policy(module, rule, value, requires_approval)

@app.get("/admin/audit", tags=["Admin"])
def get_audit_logs(
    user_id: Optional[str] = None, 
    module: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    service = AuditViewerService(db)
    return service.get_audit_logs(user_id=user_id, module=module)

@app.get("/admin/system-health", tags=["Admin"])
def get_system_health():
    monitor = SystemHealthMonitor()
    return {
        "system": monitor.get_system_metrics(),
        "ai_performance": monitor.get_model_performance()
    }

@app.get("/admin/pending-actions", tags=["Admin"])
def get_pending_actions(module: Optional[str] = None, db: Session = Depends(get_db)):
    service = ApprovalWorkflowService(db)
    return service.get_pending_actions(module)

@app.post("/admin/pending-actions/{action_id}/approve", tags=["Admin"])
def approve_action(action_id: int, user_id: str = "admin", db: Session = Depends(get_db)):
    service = ApprovalWorkflowService(db)
    success = service.approve_action(action_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Action not found or already processed")
    return {"status": "approved"}

# --- Lifecycle Management Endpoints ---

@app.post("/admin/models/register", tags=["Lifecycle"])
def register_model_version(
    name: str,
    version: str,
    type: LifecycleModelType,
    path: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    service = LifecycleRegistry(db)
    return service.register_model_version(name, version, type, path, description)

@app.post("/admin/models/activate", tags=["Lifecycle"])
def activate_model_version(
    name: str,
    version: str,
    db: Session = Depends(get_db)
):
    manager = VersionManager(db)
    success = manager.activate_model_version(name, version)
    if not success:
        raise HTTPException(status_code=400, detail="Activation failed. Check logs or compatibility.")
    return {"status": "activated", "model": name, "version": version}

@app.post("/admin/models/rollback", tags=["Lifecycle"])
def rollback_model_version(
    name: str,
    db: Session = Depends(get_db)
):
    service = RollbackService(db)
    success = service.rollback_to_previous_version(name)
    if not success:
        raise HTTPException(status_code=400, detail="Rollback failed. No previous version found.")
    return {"status": "rolled_back", "model": name}

@app.get("/admin/models/compare", tags=["Lifecycle"])
def compare_models(
    model_a: str,
    model_b: str,
    db: Session = Depends(get_db)
):
    service = ABTestingService(db)
    return service.compare_models(model_a, model_b)

@app.get("/admin/models/history", tags=["Lifecycle"])
def get_model_history(
    model_name: str,
    db: Session = Depends(get_db)
):
    service = LifecycleRegistry(db)
    return service.list_versions(model_name)

# --- Resilience & Self-Healing Endpoints ---

@app.get("/admin/system-status", tags=["Resilience"])
async def get_system_status():
    registry = HealthRegistry()
    return await registry.get_system_status()

@app.post("/admin/reset-circuit", tags=["Resilience"])
def reset_circuit_breaker(circuit_name: str):
    # In a real distributed system, this would need to broadcast the reset.
    # Here we simulate finding it in the local service list.
    for breaker in self_healing_service.circuit_breakers:
        if breaker.name == circuit_name:
            breaker.reset()
            return {"status": "reset", "circuit": circuit_name}
    raise HTTPException(status_code=404, detail="Circuit breaker not found")

@app.post("/admin/degraded-mode", tags=["Resilience"])
async def toggle_degraded_mode(active: bool, reason: str = "Manual Admin Override"):
    if active:
        await DegradedMode.activate(reason)
    else:
        await DegradedMode.deactivate()
    return {"status": "updated", "degraded_mode": active}
