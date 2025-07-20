import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TracesService } from '@/fastapi_client';
import type { TraceSummaryResponse } from '@/fastapi_client';

const TraceSummaryPage: React.FC = () => {
  const [traceCount, setTraceCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<TraceSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set());

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await TracesService.summarizeTracesApiTracesSummarizePost({
        count: traceCount
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch traces');
    } finally {
      setLoading(false);
    }
  };

  const toggleTraceExpansion = (traceId: string) => {
    const newExpanded = new Set(expandedTraces);
    if (newExpanded.has(traceId)) {
      newExpanded.delete(traceId);
    } else {
      newExpanded.add(traceId);
    }
    setExpandedTraces(newExpanded);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Grid background pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Trace Summary Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Analyze MLflow experiment traces with AI-powered insights
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-white/80 text-sm mb-2 block">Number of traces to analyze</label>
              <Input
                type="number"
                value={traceCount}
                onChange={(e) => setTraceCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                placeholder="Enter number of traces"
                min={1}
                max={100}
              />
            </div>
            <Button
              onClick={handleSummarize}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-500/10 backdrop-blur-md border-red-500/20 p-4 mb-8">
            <div className="flex items-center text-red-300">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </Card>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-8">
            {/* Summary Skeleton */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
              <Skeleton className="h-8 w-48 mb-4 bg-white/20" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-white/20" />
                <Skeleton className="h-4 w-3/4 bg-white/20" />
                <Skeleton className="h-4 w-5/6 bg-white/20" />
              </div>
            </Card>

            {/* Traces Skeleton */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
              <Skeleton className="h-6 w-32 mb-4 bg-white/20" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full bg-white/20" />
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-8">
            {/* Summary Section */}
            <Card className="bg-slate-800/50 backdrop-blur-md border-white/20 p-8">
              <div className="flex items-center mb-6">
                <Activity className="w-6 h-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-semibold text-white">AI Summary</h2>
              </div>

              {/* Main Summary Text - Display prominently at the top */}
              {data.summary.summary_text && (
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/20">
                  <pre className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {data.summary.summary_text}
                  </pre>
                </div>
              )}

              {/* Success Rate */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80">Success Rate</span>
                  <span className="text-2xl font-bold text-green-400">{data.summary.success_rate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${data.summary.success_rate}%` }}
                  />
                </div>
              </div>

              {/* Themes */}
              {data.summary.themes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Common Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.summary.themes.map((theme, idx) => (
                      <Badge key={idx} className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {data.summary.errors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Error Patterns</h3>
                  <div className="space-y-2">
                    {data.summary.errors.map((error, idx) => (
                      <div key={idx} className="flex items-center text-red-300">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools Used */}
              {data.summary.tools_used.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Most Used Tools</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.summary.tools_used.slice(0, 6).map((tool, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="text-white/80 text-sm truncate">{tool.tool}</span>
                        <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                          {tool.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </Card>

            {/* Traces Section */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Traces ({data.trace_count})
              </h2>

              <div className="space-y-3">
                {data.traces.map((trace, idx) => (
                  <div
                    key={trace.trace_id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleTraceExpansion(trace.trace_id)}
                    >
                      <div className="flex items-center gap-4">
                        {trace.status === 'OK' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <div className="text-white font-mono text-sm">{trace.trace_id}</div>
                          <div className="text-white/60 text-xs">
                            {new Date(trace.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                          {formatDuration(trace.duration_ms)}
                        </Badge>
                        {expandedTraces.has(trace.trace_id) ? (
                          <ChevronUp className="w-4 h-4 text-white/60" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/60" />
                        )}
                      </div>
                    </div>

                    {expandedTraces.has(trace.trace_id) && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {trace.spans && trace.spans.length > 0 && (
                          <div className="text-white/80 text-sm">
                            <p className="mb-2">Spans: {trace.spans.length}</p>
                            <div className="flex flex-wrap gap-1">
                              {[...new Set(trace.spans.map(s => s.name))].slice(0, 10).map((name, i) => (
                                <Badge key={i} className="bg-white/10 text-white/60 border-white/20 text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraceSummaryPage;