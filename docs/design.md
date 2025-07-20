# Technical Design Document - Trace Summary Dashboard

## High-Level Design

### Technology Stack

**Backend:**
- FastAPI for REST API
- MLflow Python client for trace retrieval
- Databricks SDK for model serving endpoint integration
- Pydantic for data validation

**Frontend:**
- React with TypeScript
- Tailwind CSS for styling with custom gradients
- shadcn/ui components as base
- Framer Motion for smooth animations
- React Query for data fetching
- Lucide React for icons

### Libraries and Frameworks

**Python Dependencies:**
- `mlflow` - For accessing experiment traces
- `databricks-sdk` - Already included, for model serving
- Existing FastAPI setup

**Frontend Dependencies:**
- `framer-motion` - Smooth animations and transitions
- `@tanstack/react-query` - Data fetching with loading states
- Existing shadcn/ui components (Card, Button, Input, Skeleton)
- `lucide-react` - Beautiful icons

### Data Architecture

**MLflow Trace Data:**
```python
{
    "request_id": "trace_id",
    "timestamp_ms": 1234567890,
    "status": "OK/ERROR",
    "request_metadata": {...},
    "response": {...},
    "spans": [...]
}
```

**API Response Format:**
```typescript
{
    summary: {
        themes: string[],
        errors: string[],
        toolsUsed: {tool: string, count: number}[],
        successRate: number
    },
    traces: TraceData[]
}
```

### Integration Points

1. **MLflow Integration:**
   - Direct connection using MLflow client
   - Query experiment 2178582188830602
   - Sort by timestamp descending
   - Limit results based on user input

2. **Model Serving Integration:**
   - Endpoint: 'databricks-claude-sonnet-4'
   - Format traces into prompt for analysis
   - Handle response parsing

## Implementation Plan

### Phase 1: Core Features

#### Step 1: Backend API Development
1. Create `/api/traces/summarize` endpoint in `server/routers/traces.py`
2. Implement MLflow trace fetching service
3. Create model serving integration for Claude
4. Add proper error handling and logging

#### Step 2: Frontend UI Development
1. Replace WelcomePage with TraceSummaryPage
2. Create beautiful gradient background with mesh gradient
3. Build input card with glass-morphism effect
4. Implement loading skeletons and animations
5. Create expandable trace table with modern styling

#### Step 3: Polish & Animation
1. Add Framer Motion page transitions
2. Implement smooth number counting animation
3. Add success animation when summary loads
4. Create subtle hover effects and micro-interactions
5. Add gradient border animations on cards

### Phase 2: Advanced Features (Future)
- Real-time trace updates
- Export functionality
- Multiple experiment support

### Phase 3: Optimization (Future)
- Response caching
- Pagination for large trace sets
- Performance monitoring

## Development Workflow

### Files to Create/Modify

**Backend:**
- ADD `server/routers/traces.py` - New API endpoints
- ADD `server/services/mlflow_service.py` - MLflow integration
- ADD `server/services/model_serving_service.py` - Claude integration
- MODIFY `server/app.py` - Register new router

**Frontend:**
- REPLACE `client/src/pages/WelcomePage.tsx` with `TraceSummaryPage.tsx`
- ADD `client/src/components/TraceSummary.tsx` - Summary display component
- ADD `client/src/components/TraceTable.tsx` - Trace list component
- ADD `client/src/components/LoadingAnimation.tsx` - Beautiful skeleton
- MODIFY `client/src/App.tsx` - Update routing
- ADD custom CSS animations in `client/src/index.css`

### UI/UX Design Details

**Color Palette:**
- Primary gradient: Purple to Blue (#8B5CF6 → #3B82F6)
- Background: Dark with subtle mesh gradient
- Glass cards: White/10 with backdrop blur
- Success: Emerald green accents
- Error: Soft red tones

**Animations:**
- Page load: Fade in with slight scale
- Cards: Hover lift with shadow
- Summary appear: Slide down with fade
- Loading: Pulse with gradient shimmer
- Success: Confetti or sparkle effect

**Typography:**
- Headers: Bold with gradient text
- Body: Clean, readable with good contrast
- Monospace for trace IDs and technical data

### Testing Strategy
- Test MLflow connection with actual experiment
- Verify model endpoint formatting
- Ensure graceful error handling
- Test with various trace counts
- Verify animation performance

### Deployment Considerations
- Ensure MLflow credentials are available
- Verify model serving endpoint access
- Set appropriate timeout values
- Monitor for rate limits