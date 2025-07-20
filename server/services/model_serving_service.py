import json
import os
import requests
from typing import Dict, Any, List
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.serving import DataframeSplitInput


class ModelServingService:
    def __init__(self):
        self.w = WorkspaceClient()
        self.endpoint_name = "databricks-llama-4-maverick"
        
    def summarize_traces(self, traces: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Send traces to Llama for summarization."""
        
        # Prepare trace information for the prompt
        trace_info = []
        for trace in traces:
            info = {
                "trace_id": trace.get("trace_id"),
                "timestamp": trace.get("timestamp"),
                "status": trace.get("status"),
                "duration_ms": trace.get("duration_ms"),
            }
            
            # Extract tool/function calls from spans if available
            if "spans" in trace:
                tools_used = []
                for span in trace["spans"]:
                    if span.get("name"):
                        tools_used.append(span["name"])
                info["tools_used"] = list(set(tools_used))  # Unique tools
            
            # Include any error information
            if trace.get("status") == "FAILED":
                info["error"] = True
                
            trace_info.append(info)
        
        # Create prompt for Claude
        prompt = f"""Analyze the following {len(traces)} MLflow traces and provide a summary with:
1. Common themes or patterns across the traces
2. Any error patterns or issues
3. Most frequently used tools/functions
4. Overall success rate

Traces:
{json.dumps(trace_info, indent=2)}

Please provide a concise, well-structured summary."""

        try:
            # Use requests directly since we know the REST API format works
            host = os.environ.get("DATABRICKS_HOST", "").rstrip("/")
            token = os.environ.get("DATABRICKS_TOKEN", "")
            
            if not host or not token:
                print("Missing DATABRICKS_HOST or DATABRICKS_TOKEN environment variables")
                return self._generate_fallback_summary(traces)
            
            url = f"{host}/serving-endpoints/{self.endpoint_name}/invocations"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            request_payload = {
                "messages": [
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "max_tokens": 500
            }
            
            print(f"Sending request to {url}")
            response = requests.post(url, json=request_payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Got successful response from model endpoint")
                
                # Extract the summary from OpenAI-style response
                if "choices" in result and len(result["choices"]) > 0:
                    summary_text = result["choices"][0]["message"]["content"]
                    
                    if summary_text:
                        # Parse the summary into structured format
                        summary = self._parse_summary(summary_text, traces)
                        return summary
                    else:
                        print("No content in response")
                        return self._generate_fallback_summary(traces)
                else:
                    print(f"Unexpected response structure: {json.dumps(result, indent=2)}")
                    return self._generate_fallback_summary(traces)
            else:
                print(f"Model endpoint returned status {response.status_code}: {response.text}")
                return self._generate_fallback_summary(traces)
                
        except Exception as e:
            print(f"Error calling model endpoint: {str(e)}")
            # Return a basic summary if the model call fails
            return self._generate_fallback_summary(traces)
    
    def _parse_summary(self, summary_text: str, traces: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse the AI-generated summary into structured format."""
        # For now, return the raw text with some basic stats
        success_count = sum(1 for t in traces if t.get("status") != "FAILED")
        
        # Extract tools used across all traces
        all_tools = []
        for trace in traces:
            if "spans" in trace:
                for span in trace["spans"]:
                    if span.get("name"):
                        all_tools.append(span["name"])
        
        # Count tool frequency
        tool_counts = {}
        for tool in all_tools:
            tool_counts[tool] = tool_counts.get(tool, 0) + 1
        
        # Sort tools by frequency
        sorted_tools = sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "summary_text": summary_text,
            "themes": self._extract_themes(summary_text),
            "errors": self._extract_errors(traces),
            "tools_used": [{"tool": tool, "count": count} for tool, count in sorted_tools],
            "success_rate": (success_count / len(traces) * 100) if traces else 0
        }
    
    def _extract_themes(self, summary_text: str) -> List[str]:
        """Extract themes from summary text."""
        # Simple extraction - in production, could use more sophisticated parsing
        themes = []
        if "pattern" in summary_text.lower():
            themes.append("Pattern detection in traces")
        if "error" in summary_text.lower():
            themes.append("Error analysis")
        if "performance" in summary_text.lower():
            themes.append("Performance insights")
        if not themes:
            themes = ["Trace execution analysis", "Tool usage patterns"]
        return themes
    
    def _extract_errors(self, traces: List[Dict[str, Any]]) -> List[str]:
        """Extract error patterns from traces."""
        errors = []
        failed_traces = [t for t in traces if t.get("status") == "FAILED"]
        
        if failed_traces:
            errors.append(f"{len(failed_traces)} failed traces detected")
            
        return errors
    
    def _generate_fallback_summary(self, traces: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a basic summary if AI call fails."""
        success_count = sum(1 for t in traces if t.get("status") != "FAILED")
        
        # Extract tools used
        all_tools = []
        for trace in traces:
            if "spans" in trace:
                for span in trace["spans"]:
                    if span.get("name"):
                        all_tools.append(span["name"])
        
        # Count tool frequency
        tool_counts = {}
        for tool in all_tools:
            tool_counts[tool] = tool_counts.get(tool, 0) + 1
        
        sorted_tools = sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        themes = ["Automated trace analysis"]
        if success_count < len(traces):
            themes.append("Error detection")
        
        errors = []
        if success_count < len(traces):
            errors.append(f"{len(traces) - success_count} failed traces")
        
        return {
            "summary_text": f"Analyzed {len(traces)} traces. Success rate: {success_count}/{len(traces)}",
            "themes": themes,
            "errors": errors,
            "tools_used": [{"tool": tool, "count": count} for tool, count in sorted_tools],
            "success_rate": (success_count / len(traces) * 100) if traces else 0
        }