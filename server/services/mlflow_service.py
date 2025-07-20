import os
from typing import List, Dict, Any
import mlflow
from databricks.sdk import WorkspaceClient
from datetime import datetime


class MLflowService:
    def __init__(self):
        self.experiment_id = "2178582188830602"
        mlflow.set_tracking_uri("databricks")
        self.client = mlflow.tracking.MlflowClient()
        
    def get_recent_traces(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch the most recent traces from the MLflow experiment using search_traces."""
        # Cap the limit at 100 for performance
        limit = min(limit, 100)
        
        try:
            # Use search_traces API for experiments with inference tables
            traces_df = mlflow.search_traces(
                experiment_ids=[self.experiment_id],
                max_results=limit,
                order_by=["timestamp_ms DESC"]  # Use timestamp_ms for ordering
            )
            
            # Convert dataframe to list of dicts
            traces = []
            if not traces_df.empty:
                for _, row in traces_df.iterrows():
                    trace_data = {
                        "trace_id": row.get("trace_id", ""),
                        "timestamp": datetime.fromtimestamp(row.get("request_time", 0) / 1000).isoformat(),
                        "timestamp_ms": row.get("request_time", 0),
                        "status": str(row.get("state", "UNKNOWN")).replace("TraceState.", ""),
                        "duration_ms": row.get("execution_duration", 0),
                        "request": row.get("request", {}),
                        "response": row.get("response", {}),
                        "spans": []
                    }
                    
                    # Extract spans information
                    if "spans" in row and row["spans"]:
                        spans_data = row["spans"]
                        if isinstance(spans_data, list):
                            for span in spans_data:
                                if isinstance(span, dict):
                                    trace_data["spans"].append({
                                        "name": span.get("name", ""),
                                        "span_type": span.get("span_type", ""),
                                        "status": span.get("status", {}).get("status_code", "") if isinstance(span.get("status"), dict) else "",
                                        "parent_id": span.get("parent_id"),
                                        "start_time_ns": span.get("start_time_ns", 0),
                                        "end_time_ns": span.get("end_time_ns", 0),
                                        "inputs": span.get("inputs", {}),
                                        "outputs": span.get("outputs", {}),
                                        "attributes": span.get("attributes", {})
                                    })
                    
                    # Extract metadata from trace_metadata
                    if "trace_metadata" in row and isinstance(row["trace_metadata"], dict):
                        trace_data["metadata"] = row["trace_metadata"]
                        # Try to get trace name from metadata
                        if "mlflow.traceName" in row["trace_metadata"]:
                            trace_data["trace_name"] = row["trace_metadata"]["mlflow.traceName"]
                        else:
                            trace_data["trace_name"] = "Databricks Agent Trace"
                    
                    # Add tags if available
                    if "tags" in row and isinstance(row["tags"], dict):
                        trace_data["tags"] = row["tags"]
                    
                    traces.append(trace_data)
            
            return traces
            
        except Exception as e:
            print(f"Error fetching traces: {str(e)}")
            # Fallback to empty list if search_traces fails
            return []