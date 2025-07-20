from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List

from ..services.mlflow_service import MLflowService
from ..services.model_serving_service import ModelServingService


router = APIRouter(tags=["traces"])


class TraceSummaryRequest(BaseModel):
    count: int = Field(default=20, ge=1, le=100, description="Number of traces to fetch and summarize")


class ToolUsage(BaseModel):
    tool: str
    count: int


class TraceSummary(BaseModel):
    summary_text: str
    themes: List[str]
    errors: List[str]
    tools_used: List[ToolUsage]
    success_rate: float


class TraceSummaryResponse(BaseModel):
    summary: TraceSummary
    traces: List[Dict[str, Any]]
    trace_count: int


@router.post("/summarize", response_model=TraceSummaryResponse)
async def summarize_traces(request: TraceSummaryRequest):
    """
    Fetch recent traces from MLflow and generate an AI-powered summary.
    """
    try:
        # Initialize services
        mlflow_service = MLflowService()
        model_service = ModelServingService()
        
        # Fetch traces from MLflow
        traces = mlflow_service.get_recent_traces(limit=request.count)
        
        if not traces:
            raise HTTPException(status_code=404, detail="No traces found in the experiment")
        
        # Generate summary using Claude
        summary_data = model_service.summarize_traces(traces)
        
        # Format response
        summary = TraceSummary(
            summary_text=summary_data["summary_text"],
            themes=summary_data["themes"],
            errors=summary_data["errors"],
            tools_used=[ToolUsage(**tool) for tool in summary_data["tools_used"]],
            success_rate=summary_data["success_rate"]
        )
        
        return TraceSummaryResponse(
            summary=summary,
            traces=traces,
            trace_count=len(traces)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing traces: {str(e)}")