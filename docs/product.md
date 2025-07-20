# Product Requirements Document - Trace Summary Dashboard

## Executive Summary
A simple web dashboard that loads the most recent traces from an MLflow experiment and uses Claude Sonnet to summarize common themes and patterns. Users can specify how many traces to analyze and get an AI-generated summary with a single click.

## Target Users
- ML Engineers and Data Scientists who need quick insights into their MLflow experiment traces
- Anyone monitoring MLflow experiments who wants to understand patterns without manually reviewing individual traces

## Core Features

### 1. Trace Count Input
- Simple number input field
- User specifies how many recent traces to load
- Default value: 20 traces

### 2. Load & Summarize Action  
- Single "Summarize" button
- Fetches the N most recent traces from MLflow experiment ID: 2178582188830602
- Sends traces to Claude Sonnet endpoint for analysis

### 3. Trace Display
- Basic list/table showing loaded traces
- Displays whatever trace information is readily available
- Sorted by timestamp (most recent first)

### 4. AI Summary Section
- Shows Claude's analysis at the top of the page
- Includes:
  - Common themes across traces
  - Error patterns (if any)
  - Which tools/functions were frequently called
- Simple, readable format

## User Stories

### Story 1: Quick Trace Analysis
**As a** ML Engineer  
**I want to** quickly see what's happening in my recent experiment traces  
**So that** I can understand patterns without reviewing traces individually

**Acceptance Criteria:**
- I can enter a number of traces to analyze
- I click one button to load and summarize
- I see a clear summary of themes and patterns

### Story 2: Error Pattern Detection
**As a** Data Scientist  
**I want to** see if there are common errors in my traces  
**So that** I can quickly identify and fix issues

**Acceptance Criteria:**
- The summary highlights any error patterns found
- I can see which traces had errors

## Success Metrics
- Time to get insights reduced from minutes of manual review to seconds
- User can understand experiment behavior at a glance

## Implementation Priority

### Phase 1: MVP (Core Functionality)
1. Basic UI with input field and button
2. MLflow trace fetching for experiment 2178582188830602
3. Integration with Claude Sonnet endpoint
4. Display traces and summary

### Future Considerations (Not for MVP)
- Multiple experiment support
- More filtering options
- Summary history
- Export functionality

## Technical Constraints
- Must use MLflow experiment ID: 2178582188830602
- Must use 'databricks-claude-sonnet-4' model serving endpoint
- Keep the UI simple and clean